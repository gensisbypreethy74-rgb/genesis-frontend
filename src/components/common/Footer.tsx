"use client";

import Link from "next/link";
import Reveal from "../ui/Reveal";
import Logo from "../ui/Logo";
import { COMPANY, WHATSAPP_URL } from "../../lib/contact";

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

        {/* Newsletter opt-in lives only in the home StudioNewsletter section —
            one form site-wide. */}

        <Reveal className="mt-9 pt-9 border-t border-ink/12 flex justify-center">
          <Link href="/" aria-label="Genesis by Preethy — home">
            <Logo className="h-[40px] sm:h-[52px]" />
          </Link>
        </Reveal>

        {/* Statutory identity — Module 4 §1 (legal name, registered office, CIN)
            and §12 (jurisdiction). Required on display by the Consumer
            Protection (E-Commerce) Rules, 2020. */}
        <div className="mt-8 space-y-2 text-center">
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
