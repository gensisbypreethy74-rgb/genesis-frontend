"use client";

import Link from "next/link";
import Reveal from "../ui/Reveal";
import Logo from "../ui/Logo";

const WHATSAPP_NUMBER = "916235251520";

const COLUMNS: { title: string; links: { label: string; href: string; external?: boolean }[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "Shop All", href: "/products" },
      { label: "Now", href: "/products?collection=onam" },
      { label: "The Season", href: "/products" },
      { label: "Ambition", href: "/products?mode=ambition" },
      { label: "At-Home Identity", href: "/products?mode=at-home-identity" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { label: "Track Your Order", href: "/track-order" },
      { label: "Shipping Information", href: "/shipping-information" },
      { label: "Returns & Exchanges", href: "/returns-exchanges" },
      { label: "Size Guide", href: "/size-guide" },
      { label: "Contact / WhatsApp", href: `https://wa.me/${WHATSAPP_NUMBER}`, external: true },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms & Conditions", href: "/terms-and-conditions" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Refund & Cancellation", href: "/refund-cancellation" },
      { label: "Shipping Policy", href: "/shipping-policy" },
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
          <p className="font-display italic text-[19px] sm:text-[24px] lg:text-[28px] leading-snug text-ink/85">
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

        {/* Wordmark — ink on the beige ground; the gold mark is for dark only. */}
        <Reveal className="mt-9 flex justify-center">
          <Link href="/" aria-label="Genesis by Preethy — home">
            <Logo tone="ink" className="h-[40px] sm:h-[52px] opacity-90" />
          </Link>
        </Reveal>

        {/* Bottom line */}
        <div className="mt-8 pt-5 border-t border-ink/12 flex flex-col sm:flex-row items-center justify-between gap-3 text-center">
          <p className="font-sans text-[11px] tracking-wide text-faint">
            © Genesis by Preethy Private Limited. Registered in Kochi, Kerala.
          </p>
          <p className="font-sans text-[11px] tracking-wide text-faint">
            Shipping to India (₹ INR)
          </p>
        </div>
      </div>
    </footer>
  );
}
