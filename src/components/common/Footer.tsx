"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import Reveal from "../ui/Reveal";
import Logo from "../ui/Logo";
import { useToast } from "../../context/ToastContext";
import { CARE_EMAIL, COMPANY, WHATSAPP_URL } from "../../lib/contact";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");

const COLUMNS: { title: string; links: { label: string; href: string; external?: boolean }[] }[] = [
  {
    title: "The Wardrobe Edit",
    links: [
      { label: "Within", href: "/the-edit/within" },
      { label: "Beyond", href: "/the-edit/beyond" },
      { label: "Genesis Men", href: "/the-edit/genesis-man" },
      { label: "Archive", href: "/the-edit/archive" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { label: "Track Your Order", href: "/track-order" },
      { label: "Shipping Information", href: "/shipping-information" },
      { label: "Returns & Exchanges", href: "/returns-exchanges" },
      { label: "Size Guide", href: "/size-guide" },
      { label: "Contact / WhatsApp", href: WHATSAPP_URL, external: true },
      { label: CARE_EMAIL, href: `mailto:${CARE_EMAIL}`, external: true },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms & Conditions", href: "/terms-and-conditions" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Refund & Cancellation", href: "/refund-cancellation" },
      { label: "Shipping Policy", href: "/shipping-policy" },
      // Module 5 §8 requires this link in the footer. It points at the Privacy
      // Policy's cookie clause, which is the only place preferences are
      // documented — the consent banner the spec describes does not exist yet.
      { label: "Cookie Preferences", href: "/privacy-policy#cookies" },
    ],
  },
  {
    title: "Socials",
    links: [
      { label: "Instagram", href: "https://www.instagram.com/genesis.bypreethy/", external: true },
      { label: "Pinterest", href: "https://pinterest.com", external: true },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-beige text-ink w-full">
      <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 pt-10 sm:pt-14 pb-8">
        {/* Tagline */}
        <Reveal className="text-center max-w-3xl mx-auto">
          <p className="font-display text-[15px] sm:text-[17px] lg:text-[19px] leading-relaxed text-ink/75">
            Genesis by Preethy — natural clothing for tropical climates and a life that no
            longer needs to perform.
          </p>
        </Reveal>

        {/* Columns.
            Link spacing stays at 10px: tighter would shrink the tap target on
            the two-column mobile layout, and this is where the footer actually
            gets used. The height came out of the gaps around the blocks. */}
        <div className="mt-9 sm:mt-12 grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-8 border-t border-ink/12 pt-9">
          {COLUMNS.map((col, i) => (
            <Reveal key={col.title} delay={i * 0.08}>
              <h3 className="eyebrow text-bronze-deep mb-4">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-sans text-[13px] text-muted hover:text-ink transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="font-sans text-[13px] text-muted hover:text-ink transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>

        {/* Newsletter — Module 5 §3 locates opt-in at the "footer Newsletter
            Studio signup", so the form belongs here and not only on the home
            page. Same endpoint as the home section, tagged with its own source
            so the studio can tell the two apart. */}
        <FooterNewsletter />

        <Reveal className="mt-9 flex justify-center">
          <Link href="/" aria-label="Genesis by Preethy — home">
            <Logo className="h-[40px] sm:h-[52px]" />
          </Link>
        </Reveal>

        {/* Statutory identity — Module 4 §1 (legal name, registered office, CIN)
            and §12 (jurisdiction). Required on display by the Consumer
            Protection (E-Commerce) Rules, 2020. */}
        <div className="mt-8 pt-5 border-t border-ink/12 space-y-2 text-center">
          <p className="font-sans text-[11px] leading-relaxed tracking-wide text-faint">
            {COMPANY.legalName} · CIN {COMPANY.cin}
          </p>
          <p className="font-sans text-[11px] leading-relaxed tracking-wide text-faint">
            Registered office: {COMPANY.registeredOffice}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-x-3 gap-y-1">
            <p className="font-sans text-[11px] tracking-wide text-faint">
              © {COMPANY.legalName}. All rights reserved.
            </p>
            <span className="hidden sm:inline text-faint/50">·</span>
            <p className="font-sans text-[11px] tracking-wide text-faint">
              Prices in ₹ INR, inclusive of GST. Shipping within India only.
            </p>
            <span className="hidden sm:inline text-faint/50">·</span>
            <p className="font-sans text-[11px] tracking-wide text-faint">
              Subject to the jurisdiction of the courts at {COMPANY.jurisdiction}.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

/**
 * Compact newsletter opt-in. Mirrors the home section's validation and endpoint;
 * `source` distinguishes footer signups in the studio's list. The opt-in wording
 * is explicit because Module 5 §3 treats this as the consent moment for
 * marketing email.
 */
function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      showToast("Please enter a valid email address.", "warning");
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE}/api/v1/newsletter/subscribe`, {
        email: value,
        source: "footer-studio",
      });
      if (res.data?.success) {
        showToast("Subscribed. Slow letters, on their way.", "success");
        setEmail("");
      } else {
        showToast(res.data?.message || "Could not subscribe. Try again.", "error");
      }
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.message
          ? (err.response.data.message as string)
          : "Could not subscribe. Try again.";
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Reveal className="mt-9 pt-9 border-t border-ink/12">
      <div className="max-w-xl mx-auto text-center">
        <h3 className="eyebrow text-bronze-deep mb-3">Notes from the Studio</h3>
        <p className="font-sans text-[13px] leading-[1.75] text-muted mb-5">
          Occasional letters on new pieces and the thinking behind them. Opt out at any
          time via the unsubscribe link in any letter.
        </p>
        <form onSubmit={subscribe} className="flex flex-col sm:flex-row gap-3 justify-center">
          <label htmlFor="footer-newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="footer-newsletter-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="flex-1 min-w-0 bg-cream border border-ink/20 rounded-none px-4 py-3 font-sans text-[13px] text-ink placeholder:text-faint focus:outline-none focus:border-ink"
          />
          <button
            type="submit"
            disabled={submitting}
            className="shrink-0 bg-ink text-cream eyebrow px-7 py-3 hover:bg-[#33302a] transition-colors disabled:opacity-50"
          >
            {submitting ? "Joining…" : "Join"}
          </button>
        </form>
      </div>
    </Reveal>
  );
}
