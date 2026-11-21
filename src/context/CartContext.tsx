"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_V1 } from "../lib/api";
import { useToast } from "./ToastContext";

export interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  currency: string;
  size?: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (id: string, qty: number, size?: string) => void;
  removeItem: (id: string, size?: string) => void;
  clearCart: () => void;
  clearLocalCart: () => void;
  refreshCart: () => Promise<void>;
  syncCartAfterLogin: () => Promise<void>;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * localStorage holds the GUEST cart only. A signed-in cart lives on the server;
 * copying it here used to make every later sign-in merge it into itself again,
 * doubling quantities.
 */
const GUEST_CART_KEY = "heedy_cart";
/**
 * The guest cart's own id, sent with the sign-in merge. The server applies a
 * given id once, so the guest cart can be kept until the merge is confirmed
 * (and retried if it failed) without ever being added twice.
 */
const GUEST_CART_ID_KEY = "heedy_cart_id";

/** Checkout takes at most 20 of one piece per line; the bag never holds more. */
export const MAX_PER_LINE = 20;
/** The most lines one merge or quote request may carry (the API's limit). */
const MAX_LINES = 50;

// ── Module-level helpers (no component state, safe to hoist) ──
const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("heedy_user");
    if (userStr) {
      try {
        return JSON.parse(userStr).token ?? null;
      } catch {
        return null;
      }
    }
  }
  return null;
};

const readGuestCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeGuestCart = (items: CartItem[]) => {
  if (getToken()) return;
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  if (!localStorage.getItem(GUEST_CART_ID_KEY)) localStorage.setItem(GUEST_CART_ID_KEY, crypto.randomUUID());
};

const clearGuestStorage = () => {
  localStorage.removeItem(GUEST_CART_KEY);
  localStorage.removeItem(GUEST_CART_ID_KEY);
};

/** A guest cart waiting to be merged into the account it signed in to. */
const hasPendingMerge = () => readGuestCart().length > 0 && !!localStorage.getItem(GUEST_CART_ID_KEY);

const toRequestLines = (items: CartItem[]) =>
  items.slice(0, MAX_LINES).map((i) => ({ productId: i.id, quantity: Math.min(MAX_PER_LINE, i.quantity), size: i.size }));

const isUnauthorized = (err: unknown) => axios.isAxiosError(err) && err.response?.status === 401;

interface BackendVariant {
  volume: string;
  price: number;
  images?: string[];
}

interface BackendCart {
  items: {
    product: { _id: string; name: string; images?: string[]; variants?: BackendVariant[] } | null;
    quantity: number;
    size?: string;
  }[];
  /** Pieces the server just took out because they can no longer be bought. */
  removed?: string[];
}

type CartResponse = { data: { success?: boolean; data?: BackendCart } };

interface QuoteLine {
  productId: string;
  size?: string;
  name: string | null;
  image?: string;
  price?: number;
  quantity?: number;
  available: boolean;
}

