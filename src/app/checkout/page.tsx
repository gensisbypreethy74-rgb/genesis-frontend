"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Breadcrumbs from "../../components/common/Breadcrumbs";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import { Button } from "../../components/ui/Button";
import Reveal from "../../components/ui/Reveal";
import { cldOptimize } from "../../lib/image";
import { API_V1 } from "../../lib/api";

interface SavedAddress {
  _id: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

interface AddressTile {
  id: string;
  name: string;
  line1: string;
  line2?: string;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, cb: (r: unknown) => void) => void };
  }
}

const toTiles = (list: SavedAddress[]): AddressTile[] =>
  list.map((addr) => ({
    id: addr._id,
    name: addr.city?.toLowerCase() || 'Address',
    line1: `${addr.street ? addr.street + ", " : ""}${addr.state?.toLowerCase() || ''}`,
    line2: addr.zipCode,
  }));

const errorMessage = (err: unknown, fallback: string) =>
  (axios.isAxiosError(err) && err.response?.data?.message) || fallback;

// Razorpay's checkout script, added to the page once.
const loadRazorpayScript = () =>
  new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector<HTMLScriptElement>('script[data-razorpay]');
    const script = existing ?? document.createElement("script");
    script.addEventListener("load", () => resolve(true));
    script.addEventListener("error", () => resolve(false));
    if (!existing) {
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.dataset.razorpay = "true";
      document.body.appendChild(script);
    }
  });

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, clearLocalCart, refreshCart } = useCart();
  const { showToast } = useToast();
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addresses, setAddresses] = useState<AddressTile[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [newAddressForm, setNewAddressForm] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
  });
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});

  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

  // Checkout flow step: "shipping" (address) → "payment" (choose how to pay).
  const [step, setStep] = useState<"shipping" | "payment">("shipping");
  const paymentSectionRef = useRef<HTMLDivElement>(null);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Shared helper: the signed-in customer's token, or null.
  const readToken = (): string | null => {
    try {
      return JSON.parse(localStorage.getItem("heedy_user") || "null")?.token ?? null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const token = readToken();
    // Checkout needs an account (orders, addresses and receipts belong to one).
    if (!token) {
      showToast("Please sign in to check out.", "warning");
      router.replace("/sign-in");
      return;
    }
    // Show the bag at today's prices, which is what the server will charge.
    refreshCart();

    const fetchAddresses = async () => {
      try {
        const res = await axios.get(`${API_V1}/users/addresses`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.data.success && res.data.data) {
          const mappedAddresses = toTiles(res.data.data);
          setAddresses(mappedAddresses);
          if (mappedAddresses.length > 0) {
            setSelectedAddressId(mappedAddresses[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch addresses", err);
      }
    };
    fetchAddresses();
    // Runs once on mount; router/toast/cart helpers are stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Escape closes the address dialog.
  useEffect(() => {
    if (!isAddressModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsAddressModalOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isAddressModalOpen]);

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
      const token = readToken();
      if (!token) {
        showToast("Please login to save your address.", "warning");
        setIsSavingAddress(false);
        return;
      }

      const payload = {
        street: newAddressForm.street,
        city: newAddressForm.city,
        state: newAddressForm.state,
        zipCode: newAddressForm.zip,
        country: newAddressForm.country
      };

      const res = await axios.post(`${API_V1}/users/addresses`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.data.success) {
        const mappedAddresses = toTiles(res.data.data);
        setAddresses(mappedAddresses);
        if (mappedAddresses.length > 0) {
          setSelectedAddressId(mappedAddresses[mappedAddresses.length - 1].id);
        }
        setIsAddressModalOpen(false);
        setNewAddressForm({ street: "", city: "", state: "", zip: "", country: "India" });
        setAddressErrors({});
      } else {
        showToast(res.data.message || "Failed to save address", "error");
      }
    } catch (err) {
      console.error(err);
      showToast(errorMessage(err, "Error saving address"), "error");
    } finally {
      setIsSavingAddress(false);
    }
  };

  // Display only: the server prices the order and is what Razorpay charges.
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = Math.max(0, subtotal);

  // Cash on Delivery requires a 10% advance paid online; the balance is collected on delivery.
  const ADVANCE_RATE = 0.1;
  const advanceAmount = Math.round(total * ADVANCE_RATE * 100) / 100;
  const balanceAmount = Math.round((total - advanceAmount) * 100) / 100;

  // Validates the shipping step, then reveals the payment-method selection.
  const goToPayment = () => {
    if (!selectedAddressId) {
      showToast("Please select a shipping address.", "warning");
      return;
    }
    if (cartItems.length === 0) {
      showToast("Your cart is empty.", "warning");
      return;
    }
    setStep("payment");
  };

  // When moving to the payment step, bring the payment section into view so
  // mobile users don't land mid-page and have to hunt for the payment cards.
  useEffect(() => {
    if (step === "payment") {
      paymentSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [step]);

  // Routes "Place Order" to the chosen payment method.
  // Online payment charges the full total; COD charges only the 10% advance online
  // and records the balance to be collected on delivery.
  const handlePlaceOrder = () => {
    processRazorpayPayment(paymentMethod === "cod" ? "cod" : "razorpay");
  };

  // Shared Razorpay flow. The server prices the bag, opens the Razorpay order
  // for what is due now (full total, or the 10% COD advance) and records the
  // order; paying it and verifying the signature confirms it.
  const processRazorpayPayment = async (method: "razorpay" | "cod") => {
    if (!selectedAddressId) {
      showToast("Please select a shipping address.", "warning");
      return;
    }
    if (cartItems.length === 0) {
      showToast("Your cart is empty.", "warning");
      return;
    }

    const token = readToken();
    if (!token) {
      showToast("Please login to proceed.", "warning");
      return;
    }
    const auth = { headers: { 'Authorization': `Bearer ${token}` } };
    const isCod = method === "cod";

    setIsPlacingOrder(true);
    try {
      const createOrderRes = await axios.post(`${API_V1}/payments/create-order`, {
        items: cartItems.map((item) => ({ product: item.id, size: item.size, quantity: item.quantity })),
        addressId: selectedAddressId,
        paymentMethod: method,
      }, auth);

      const { orderId, razorpayOrder, isMock, key_id, prefill, amounts } = createOrderRes.data.data;

      // Never charge a different amount than the customer is looking at: if a
      // price changed since the bag was loaded, show the new one first.
      const shownNow = isCod ? advanceAmount : total;
      if (Math.round(amounts.payableNow * 100) !== Math.round(shownNow * 100)) {
        await refreshCart();
        showToast("Prices in your bag have been updated. Please review the new total and place your order again.", "warning");
        setIsPlacingOrder(false);
        return;
      }

      const verify = async (rzp: RazorpayResponse) => {
        setIsVerifyingPayment(true);
        try {
          await axios.post(`${API_V1}/payments/verify`, rzp, auth);
          // The server has emptied the saved bag; mirror that locally.
          clearLocalCart();
          router.push(`/order-success?id=${orderId}`);
        } catch (err) {
          console.error(err);
          router.push("/order-failure");
        }
      };

      // Local development without Razorpay keys only; the server refuses this anywhere else.
      if (isMock) {
        await verify({ razorpay_order_id: razorpayOrder.id, razorpay_payment_id: "mock_payment", razorpay_signature: "mock" });
        return;
      }

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !window.Razorpay) {
        showToast("Razorpay SDK failed to load. Are you online?", "error");
        setIsPlacingOrder(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: key_id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "genesisbypreethy",
        description: isCod ? "Advance Payment (10%)" : "Order Payment",
        order_id: razorpayOrder.id,
        handler: verify,
        prefill,
        theme: {
          color: "#0a0a0a"
        },
        modal: {
          // Closing the Razorpay window without paying hands the button back.
          ondismiss: () => setIsPlacingOrder(false),
        },
      });
      // Razorpay shows the failure and offers a retry inside its own window,
      // so a failed attempt is not the end of the checkout.
      rzp.on('payment.failed', (response) => {
        console.warn("Razorpay payment attempt failed", response);
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      setIsVerifyingPayment(false);
      setIsPlacingOrder(false);
      showToast(errorMessage(err, "An error occurred during checkout."), "error");
    }
  };

  // ── Full-screen verifying overlay ──
  if (isVerifyingPayment) {
    return (
      <div className="min-h-screen bg-ivory flex flex-col items-center justify-center px-6 text-center">
        <div className="w-12 h-12 border border-line border-t-bronze rounded-full animate-spin mb-8"></div>
        <p className="eyebrow text-bronze-deep mb-3">One moment</p>
        <h2 className="font-display font-light text-3xl text-ink mb-3">Verifying Payment</h2>
        <p className="font-sans text-muted max-w-sm leading-relaxed">
          Please wait while we confirm your order. Do not close this window.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory pt-[84px]">
      <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 pt-16 lg:pt-24 pb-24">

        {/* Header */}
        <Breadcrumbs className="mb-6" />
        <Reveal>
          <h1 className="font-display font-light text-[clamp(2.5rem,5vw,4rem)] leading-[1.08] text-ink">
            Checkout
          </h1>

          {/* Editorial stepper */}
          <div className="flex items-center gap-5 mt-8">
            <span
              className={`eyebrow transition-colors ${step === "shipping" ? "text-ink" : "text-faint"}`}
            >
              01 · Shipping
            </span>
            <span className="h-px w-8 bg-line" />
            <span
              className={`eyebrow transition-colors ${step === "payment" ? "text-ink" : "text-faint"}`}
            >
              02 · Payment
            </span>
          </div>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* ── Left Column (Steps) ── */}
          <div className="lg:col-span-8 flex flex-col gap-12">

            {step === "shipping" && (
              <Reveal className="flex flex-col gap-8">
                {/* Step 1: SHIPPING */}
                <div>
                  <p className="eyebrow text-bronze-deep mb-3">Step One</p>
                  <h2 className="font-display font-light text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[1.08] text-ink">
                    Shipping Address
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5" role="radiogroup" aria-label="Shipping address">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <button
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        role="radio"
                        aria-checked={isSelected}
                        className={`relative text-left border p-6 transition-colors ${
                          isSelected
                            ? "border-ink bg-cream"
                            : "border-line bg-cream/40 hover:border-ink/40"
                        }`}
                      >
                        {/* Selection indicator */}
                        <span
                          className={`absolute top-5 right-5 w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected ? "border-ink" : "border-line"
                          }`}
                        >
                          {isSelected && <span className="w-2 h-2 rounded-full bg-ink" />}
                        </span>

                        <p className="font-display text-lg text-ink capitalize mb-2 pr-6">
                          {addr.name}
                        </p>
                        <p className="font-sans text-sm text-muted leading-relaxed capitalize">
                          {addr.line1}<br />
                          {addr.line2}
                        </p>
                      </button>
                    );
                  })}

                  {/* New Address tile */}
                  <button
                    onClick={() => setIsAddressModalOpen(true)}
                    className="border border-dashed border-line p-6 min-h-[120px] flex flex-col items-center justify-center gap-2 text-muted hover:border-ink/40 hover:text-ink transition-colors"
                  >
                    <span className="text-2xl font-light leading-none" aria-hidden="true">+</span>
                    <span className="eyebrow">New Address</span>
                  </button>
                </div>
              </Reveal>
            )}

            {step === "payment" && (
              <div ref={paymentSectionRef} className="flex flex-col gap-8 scroll-mt-28">
                {/* Back to shipping */}
                <button
                  onClick={() => setStep("shipping")}
                  className="self-start font-sans text-[11px] uppercase tracking-[0.14em] text-muted hover:text-ink link-underline"
                >
                  ← Back to Shipping
                </button>

                <div>
                  <p className="eyebrow text-bronze-deep mb-3">Step Two</p>
                  <h2 className="font-display font-light text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[1.08] text-ink">
                    Payment Method
                  </h2>
                </div>

                <div className="flex flex-col gap-4 max-w-xl">
                  {/* Online Payment (Razorpay) */}
                  <button
                    onClick={() => setPaymentMethod("online")}
                    aria-pressed={paymentMethod === "online"}
                    className={`text-left border p-6 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-ink ${
                      paymentMethod === "online"
                        ? "border-ink bg-cream"
                        : "border-line bg-cream/40 hover:border-ink/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-sans font-medium text-ink">Online Payment (Prepaid)</p>
                        <p className="font-sans text-sm text-muted leading-relaxed mt-1">
                          Pay securely via card, UPI, or netbanking with Razorpay.
                        </p>
                      </div>
                      <span
                        className={`mt-1 w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                          paymentMethod === "online" ? "border-ink" : "border-line"
                        }`}
                      >
                        {paymentMethod === "online" && <span className="w-2 h-2 rounded-full bg-ink" />}
                      </span>
                    </div>
                  </button>

                  {/* Cash on Delivery */}
                  <button
                    onClick={() => setPaymentMethod("cod")}
                    aria-pressed={paymentMethod === "cod"}
                    className={`text-left border p-6 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-ink ${
                      paymentMethod === "cod"
                        ? "border-ink bg-cream"
                        : "border-line bg-cream/40 hover:border-ink/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-sans font-medium text-ink">Cash on Delivery</p>
                        <p className="font-sans text-sm text-muted leading-relaxed mt-1">
                          Pay a 10% advance online now; pay the balance in cash on delivery.
                        </p>
                      </div>
                      <span
                        className={`mt-1 w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                          paymentMethod === "cod" ? "border-ink" : "border-line"
                        }`}
                      >
                        {paymentMethod === "cod" && <span className="w-2 h-2 rounded-full bg-ink" />}
                      </span>
                    </div>

                    {paymentMethod === "cod" && (
                      <div className="mt-5 pt-5 border-t border-line flex flex-col gap-2">
                        <div className="flex justify-between font-sans text-sm">
                          <span className="text-muted">Advance now (10%)</span>
                          <span className="font-medium text-ink">₹{advanceAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-sans text-sm">
                          <span className="text-muted">Balance on delivery</span>
                          <span className="font-medium text-ink">₹{balanceAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* ── Right Column (Order Bag) ── */}
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <Reveal delay={0.1}>
              <div className="bg-cream border border-line p-8">
                <p className="eyebrow text-bronze-deep mb-6">Order Bag</p>

                {/* Cart Items List */}
                <div className="flex flex-col gap-5 mb-8 max-h-[360px] overflow-y-auto pr-1 hide-scrollbar">
                  {cartItems.length === 0 ? (
                    <p className="font-sans text-sm text-muted">Your order bag is empty.</p>
                  ) : (
                    cartItems.map((item) => (
                      <div key={`${item.id}-${item.size ?? ""}`} className="flex gap-4">
                        <div className="relative w-14 aspect-[4/5] bg-sand overflow-hidden flex-shrink-0">
                          {item.image && (
                            // eslint-disable-next-line @next/next/no-img-element -- tiny Cloudinary-resized thumbnail
                            <img
                              src={cldOptimize(item.image, 160)}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                          <span className="absolute top-0 right-0 bg-ink text-ivory text-[10px] w-4 h-4 flex items-center justify-center">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <p className="font-display text-base text-ink leading-snug line-clamp-2">
                            {item.name}
                          </p>
                          {item.size && (
                            <p className="font-sans text-[11px] text-muted mt-1 uppercase tracking-[0.14em]">
                              {item.size}
                            </p>
                          )}
                        </div>
                        <p className="font-sans text-sm text-ink flex-shrink-0">
                          {item.currency}{item.price * item.quantity}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center font-sans text-sm">
                    <span className="text-muted">Subtotal</span>
                    <span className="text-ink">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center font-sans text-sm">
                    <span className="text-muted">Shipping</span>
                    <span className="text-forest uppercase text-[11px] tracking-[0.14em]">
                      Complimentary
                    </span>
                  </div>
                </div>

                <div className="h-px bg-line mb-6" />

                <div className="flex justify-between items-baseline mb-8">
                  <span className="font-sans text-sm uppercase tracking-[0.14em] text-ink">Total</span>
                  <span className="font-display font-light text-3xl text-ink">₹{total.toFixed(2)}</span>
                </div>

                <Button
                  onClick={step === "shipping" ? goToPayment : handlePlaceOrder}
                  disabled={isPlacingOrder}
                  variant="solid"
                  size="md"
                  className="w-full"
                >
                  {step === "shipping"
                    ? "Continue to Payment"
                    : isPlacingOrder
                    ? "Processing..."
                    : paymentMethod === "cod"
                    ? `Pay ₹${advanceAmount.toFixed(2)} Advance`
                    : "Pay Now"}
                </Button>

                <p className="text-center font-sans text-[11px] text-faint mt-5 tracking-[0.1em] uppercase">
                  256-bit SSL Secured
                </p>
              </div>
            </Reveal>
          </div>

        </div>
      </div>

      {/* ── New Address Modal ── */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
            onClick={() => setIsAddressModalOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-address-title"
            className="relative bg-ivory border border-line w-full max-w-lg shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 sm:p-8 border-b border-line">
              <div>
                <p className="eyebrow text-bronze-deep mb-2">Shipping</p>
                <h2 id="new-address-title" className="font-display font-light text-2xl text-ink">
                  New Address
                </h2>
              </div>
              <button
                onClick={() => setIsAddressModalOpen(false)}
                aria-label="Close"
                className="w-9 h-9 flex items-center justify-center text-xl leading-none text-muted hover:text-ink border border-line hover:border-ink/40 transition-colors"
              >
                ×
              </button>
            </div>

            {/* Form */}
            <div className="p-6 sm:p-8 flex flex-col gap-5">
              <div>
                <label htmlFor="checkout-street" className="block font-sans text-[11px] uppercase tracking-[0.14em] text-muted mb-2">Street Address</label>
                <input
                  id="checkout-street"
                  type="text"
                  autoFocus
                  autoComplete="street-address"
                  value={newAddressForm.street}
                  onChange={(e) => { setNewAddressForm({ ...newAddressForm, street: e.target.value }); setAddressErrors(prev => ({ ...prev, street: '' })); }}
                  placeholder="e.g. 123 Marine Drive"
                  aria-invalid={!!addressErrors.street}
                  className={`w-full bg-cream border rounded-none px-4 py-3 font-sans text-base text-ink focus:outline-none focus:border-ink placeholder:text-faint ${addressErrors.street ? 'border-red-400' : 'border-line'}`}
                />
                {addressErrors.street && <p className="text-red-500 text-xs mt-1.5">{addressErrors.street}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="checkout-city" className="block font-sans text-[11px] uppercase tracking-[0.14em] text-muted mb-2">City <span className="text-red-500">*</span></label>
                  <input
                    id="checkout-city"
                    type="text"
                    autoComplete="address-level2"
                    value={newAddressForm.city}
                    onChange={(e) => { setNewAddressForm({ ...newAddressForm, city: e.target.value }); setAddressErrors(prev => ({ ...prev, city: '' })); }}
                    placeholder="Kochi"
                    aria-invalid={!!addressErrors.city}
                    className={`w-full bg-cream border rounded-none px-4 py-3 font-sans text-base text-ink focus:outline-none focus:border-ink placeholder:text-faint ${addressErrors.city ? 'border-red-400' : 'border-line'}`}
                  />
                  {addressErrors.city && <p className="text-red-500 text-xs mt-1.5">{addressErrors.city}</p>}
                </div>
                <div>
                  <label htmlFor="checkout-state" className="block font-sans text-[11px] uppercase tracking-[0.14em] text-muted mb-2">State <span className="text-red-500">*</span></label>
                  <input
                    id="checkout-state"
                    type="text"
                    autoComplete="address-level1"
                    value={newAddressForm.state}
                    onChange={(e) => { setNewAddressForm({ ...newAddressForm, state: e.target.value }); setAddressErrors(prev => ({ ...prev, state: '' })); }}
                    placeholder="Kerala"
                    aria-invalid={!!addressErrors.state}
                    className={`w-full bg-cream border rounded-none px-4 py-3 font-sans text-base text-ink focus:outline-none focus:border-ink placeholder:text-faint ${addressErrors.state ? 'border-red-400' : 'border-line'}`}
                  />
                  {addressErrors.state && <p className="text-red-500 text-xs mt-1.5">{addressErrors.state}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="checkout-zip" className="block font-sans text-[11px] uppercase tracking-[0.14em] text-muted mb-2">PIN Code <span className="text-red-500">*</span></label>
                  <input
                    id="checkout-zip"
                    type="text"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    value={newAddressForm.zip}
                    onChange={(e) => { setNewAddressForm({ ...newAddressForm, zip: e.target.value }); setAddressErrors(prev => ({ ...prev, zip: '' })); }}
                    placeholder="682001"
                    aria-invalid={!!addressErrors.zip}
                    className={`w-full bg-cream border rounded-none px-4 py-3 font-sans text-base text-ink focus:outline-none focus:border-ink placeholder:text-faint ${addressErrors.zip ? 'border-red-400' : 'border-line'}`}
                  />
                  {addressErrors.zip && <p className="text-red-500 text-xs mt-1.5">{addressErrors.zip}</p>}
                </div>
                <div>
                  <label htmlFor="checkout-country" className="block font-sans text-[11px] uppercase tracking-[0.14em] text-muted mb-2">Country</label>
                  <input
                    id="checkout-country"
                    type="text"
                    autoComplete="country-name"
                    value={newAddressForm.country}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, country: e.target.value })}
                    placeholder="India"
                    className="w-full bg-cream border border-line rounded-none px-4 py-3 font-sans text-base text-ink focus:outline-none focus:border-ink placeholder:text-faint"
                  />
                </div>
              </div>

              <Button
                onClick={handleSaveAddress}
                disabled={isSavingAddress}
                variant="solid"
                size="md"
                className="w-full mt-4"
              >
                {isSavingAddress ? "Saving..." : "Save & Deliver Here"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
