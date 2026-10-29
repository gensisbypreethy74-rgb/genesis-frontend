"use client";

import { useState, useEffect, useEffectEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { X } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { useCart } from "../../context/CartContext";
import { Button } from "../../components/ui/Button";
import Reveal from "../../components/ui/Reveal";
import Breadcrumbs from "../../components/common/Breadcrumbs";
import { API_V1 } from "../../lib/api";
import { cldOptimize } from "../../lib/image";

interface UserProfile {
  name: string;
  email: string;
  _id: string;
  token?: string;
  phone?: string;
}

interface Address {
  _id: string;
  street?: string;
  apartment?: string;
  landmark?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

interface OrderItem {
  /** Populated product; null once the piece is deleted. */
  product?: { name?: string; images?: string[] } | null;
  /** Snapshots taken at purchase. Older orders may lack name/image. */
  name?: string;
  image?: string;
  size?: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  createdAt: string;
  total: number;
  orderStatus: string;
  items: OrderItem[];
}

/** The API's own message for a failed request, else `fallback`. */
const apiError = (err: unknown, fallback: string): string =>
  (axios.isAxiosError(err) && err.response?.data?.message) || fallback;

const isUnauthorized = (err: unknown) =>
  axios.isAxiosError(err) && err.response?.status === 401;

/**
 * Overlay + panel for the account modals: a labelled dialog that takes focus
 * when it opens, closes on Escape, and hands focus back to whatever opened it.
 */
function Modal({
  titleId,
  onClose,
  className,
  children,
}: {
  titleId: string;
  onClose: () => void;
  className: string;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const close = useEffectEvent(onClose);

  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const panel = panelRef.current;
    // First field if there is one, else the first button (Cancel on the confirm).
    (panel?.querySelector<HTMLElement>("input") ?? panel?.querySelector<HTMLElement>("button"))?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative bg-ivory border border-line w-full shadow-xl ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { clearLocalCart } = useCart();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "addresses">("overview");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [newAddressForm, setNewAddressForm] = useState({
    street: "",
    apartment: "",
    landmark: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
  });
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({
    name: "",
    phone: "",
  });

  const handleSignOut = () => {
    // Revoke the session on the server first — best-effort, so a network
    // failure never traps anyone in their account.
    if (user?.token) {
      axios
        .post(`${API_V1}/auth/logout`, {}, { headers: { Authorization: `Bearer ${user.token}` } })
        .catch(() => {});
    }
    // Clear local session + cart state only. The DB cart is left intact so it
    // restores on the next login (and stays available on other devices).
    localStorage.removeItem("heedy_user");
    clearLocalCart();
    router.push("/sign-in");
  };

  // Called from the fetch effect below without making it re-run on every render.
  const onSessionExpired = useEffectEvent(() => {
    handleSignOut();
    showToast("Session expired. Please sign in again.", "error");
  });

  useEffect(() => {
    // The session comes from this browser's storage only — never from a
    // `?token=` in the URL, which let a link sign a visitor into someone
    // else's account.
    const loadSession = async () => {
      const savedUser = localStorage.getItem("heedy_user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        // Not logged in, redirect to sign-in
        router.push("/sign-in");
      }
      setLoading(false);
    };

    loadSession();
  }, [router]);

  useEffect(() => {
    if (activeTab === "addresses" && user?.token) {
      const fetchAddresses = async () => {
        try {
          const res = await axios.get(`${API_V1}/users/addresses`, {
            headers: { 'Authorization': `Bearer ${user.token}` }
          });
          if (res.data.success && res.data.data) {
            setAddresses(res.data.data);
          }
        } catch (err) {
          console.error("Failed to fetch addresses", err);
          if (isUnauthorized(err)) onSessionExpired();
        }
      };
      fetchAddresses();
    }

    if (user?.token && (activeTab === "orders" || activeTab === "overview")) {
      const fetchOrders = async () => {
        try {
          const res = await axios.get(`${API_V1}/payments/myorders`, {
            headers: { 'Authorization': `Bearer ${user.token}` }
          });
          if (res.data.success) {
            setOrders(res.data.data);
          }
        } catch (err) {
          console.error("Failed to fetch orders", err);
          if (isUnauthorized(err)) onSessionExpired();
        }
      };
      fetchOrders();
    }
  }, [activeTab, user]);

  const validateAddressForm = () => {
    const errors: Record<string, string> = {};
    if (!newAddressForm.city.trim()) errors.city = "City is required.";
    if (!newAddressForm.state.trim()) errors.state = "State is required.";
    if (!newAddressForm.zip.trim()) errors.zip = "PIN code is required.";
    else if (!/^\d{5,6}$/.test(newAddressForm.zip.trim())) errors.zip = "Enter a valid 5-6 digit PIN code.";
    if (newAddressForm.street.trim() && newAddressForm.street.trim().length < 3) errors.street = "Street must be at least 3 characters.";
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveAddress = async () => {
    if (!validateAddressForm()) return;
    setIsSavingAddress(true);

    try {
      if (!user?.token) return;

      const payload = {
        street: newAddressForm.street,
        apartment: newAddressForm.apartment,
        landmark: newAddressForm.landmark,
        city: newAddressForm.city,
        state: newAddressForm.state,
        zipCode: newAddressForm.zip,
        country: newAddressForm.country
      };

      let res;
      if (editingAddressId) {
        res = await axios.put(`${API_V1}/users/addresses/${editingAddressId}`, payload, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          }
        });
      } else {
        res = await axios.post(`${API_V1}/users/addresses`, payload, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          }
        });
      }

      if (res.data.success) {
        setAddresses(res.data.data);
        setIsAddressModalOpen(false);
        setEditingAddressId(null);
        setNewAddressForm({ street: "", apartment: "", landmark: "", city: "", state: "", zip: "", country: "India" });
        setAddressErrors({});
      } else {
        showToast(res.data.message || "Failed to save address", "error");
      }
    } catch (err) {
      console.error(err);
      showToast(apiError(err, "Error saving address"), "error");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      if (!user?.token) return;

      const res = await axios.delete(`${API_V1}/users/addresses/${addressId}`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.data.success) {
        setAddresses(res.data.data);
      }
    } catch (err) {
      console.error(err);
      showToast(apiError(err, "Error removing address"), "error");
    }
  };

  const handleEditProfileClick = () => {
    if (user) {
      setEditProfileForm({
        name: user.name || "",
        phone: user.phone || "",
      });
      setIsEditProfileOpen(true);
    }
  };

  const handleSaveProfile = async () => {
    if (!editProfileForm.name.trim()) {
      showToast("Name is required", "error");
      return;
    }

    setIsSavingProfile(true);
    try {
      if (!user?.token) return;

      const payload = {
        name: editProfileForm.name,
        phone: editProfileForm.phone
      };

      const res = await axios.put(`${API_V1}/users/profile`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (res.data.success) {
        const updatedUser = { ...user, ...res.data.data, token: user.token };
        setUser(updatedUser);
        localStorage.setItem("heedy_user", JSON.stringify(updatedUser));
        setIsEditProfileOpen(false);
        showToast("Profile updated successfully", "success");
      }
    } catch (err) {
      console.error(err);
      showToast(apiError(err, "Error updating profile"), "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center pt-[84px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-ink/40"></div>
      </div>
    );
  }

  if (!user) return null; // Will redirect

  // Extract initials for the avatar
  const initials = user.name
    ? user.name.charAt(0).toUpperCase()
    : "U";

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "orders", label: "My Orders" },
    { key: "addresses", label: "Addresses" },
  ] as const;

  const statusTone = (status: string) =>
    status === "delivered"
      ? "text-forest"
      : status === "processing"
      ? "text-bronze-deep"
      : "text-muted";

  const formatDate = (d: string) =>
    `${String(new Date(d).getDate()).padStart(2, "0")}/${String(
      new Date(d).getMonth() + 1
    ).padStart(2, "0")}/${new Date(d).getFullYear()}`;

  return (
    <div className="min-h-screen bg-ivory pt-[84px]">
      <div className="max-w-[1100px] mx-auto px-6 sm:px-10 lg:px-16 py-14 lg:py-20">

        <Breadcrumbs className="mb-8" />

        {/* ── Account header ── */}
        <Reveal>
          <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 pb-10 border-b border-line">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-cream border border-line flex items-center justify-center font-display text-2xl text-ink shrink-0">
                {initials}
              </div>
              <div>
                <p className="eyebrow text-bronze-deep mb-2">Your Account</p>
                <h1 className="font-display font-light text-[clamp(1.9rem,4vw,3rem)] leading-[1.08] text-ink">
                  Good to see you, {user.name.split(" ")[0]}.
                </h1>
                <p className="font-sans text-sm text-muted mt-2 truncate">
                  {user.email}
                  {user.phone ? ` · ${user.phone}` : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 shrink-0">
              <Button variant="outline" size="sm" arrow={false} onClick={handleEditProfileClick}>
                Edit Profile
              </Button>
              <button
                onClick={handleSignOut}
                className="font-sans text-xs uppercase tracking-[0.18em] text-muted hover:text-ink transition-colors"
              >
                Sign Out
              </button>
            </div>
          </header>
        </Reveal>

        {/* ── Tab navigation ── */}
        <nav className="flex gap-8 sm:gap-10 border-b border-line mt-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative py-5 font-sans text-[11px] uppercase tracking-[0.18em] transition-colors ${
                activeTab === tab.key ? "text-ink" : "text-faint hover:text-muted"
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute left-0 -bottom-px h-px w-full bg-ink" />
              )}
            </button>
          ))}
        </nav>

        {/* ── Content ── */}
        <div className="max-w-3xl pt-12">
          {activeTab === "overview" && (
            <div className="flex flex-col gap-12">
              {/* Profile completion note */}
              {!user.phone && (
                <Reveal className="bg-cream border border-line p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5">
                  <div className="flex-1">
                    <p className="eyebrow text-bronze-deep mb-2">Complete your profile</p>
                    <p className="font-sans text-sm text-muted leading-relaxed">
                      Add a phone number so we can reach you about deliveries and
                      order updates.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" arrow={false} onClick={handleEditProfileClick} className="shrink-0">
                    Add Number
                  </Button>
                </Reveal>
              )}

              {/* Total orders */}
              <Reveal delay={0.05} className="bg-cream border border-line p-8">
                <p className="eyebrow text-bronze-deep mb-4">Total Orders</p>
                <p className="font-display font-light text-5xl text-ink leading-none">
                  {orders.length}
                </p>
              </Reveal>

              {/* Recent activity */}
              <Reveal delay={0.1}>
                <p className="eyebrow text-bronze-deep mb-6">Recent Activity</p>
                {orders.length > 0 ? (
                  <div className="flex flex-col divide-y divide-line border-y border-line">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order._id} className="flex items-center justify-between py-5">
                        <div>
                          <p className="font-sans text-sm text-ink">
                            Order #{order._id.substring(0, 8)}
                          </p>
                          <p className="font-sans text-xs text-faint mt-1">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-lg text-ink">₹{order.total}</p>
                          <span className={`font-sans text-[10px] uppercase tracking-[0.15em] ${statusTone(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="font-sans text-sm text-muted">No recent orders found.</p>
                )}
              </Reveal>
            </div>
          )}

          {activeTab === "orders" && (
            <div>
              <p className="eyebrow text-bronze-deep mb-2">History</p>
              <h2 className="font-display font-light text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[1.1] text-ink mb-10">
                My Orders
              </h2>

              {orders.length > 0 ? (
                <div className="flex flex-col gap-8">
                  {[...orders].sort((a, b) => {
                    const aIsDone = a.orderStatus === 'delivered' || a.orderStatus === 'cancelled';
                    const bIsDone = b.orderStatus === 'delivered' || b.orderStatus === 'cancelled';
                    if (aIsDone && !bIsDone) return 1;
                    if (!aIsDone && bIsDone) return -1;
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                  }).map((order) => (
                    <div key={order._id} className={`bg-cream border border-line overflow-hidden ${(order.orderStatus === 'delivered' || order.orderStatus === 'cancelled') ? 'opacity-70' : ''}`}>
                      <div className="border-b border-line p-6 sm:px-8 flex flex-wrap items-center justify-between gap-6">
                        <div>
                          <p className="eyebrow text-faint mb-1">Order Placed</p>
                          <p className="font-sans text-sm text-ink">{formatDate(order.createdAt)}</p>
                        </div>
                        <div>
                          <p className="eyebrow text-faint mb-1">Total</p>
                          <p className="font-sans text-sm text-ink">₹{order.total}</p>
                        </div>
                        <div>
                          <p className="eyebrow text-faint mb-1">Order ID</p>
                          <p className="font-sans text-sm text-ink">#{order._id.substring(0, 8)}</p>
                        </div>
                        <div className="flex-1 text-right min-w-[100px]">
                          <span className={`font-sans text-[10px] uppercase tracking-[0.15em] ${statusTone(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>
                        </div>
                      </div>
                      <div className="p-6 sm:p-8">
                        <div className="flex flex-col gap-4">
                          {order.items.map((item, idx) => {
                            // Purchase-time snapshots win; older orders fall back to the live product.
                            const name = item.name || item.product?.name;
                            const image = item.image || item.product?.images?.[0];
                            return (
                              <div key={idx} className="flex items-center gap-4 border-b border-line pb-4 last:border-0 last:pb-0">
                                <div className="w-16 h-16 bg-sand shrink-0 overflow-hidden">
                                  {image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={cldOptimize(image, 160)} alt={name || ""} className={`w-full h-full object-cover ${(order.orderStatus === 'delivered' || order.orderStatus === 'cancelled') ? 'grayscale' : ''}`} />
                                  ) : (
                                    <div className="w-full h-full bg-beige" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-display text-lg text-ink leading-tight">{name || 'Product unavailable'}</h4>
                                  <p className="font-sans text-xs text-muted mt-1">
                                    {item.size ? `Size ${item.size} · ` : ""}Qty {item.quantity} · ₹{item.price}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-sans text-sm text-muted">You have no orders yet.</p>
              )}
            </div>
          )}

          {activeTab === "addresses" && (
            <div className="flex flex-col">
              <div className="mb-10">
                <p className="eyebrow text-bronze-deep mb-2">Delivery</p>
                <h2 className="font-display font-light text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[1.1] text-ink mb-2">
                  Shipping Addresses
                </h2>
                <p className="font-sans text-sm text-muted max-w-sm">
                  Manage your delivery locations for a faster checkout.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {addresses.map((addr, idx) => (
                  <div key={addr._id || idx} className="bg-cream border border-line p-8 relative">
                    <p className="eyebrow text-bronze-deep mb-4">Address {idx + 1}</p>
                    <div className="font-sans text-sm text-muted leading-relaxed mb-6 space-y-0.5">
                      {addr.street && <p>{addr.street}</p>}
                      {addr.apartment && <p>{addr.apartment}</p>}
                      {addr.landmark && <p>Landmark: {addr.landmark}</p>}
                      <p>{addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.zipCode}</p>
                      <p>{addr.country}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => {
                          setNewAddressForm({
                            street: addr.street || "",
                            apartment: addr.apartment || "",
                            landmark: addr.landmark || "",
                            city: addr.city || "",
                            state: addr.state || "",
                            zip: addr.zipCode || "",
                            country: addr.country || "India"
                          });
                          setEditingAddressId(addr._id);
                          setIsAddressModalOpen(true);
                        }}
                        className="link-underline font-sans text-xs uppercase tracking-[0.15em] text-ink"
                      >
                        Edit Details
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(addr._id)}
                        className="font-sans text-xs uppercase tracking-[0.15em] text-muted hover:text-ink transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => {
                    setNewAddressForm({ street: "", apartment: "", landmark: "", city: "", state: "", zip: "", country: "India" });
                    setEditingAddressId(null);
                    setIsAddressModalOpen(true);
                  }}
                  className="border border-dashed border-line p-8 w-full flex items-center justify-center font-sans text-xs uppercase tracking-[0.18em] text-muted hover:text-ink hover:border-ink/30 hover:bg-cream transition-colors"
                >
                  Add New Shipping Location
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── New Address Modal ── */}
      {isAddressModalOpen && (
        <Modal
          titleId="address-modal-title"
          onClose={() => setIsAddressModalOpen(false)}
          className="max-w-lg flex flex-col overflow-hidden max-h-[90vh]"
        >
            <div className="flex items-center justify-between p-6 sm:p-8 border-b border-line">
              <div>
                <p className="eyebrow text-bronze-deep mb-1">Delivery</p>
                <h2 id="address-modal-title" className="font-display font-light text-2xl text-ink">
                  {editingAddressId ? "Edit Shipping Address" : "New Shipping Address"}
                </h2>
              </div>
              <button
                onClick={() => setIsAddressModalOpen(false)}
                aria-label="Close"
                className="w-9 h-9 flex items-center justify-center rounded-full border border-line text-muted hover:text-ink hover:border-ink/30 transition-colors focus:outline-none"
              >
                <X size={16} aria-hidden />
              </button>
            </div>

            <div className="p-6 sm:p-8 flex flex-col gap-5 overflow-y-auto">
              <div>
                <label htmlFor="address-street" className="block font-sans text-xs uppercase tracking-[0.15em] text-muted mb-2">Street Address</label>
                <input
                  id="address-street"
                  type="text"
                  value={newAddressForm.street}
                  onChange={(e) => { setNewAddressForm({ ...newAddressForm, street: e.target.value }); setAddressErrors(prev => ({ ...prev, street: '' })); }}
                  placeholder="e.g. 12 Marine Drive"
                  className={`w-full bg-cream border px-4 py-3 text-base text-ink focus:outline-none focus:border-ink placeholder:text-faint transition-colors ${addressErrors.street ? 'border-ink ring-1 ring-ink/20' : 'border-line'}`}
                />
                {addressErrors.street && <p className="text-bronze-deep text-xs mt-1.5">{addressErrors.street}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="address-apartment" className="block font-sans text-xs uppercase tracking-[0.15em] text-muted mb-2">Apartment, suite <span className="text-faint normal-case tracking-normal">(optional)</span></label>
                  <input
                    id="address-apartment"
                    type="text"
                    value={newAddressForm.apartment}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, apartment: e.target.value })}
                    placeholder="e.g. Apt 4B"
                    className="w-full bg-cream border border-line px-4 py-3 text-base text-ink focus:outline-none focus:border-ink placeholder:text-faint transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="address-landmark" className="block font-sans text-xs uppercase tracking-[0.15em] text-muted mb-2">Landmark <span className="text-faint normal-case tracking-normal">(optional)</span></label>
                  <input
                    id="address-landmark"
                    type="text"
                    value={newAddressForm.landmark}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, landmark: e.target.value })}
                    placeholder="e.g. Near the temple"
                    className="w-full bg-cream border border-line px-4 py-3 text-base text-ink focus:outline-none focus:border-ink placeholder:text-faint transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="address-city" className="block font-sans text-xs uppercase tracking-[0.15em] text-muted mb-2">City <span className="text-bronze-deep">*</span></label>
                  <input
                    id="address-city"
                    type="text"
                    value={newAddressForm.city}
                    onChange={(e) => { setNewAddressForm({ ...newAddressForm, city: e.target.value }); setAddressErrors(prev => ({ ...prev, city: '' })); }}
                    placeholder="Kochi"
                    className={`w-full bg-cream border px-4 py-3 text-base text-ink focus:outline-none focus:border-ink placeholder:text-faint transition-colors ${addressErrors.city ? 'border-ink ring-1 ring-ink/20' : 'border-line'}`}
                  />
                  {addressErrors.city && <p className="text-bronze-deep text-xs mt-1.5">{addressErrors.city}</p>}
                </div>
                <div>
                  <label htmlFor="address-state" className="block font-sans text-xs uppercase tracking-[0.15em] text-muted mb-2">State <span className="text-bronze-deep">*</span></label>
                  <input
                    id="address-state"
                    type="text"
                    value={newAddressForm.state}
                    onChange={(e) => { setNewAddressForm({ ...newAddressForm, state: e.target.value }); setAddressErrors(prev => ({ ...prev, state: '' })); }}
                    placeholder="Kerala"
                    className={`w-full bg-cream border px-4 py-3 text-base text-ink focus:outline-none focus:border-ink placeholder:text-faint transition-colors ${addressErrors.state ? 'border-ink ring-1 ring-ink/20' : 'border-line'}`}
                  />
                  {addressErrors.state && <p className="text-bronze-deep text-xs mt-1.5">{addressErrors.state}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="address-zip" className="block font-sans text-xs uppercase tracking-[0.15em] text-muted mb-2">PIN Code <span className="text-bronze-deep">*</span></label>
                  <input
                    id="address-zip"
                    type="text"
                    value={newAddressForm.zip}
                    onChange={(e) => { setNewAddressForm({ ...newAddressForm, zip: e.target.value }); setAddressErrors(prev => ({ ...prev, zip: '' })); }}
                    placeholder="682001"
                    className={`w-full bg-cream border px-4 py-3 text-base text-ink focus:outline-none focus:border-ink placeholder:text-faint transition-colors ${addressErrors.zip ? 'border-ink ring-1 ring-ink/20' : 'border-line'}`}
                  />
                  {addressErrors.zip && <p className="text-bronze-deep text-xs mt-1.5">{addressErrors.zip}</p>}
                </div>
                <div>
                  <label htmlFor="address-country" className="block font-sans text-xs uppercase tracking-[0.15em] text-muted mb-2">Country</label>
                  <input
                    id="address-country"
                    type="text"
                    value={newAddressForm.country}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, country: e.target.value })}
                    placeholder="India"
                    className="w-full bg-cream border border-line px-4 py-3 text-base text-ink focus:outline-none focus:border-ink placeholder:text-faint transition-colors"
                  />
                </div>
              </div>

              <Button
                onClick={handleSaveAddress}
                disabled={isSavingAddress}
                variant="solid"
                arrow={false}
                className="w-full mt-4"
              >
                {isSavingAddress ? "Saving..." : "Save Address"}
              </Button>
            </div>
        </Modal>
      )}

      {/* ── Delete Address Confirmation Modal ── */}
      {deleteConfirmId && (
        <Modal
          titleId="delete-address-title"
          onClose={() => setDeleteConfirmId(null)}
          className="max-w-sm p-8 text-center"
        >
            <p className="eyebrow text-bronze-deep mb-3">Please confirm</p>
            <h3 id="delete-address-title" className="font-display font-light text-2xl text-ink mb-3">Remove this address?</h3>
            <p className="font-sans text-sm text-muted mb-8">This address will be permanently removed from your saved locations.</p>
            <div className="flex gap-3">
              <Button
                onClick={() => setDeleteConfirmId(null)}
                variant="outline"
                arrow={false}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  handleDeleteAddress(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                variant="solid"
                arrow={false}
                className="flex-1"
              >
                Remove
              </Button>
            </div>
        </Modal>
      )}

      {/* ── Edit Profile Modal ── */}
      {isEditProfileOpen && (
        <Modal
          titleId="edit-profile-title"
          onClose={() => setIsEditProfileOpen(false)}
          className="max-w-md flex flex-col overflow-hidden"
        >
            <div className="flex items-center justify-between p-6 sm:p-8 border-b border-line">
              <div>
                <p className="eyebrow text-bronze-deep mb-1">Your Account</p>
                <h2 id="edit-profile-title" className="font-display font-light text-2xl text-ink">
                  Edit Profile
                </h2>
              </div>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                aria-label="Close"
                className="w-9 h-9 flex items-center justify-center rounded-full border border-line text-muted hover:text-ink hover:border-ink/30 transition-colors focus:outline-none"
              >
                <X size={16} aria-hidden />
              </button>
            </div>

            <div className="p-6 sm:p-8 flex flex-col gap-6">
              <div>
                <label htmlFor="profile-name" className="block font-sans text-xs uppercase tracking-[0.15em] text-muted mb-2">Full Name <span className="text-bronze-deep">*</span></label>
                <input
                  id="profile-name"
                  type="text"
                  value={editProfileForm.name}
                  onChange={(e) => setEditProfileForm({ ...editProfileForm, name: e.target.value })}
                  placeholder="Your name"
                  className="w-full bg-cream border border-line px-4 py-3 text-base text-ink focus:outline-none focus:border-ink placeholder:text-faint transition-colors"
                />
              </div>

              <div>
                <label htmlFor="profile-phone" className="block font-sans text-xs uppercase tracking-[0.15em] text-muted mb-2">Phone Number</label>
                <input
                  id="profile-phone"
                  type="tel"
                  value={editProfileForm.phone}
                  onChange={(e) => setEditProfileForm({ ...editProfileForm, phone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full bg-cream border border-line px-4 py-3 text-base text-ink focus:outline-none focus:border-ink placeholder:text-faint transition-colors"
                />
                <p className="font-sans text-xs text-faint mt-2">Required for delivery and order updates.</p>
              </div>

              <Button
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                variant="solid"
                arrow={false}
                className="w-full mt-2"
              >
                {isSavingProfile ? "Saving..." : "Save Changes"}
              </Button>
            </div>
        </Modal>
      )}
    </div>
  );
}