// Map a populated backend cart (items.product) into frontend CartItem shape.
const mapBackendItems = (items: BackendCart["items"]): CartItem[] =>
  items
    .filter((item) => item?.product) // drop lines whose product was deleted
    .map((item) => {
      const product = item.product!;
      const variant =
        product.variants?.find((v) => v.volume === item.size) ||
        product.variants?.[0];

      // Prefer a product-level image, then the chosen variant's image, then any
      // variant image — so products photographed only per-variant still show a
      // cart/checkout thumbnail.
      const image =
        product.images?.[0] ||
        variant?.images?.[0] ||
        product.variants?.map((v) => v.images?.[0]).find(Boolean) ||
        "";

      return {
        id: product._id,
        name: product.name,
        image,
        price: variant?.price || 0,
        currency: "₹",
        size: variant?.volume || item.size,
        quantity: item.quantity,
      };
    });

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { showToast } = useToast();

  // Pieces dropped because they can no longer be bought are named, never lost silently.
  const announceRemoved = useCallback(
    (names?: (string | null)[]) => {
      const list = [...new Set((names || []).filter(Boolean))] as string[];
      if (list.length === 0) return;
      showToast(
        `${list.join(", ")} ${list.length === 1 ? "is" : "are"} no longer available and ${list.length === 1 ? "was" : "were"} removed from your bag.`,
        "warning"
      );
    },
    [showToast]
  );

  // An expired or revoked session: drop it and fall back to the guest cart
  // instead of showing a cart the server will refuse at checkout.
  const endSession = useCallback(() => {
    localStorage.removeItem("heedy_user");
    setCartItems(readGuestCart());
  }, []);

  // Adopt the server's cart (the response of every cart call) as the truth.
  const adopt = useCallback(
    (data?: BackendCart) => {
      if (data?.items) setCartItems(mapBackendItems(data.items));
      announceRemoved(data?.removed);
    },
    [announceRemoved]
  );

  // A guest's bag at today's prices: the server reads the catalogue (nothing
  // is stored) and pieces that can no longer be bought are taken out.
  const quoteGuestCart = useCallback(async () => {
    const items = readGuestCart();
    if (items.length === 0) return;
    const sent = JSON.stringify(items);
    try {
      const res = await axios.post<{ success?: boolean; data?: { items: QuoteLine[] } }>(`${API_V1}/cart/quote`, {
        items: toRequestLines(items),
      });
      // The shopper changed the bag while this was in flight: keep their change.
      if (!res.data.success || !res.data.data || getToken() || localStorage.getItem(GUEST_CART_KEY) !== sent) return;

      const lines = new Map<string, CartItem>();
      const gone: (string | null)[] = [];
      for (const q of res.data.data.items) {
        if (!q.available) {
          gone.push(q.name);
          continue;
        }
        const key = `${q.productId}__${q.size ?? ""}`;
        const existing = lines.get(key);
        if (existing) existing.quantity = Math.min(MAX_PER_LINE, existing.quantity + (q.quantity || 1));
        else
          lines.set(key, {
            id: q.productId,
            name: q.name || "",
            image: q.image || "",
            price: q.price || 0,
            currency: "₹",
            size: q.size,
            quantity: q.quantity || 1,
          });
      }
      const fresh = [...lines.values()];
      writeGuestCart(fresh);
      setCartItems(fresh);
      announceRemoved(gone);
    } catch (err) {
      // Offline or the API is waking up: keep showing the bag as saved.
      console.error("Couldn't refresh bag prices", err);
    }
  }, [announceRemoved]);

  // The signed-in cart from the server, or the guest bag at current prices.
  const refreshCart = useCallback(async () => {
    const token = getToken();
    if (!token) return quoteGuestCart();
    try {
      const res = await axios.get<CartResponse["data"]>(`${API_V1}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) adopt(res.data.data);
    } catch (err) {
      if (isUnauthorized(err)) endSession();
      else console.error("Failed to refresh cart from backend", err);
    }
  }, [adopt, endSession, quoteGuestCart]);

  /**
   * Right after sign-in: merge the guest bag into the account's cart, then show
   * the result. The guest bag is forgotten only once the server has it; if the
   * merge fails it stays (with its id) and is retried on the next page load or
   * when the tab regains focus — the id makes a repeat add nothing twice.
   */
  const syncCartAfterLogin = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    const guestItems = readGuestCart();
    if (guestItems.length === 0) {
      clearGuestStorage();
      await refreshCart();
      return;
    }
    let mergeId = localStorage.getItem(GUEST_CART_ID_KEY);
    if (!mergeId) {
      mergeId = crypto.randomUUID();
      localStorage.setItem(GUEST_CART_ID_KEY, mergeId);
    }

    try {
      const res = await axios.post(
        `${API_V1}/cart/merge`,
        { items: toRequestLines(guestItems), mergeId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Only now is it safe to forget the guest bag: the account holds it.
      clearGuestStorage();
      if (res.data.success && res.data.data?.items) adopt(res.data.data);
      else await refreshCart();
    } catch (err) {
      if (isUnauthorized(err)) {
        endSession();
        return;
      }
      console.error("Failed to merge the guest bag; it is kept and will be retried", err);
      await refreshCart();
    }
  }, [adopt, endSession, refreshCart]);

  // On first mount / browser refresh: restore from backend if logged in, else from localStorage.
  useEffect(() => {
    const initCart = async () => {
      if (getToken()) {
        // A guest bag left from a sign-in whose merge didn't complete: retry it.
        if (hasPendingMerge()) {
          await syncCartAfterLogin();
          return;
        }
        // Any other local copy is from an older version, which kept the
        // signed-in cart here too; merging it would double those quantities.
        clearGuestStorage();
        await refreshCart();
      } else {
        setCartItems(readGuestCart());
        await quoteGuestCart();
      }
    };
    initCart();
  }, [refreshCart, syncCartAfterLogin, quoteGuestCart]);

  // Other tabs: a guest bag edited elsewhere, or a sign-in / sign-out there,
  // shows up here at once. Coming back to a signed-in tab re-reads the saved cart.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === GUEST_CART_KEY && !getToken()) setCartItems(readGuestCart());
      if (e.key === "heedy_user") {
        if (getToken()) void refreshCart();
        else setCartItems(readGuestCart());
      }
    };
    const onFocus = () => {
      if (!getToken()) return;
      void (hasPendingMerge() ? syncCartAfterLogin() : refreshCart());
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, [refreshCart, syncCartAfterLogin]);

  // Signed-in changes go to the server; its answer replaces the optimistic
  // local state, and any failure re-reads the server cart.
  const sendToServer = async (request: (headers: { Authorization: string }) => Promise<CartResponse>) => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await request({ Authorization: `Bearer ${token}` });
      if (res.data?.success) adopt(res.data.data);
    } catch (err) {
      if (isUnauthorized(err)) endSession();
      else {
        if (axios.isAxiosError(err) && err.response?.data?.message) showToast(err.response.data.message, "warning");
        console.error("Cart update failed; reloading the saved cart", err);
        await refreshCart();
      }
    }
  };

  const addToCart = async (item: CartItem) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.size === item.size);
      let newCart;
      if (existing) {
        const newQty = Math.min(MAX_PER_LINE, existing.quantity + item.quantity);
        newCart = prev.map((i) =>
          i.id === item.id && i.size === item.size ? { ...i, quantity: newQty } : i
        );
      } else {
        newCart = [...prev, { ...item, quantity: Math.min(MAX_PER_LINE, item.quantity) }];
      }
      writeGuestCart(newCart);
      return newCart;
    });

    await sendToServer((headers) =>
      axios.post(`${API_V1}/cart`, { productId: item.id, quantity: Math.min(MAX_PER_LINE, item.quantity), size: item.size }, { headers })
    );
  };

  const updateQuantity = async (id: string, qty: number, size?: string) => {
    if (qty < 1) return;
    const quantity = Math.min(MAX_PER_LINE, qty);
    setCartItems((prev) => {
      const newCart = prev.map((i) =>
        i.id === id && i.size === size ? { ...i, quantity } : i
      );
      writeGuestCart(newCart);
      return newCart;
    });

    await sendToServer((headers) =>
      axios.put(`${API_V1}/cart/item`, { productId: id, quantity, size }, { headers })
    );
  };

  const removeItem = async (id: string, size?: string) => {
    setCartItems((prev) => {
      // Same piece in another size is a different line.
      const newCart = prev.filter((i) => !(i.id === id && i.size === size));
      writeGuestCart(newCart);
      return newCart;
    });

    await sendToServer((headers) =>
      axios.delete(`${API_V1}/cart/item`, { headers, data: { productId: id, size } })
    );
  };

  // Clears everywhere — local + backend.
  const clearCart = async () => {
    setCartItems([]);
    clearGuestStorage();
    await sendToServer((headers) => axios.delete(`${API_V1}/cart`, { headers }));
  };

  // Clears local state only, leaving the DB cart intact. Use on logout, and
  // after a paid order (the server empties the DB cart itself).
  const clearLocalCart = () => {
    setCartItems([]);
    clearGuestStorage();
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        clearLocalCart,
        refreshCart,
        syncCartAfterLogin,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
