"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ButtonLink } from "../ui/Button";
import { cldOptimize } from "../../lib/image";
import { fetchActiveBanners, type StoreBanner } from "../../lib/banners";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Shown until a banner loads, and kept as the floor if the studio has none
 * published or the request fails — the hero is the whole first screen, so it
 * must never be empty.
 */
const HERO_IMAGE = "/images/image.png";
const HERO_FALLBACK = "/hero-bg.png";

/** Below this, phones get the banner's tall crop. Matches Tailwind's `md`. */
const MOBILE_BREAKPOINT = "(max-width: 767px)";

export default function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // The hero image used to be this constant and nothing else, so a banner
  // uploaded in the studio never appeared here — neither crop. It now shows the
  // newest ACTIVE banner and falls back to the bundled photo.
  const [banner, setBanner] = useState<StoreBanner | null>(null);
  const [resolved, setResolved] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchActiveBanners()
      .then((list) => {
        if (cancelled) return;
        if (list.length > 0) setBanner(list[0]);
      })
      .catch((err) => console.error("Failed to load hero banner", err))
      .finally(() => {
        // Resolved either way: a failed request should still show the fallback
        // rather than leave the first screen empty.
        if (!cancelled) setResolved(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // `failed` covers a banner URL that 404s: drop to the bundled photo rather
  // than leaving the first screen blank.
  const useBanner = banner !== null && !failed;
  const desktopSrc = useBanner ? cldOptimize(banner.image, 1920) : HERO_IMAGE;
  // No tall crop uploaded? Phones reuse the wide one rather than show nothing.
  const mobileSrc = useBanner
    ? cldOptimize(banner.mobileImage || banner.image, 1080)
    : HERO_IMAGE;
  const alt = useBanner && banner.title
    ? banner.title
    : "Genesis by Preethy — editorial";

  // Subtle parallax: the background drifts slower than the scroll.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "16%"]);

  return (
    <section
      ref={ref}
      // Phones get a shorter hero: a full-viewport image pushed everything below
      // it off the first screen, so the page read as a single photo. From `sm`
      // up it stays full-bleed, where there's room for both.
      className="relative h-[72svh] min-h-[460px] sm:h-[100svh] sm:min-h-[600px] w-full overflow-hidden bg-sand"
    >
      {/* Background image (parallax) */}
      <motion.div style={{ y }} className="absolute inset-0 z-0">
        {/*
          <picture> rather than two images toggled with `hidden md:block`: the
          browser resolves the source before fetching, so a phone downloads only
          the tall crop instead of both. `key` remounts on change so a swapped
          banner re-evaluates its sources and onError re-arms.
        */}
        {/*
          Nothing renders until the banner request settles. Painting the bundled
          fallback first would download 1.4MB on every visit and then throw it
          away the moment the banner arrived — on the LCP element. The section's
          `bg-sand` covers the gap, and the image fades in on load.
        */}
        {resolved && (
          <picture key={desktopSrc}>
            <source media={MOBILE_BREAKPOINT} srcSet={mobileSrc} />
            <img
              src={desktopSrc}
              alt={alt}
              // The hero is the LCP element: fetch it first, never lazily.
              fetchPriority="high"
              onLoad={(e) => e.currentTarget.classList.remove("opacity-0")}
              onError={(e) => {
                // A dead banner URL falls back to the bundled photo; if that
                // also fails, swap the element's own src once and stop.
                if (useBanner) setFailed(true);
                else if (!e.currentTarget.src.endsWith(HERO_FALLBACK)) {
                  e.currentTarget.src = HERO_FALLBACK;
                }
              }}
              className="h-[116%] w-full object-cover object-center opacity-0 transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            />
          </picture>
        )}
      </motion.div>

      {/* Legibility scrim (darkens the left where the text sits) */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-ink/55 via-ink/25 to-transparent" />

      {/* Text */}
      {/* pb is fixed rather than `12vh`: viewport units here measured against
          the screen, not the hero, so a shorter hero would have kept the same
          large gap and squeezed the copy. This clears the scroll cue exactly. */}
      <div className="relative z-10 h-full max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 flex items-end pb-20 sm:items-center sm:pb-0">
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease }}
            className="eyebrow mb-6 text-ivory/85"
          >
            Genesis by Preethy · The Edit
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease }}
            className="font-display font-light leading-[1.06] text-[clamp(2.4rem,6vw,4.6rem)] text-ivory"
          >
            Tropical-intelligent clothing, drawn from a life lived in heat, humidity and rain.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55, ease }}
            className="mt-10"
          >
            <ButtonLink href="/products?collection=onam" variant="solid-ivory">
              Explore the Edit
            </ButtonLink>
          </motion.div>
        </div>
      </div>

      {/* Scroll cue — desktop only.
          It's centred, so on the shorter mobile hero it landed beside the
          left-aligned CTA and read as clutter. It's also redundant there: the
          next section now crests the fold, which invites the scroll by itself.
          On desktop the hero still fills the screen, so the cue earns its place. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="hidden sm:block absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="eyebrow text-ivory/70 flex flex-col items-center gap-2">
          <span>Scroll</span>
          <span className="block w-px h-8 bg-current opacity-40" />
        </div>
      </motion.div>
    </section>
  );
}
