"use client";

import { useState } from "react";
import axios from "axios";
import LegalPage from "../../components/common/LegalPage";
import { Button, ButtonLink } from "../../components/ui/Button";
import { useToast } from "../../context/ToastContext";
import { useSettings } from "../../context/SettingsContext";
import { API_V1 } from "../../lib/api";

interface TrackedOrder {
  orderId: string;
  orderStatus: "processing" | "shipped" | "delivered" | "cancelled";
  paymentMethod: string;
  placedAt: string;
  updatedAt: string;
  itemCount: number;
}

const STATUS_COPY: Record<TrackedOrder["orderStatus"], { label: string; detail: string }> = {
  processing: { label: "Being prepared", detail: "Your pieces are being checked by hand before they leave the studio." },
  shipped: { label: "Shipped", detail: "Your order is with the courier and on its way to you." },
  delivered: { label: "Delivered", detail: "Your order has been delivered." },
  cancelled: { label: "Cancelled", detail: "This order was cancelled. If you were charged, your refund is being processed." },
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackedOrder | null>(null);
  const [notFound, setNotFound] = useState(false);
  const { showToast } = useToast();
  const { whatsappNumber } = useSettings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = orderId.trim();
    const mail = email.trim();
    if (!id) {
      showToast("Please enter your order ID.", "warning");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      showToast("Please enter the email used on the order.", "warning");
      return;
    }
    setLoading(true);
    setResult(null);
    setNotFound(false);
    try {
      const res = await axios.post(`${API_V1}/payments/track`, { orderId: id, email: mail });
      setResult(res.data.data);
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      if (status === 404 || status === 400) setNotFound(true);
      else showToast(axios.isAxiosError(err) && err.response?.data?.message ? err.response.data.message : "Could not look up the order. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const copy = result ? STATUS_COPY[result.orderStatus] : null;

  return (
    <LegalPage eyebrow="Customer Care" title="Track Your Order">
      <p>
        Enter the order ID from your confirmation email along with the email
        address on your account, and we will show the order&apos;s current status.
        Signed in? Every order is also listed on your profile.
      </p>

      <form onSubmit={handleSubmit} className="not-prose max-w-md mt-10 mb-4">
        <label className="block mb-6" htmlFor="track-order-id">
          <span className="eyebrow text-bronze-deep block mb-3">Order ID</span>
          <input
            id="track-order-id"
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="The 24-character ID from your email"
            autoComplete="off"
            className="w-full bg-transparent border-b border-ink/40 focus:border-ink transition-colors py-3 font-sans text-[15px] text-ink placeholder:text-faint focus:outline-none"
          />
        </label>

        <label className="block mb-8" htmlFor="track-order-email">
          <span className="eyebrow text-bronze-deep block mb-3">Email address</span>
          <input
            id="track-order-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            autoComplete="email"
            className="w-full bg-transparent border-b border-ink/40 focus:border-ink transition-colors py-3 font-sans text-[15px] text-ink placeholder:text-faint focus:outline-none"
          />
        </label>

        <Button type="submit" variant="outline" size="md" arrow disabled={loading}>
          {loading ? "Looking it up…" : "Track order"}
        </Button>
      </form>

      <div role="status" aria-live="polite" className="not-prose max-w-md">
        {result && copy && (
          <div className="mt-8 border border-line bg-cream p-6">
            <p className="eyebrow text-bronze-deep mb-2">Order {result.orderId}</p>
            <p className="font-display text-2xl text-ink mb-2">{copy.label}</p>
            <p className="font-sans text-sm text-muted leading-relaxed">{copy.detail}</p>
            <p className="font-sans text-sm text-muted mt-4">
              {result.itemCount} {result.itemCount === 1 ? "piece" : "pieces"} · placed {formatDate(result.placedAt)} · last updated {formatDate(result.updatedAt)}
            </p>
          </div>
        )}
        {notFound && (
          <p className="mt-8 font-sans text-sm text-ink">
            We couldn&apos;t find an order with that ID and email. Check both against
            your confirmation email, or message us below.
          </p>
        )}
      </div>

      <h2>Prefer to ask a person?</h2>
      <p>
        For courier and tracking-number details, message us on WhatsApp with your
        order ID and we will look into it during studio hours, Monday to Saturday,
        10am to 6pm IST. It is often the fastest way to sort a delivery question.
      </p>
      {whatsappNumber && (
        <div className="not-prose mt-6">
          <ButtonLink
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            variant="solid"
            size="md"
          >
            Message on WhatsApp
          </ButtonLink>
        </div>
      )}
    </LegalPage>
  );
}
