"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_V1 } from "../lib/api";

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
  if (!getToken()) localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
};

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
}

type CartResponse = { data: { success?: boolean; data?: BackendCart } };

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

  // An expired or revoked session: drop it and fall back to an empty guest cart
  // instead of showing a cart the server will refuse at checkout.
  const endSession = useCallback(() => {
    localStorage.removeItem("heedy_user");
    setCartItems(readGuestCart());
  }, []);

  // Adopt the server's cart (the response of every cart call) as the truth.
  const adopt = useCallback((data?: BackendCart) => {
    if (data?.items) setCartItems(mapBackendItems(data.items));
  }, []);

  // Fetch the authenticated user's cart from the backend and adopt it as source of truth.
  const refreshCart = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await axios.get<CartResponse["data"]>(`${API_V1}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) adopt(res.data.data);
    } catch (err) {
      if (isUnauthorized(err)) endSession();
      else console.error("Failed to refresh cart from backend", err);
    }
  }, [adopt, endSession]);

  // Called right after login: merge the guest cart into the DB cart once, then adopt the result.
  const syncCartAfterLogin = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    const guestItems = readGuestCart();
    // Remove before the request so a retry or reload can never merge it twice.
    localStorage.removeItem(GUEST_CART_KEY);

    try {
      if (guestItems.length > 0) {
        const res = await axios.post(
          `${API_V1}/cart/merge`,
          {
            items: guestItems.map((i) => ({
              productId: i.id,
              quantity: i.quantity,
              size: i.size,
            })),
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success && res.data.data?.items) {
          adopt(res.data.data);
          return;
        }
      }
      // No guest items (or merge returned nothing) — just pull the saved cart.
      await refreshCart();
    } catch (err) {
      console.error("Failed to sync cart after login", err);
      await refreshCart();
    }
  }, [adopt, refreshCart]);

  // On first mount / browser refresh: restore from backend if logged in, else from localStorage.
  useEffect(() => {
    const initCart = async () => {
      if (getToken()) {
        // A signed-in browser has no business holding a local copy (older
        // versions stored one, which later got merged in again).
        localStorage.removeItem(GUEST_CART_KEY);
        await refreshCart();
      } else {
        setCartItems(readGuestCart());
      }
    };
    initCart();
  }, [refreshCart]);

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
        const newQty = existing.quantity + item.quantity;
        newCart = prev.map((i) =>
          i.id === item.id && i.size === item.size ? { ...i, quantity: newQty } : i
        );
      } else {
        newCart = [...prev, item];
      }
      writeGuestCart(newCart);
      return newCart;
    });

    await sendToServer((headers) =>
      axios.post(`${API_V1}/cart`, { productId: item.id, quantity: item.quantity, size: item.size }, { headers })
    );
  };

  const updateQuantity = async (id: string, qty: number, size?: string) => {
    if (qty < 1) return;
    setCartItems((prev) => {
      const newCart = prev.map((i) =>
        i.id === id && i.size === size ? { ...i, quantity: qty } : i
      );
      writeGuestCart(newCart);
      return newCart;
    });

    await sendToServer((headers) =>
      axios.put(`${API_V1}/cart/item`, { productId: id, quantity: qty, size }, { headers })
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
    localStorage.removeItem(GUEST_CART_KEY);
    await sendToServer((headers) => axios.delete(`${API_V1}/cart`, { headers }));
  };

  // Clears local state only, leaving the DB cart intact. Use on logout, and
  // after a paid order (the server empties the DB cart itself).
  const clearLocalCart = () => {
    setCartItems([]);
    localStorage.removeItem(GUEST_CART_KEY);
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
