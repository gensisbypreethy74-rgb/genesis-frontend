"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { Moment } from "../../lib/moment";
import { safeHref } from "../../lib/safeHref";

/* Bespoke dark palette for this section (per spec) */
const C = {
  bg: "#1C1814",
  primary: "#F5F0E8",
  secondary: "#C4B8A8",
  body: "#E8E0D4",
  btnHover: "#E8E0D4",
};

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * "The Moment" — a dark, immersive collection-launch announcement block.
 * Full-bleed warm near-black background, cream editorial typography, dual CTA.
 * Sits directly after the product carousel; nav "The Moment" anchors here.
 */
export default function TheMoment({ moment }: { moment?: Moment | null }) {
  const reduce = useReducedMotion();

  // The studio's copy only. If it couldn't be loaded, keep just the anchor so
  // the nav's "The Moment" link still lands — never a bundled stand-in.
  if (!moment) return <section id="the-moment" aria-hidden className="w-full" />;

  const { eyebrow, title, shopLabel } = moment;
  const paragraphs = (moment.body || "").split(/\n{2,}/).filter(Boolean);
  // Normalise legacy hrefs that filtered on collection instead of category.
  const rawShopHref = moment.shopHref || "/products?category=the-moment";
  const shopHref =
    rawShopHref === "/products" ||
    rawShopHref.startsWith("/products?collection=") ||
    rawShopHref.startsWith("/collections/")
      ? "/products?category=the-moment"
      : safeHref(rawShopHref, "/products?category=the-moment");

  // Staggered fade + upward translate. The root MotionConfig drops the
  // translate under reduced motion; `y` stays fixed here so the server and
  // client render the same starting style.
  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduce ? 0 : 0.15, delayChildren: 0.05 },
    },
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.65, ease } },
  };

  // Smooth-scroll to the Edit section when already on the home page.
  const previewEdit = (e: React.MouseEvent) => {
    const el = typeof document !== "undefined" && document.getElementById("the-edit");
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      history.replaceState(null, "", "/#the-edit");
    }
  };

  return (
    <section
      id="the-moment"
      aria-labelledby="moment-headline"
      className="w-full"
      style={{ backgroundColor: C.bg }}
    >
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="max-w-[720px] mx-auto px-6 sm:px-10 text-center py-10 md:py-14 lg:py-20"
      >
        {/* Label */}
        <motion.p
          variants={item}
          className="font-sans uppercase text-[10px] sm:text-[11px] tracking-[0.28em] mb-4"
          style={{ color: C.secondary }}
        >
          {eyebrow}
        </motion.p>

        {/* Headline */}
        <motion.h2
          variants={item}
          id="moment-headline"
          className="font-display font-light leading-[1.1] text-[clamp(1.75rem,4.2vw,3.25rem)] mb-5"
          style={{ color: C.primary }}
        >
          {title}
        </motion.h2>

        {/* Body */}
        <div className="mx-auto" style={{ maxWidth: 640 }}>
          {paragraphs.map((p, i) => (
            <motion.p
              key={i}
              variants={item}
              className="font-display text-[16px] sm:text-[17px] leading-[1.65] mb-4 last:mb-0"
              style={{ color: C.body }}
            >
              {p}
            </motion.p>
          ))}
        </div>

        {/* CTAs */}
        <motion.div
          variants={item}
          className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
        >
          {shopLabel && <Link
            href={shopHref}
            className="w-full sm:w-auto text-center font-sans uppercase tracking-[0.16em] text-[12px] px-8 py-4 rounded-[2px] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={
              {
                backgroundColor: C.primary,
                color: C.bg,
                // focus ring colors
                "--tw-ring-color": C.primary,
                "--tw-ring-offset-color": C.bg,
              } as React.CSSProperties
            }
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.btnHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = C.primary)}
          >
            {shopLabel}
          </Link>}

          <Link
            href="/#the-edit"
            onClick={previewEdit}
            className="group w-full sm:w-auto text-center font-sans uppercase tracking-[0.16em] text-[12px] px-8 py-4 rounded-[2px] border transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={
              {
                borderColor: C.primary,
                color: C.primary,
                "--tw-ring-color": C.primary,
                "--tw-ring-offset-color": C.bg,
              } as React.CSSProperties
            }
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = C.primary;
              e.currentTarget.style.color = C.bg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = C.primary;
            }}
          >
            Preview the Edit
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
