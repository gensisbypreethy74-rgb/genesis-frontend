import Image from "next/image";
import logoGold from "../../../public/images/logo-wordmark.png";
import logoInk from "../../../public/images/logo-wordmark-ink.png";

/**
 * The Genesis by Preethy wordmark.
 *
 * Two variants of one artwork, because the gold cannot recolour the way the
 * text wordmark it replaces did:
 *   · `gold` — the brand mark, for dark grounds (hero, dark panels). ~7:1.
 *   · `ink`  — the same letterforms in soft-black, for ivory/cream grounds.
 *              The gold reads at only ~2:1 on ivory, which looks washed out.
 *
 * Both are trimmed from `public/images/Logo.png`, whose 1080×1080 canvas is 84%
 * empty padding — sizing that original by height would render the mark tiny.
 */
export default function Logo({
  tone = "ink",
  className = "",
  priority = false,
}: {
  tone?: "gold" | "ink";
  /** Set the height here; width follows the 2.99:1 aspect automatically. */
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={tone === "gold" ? logoGold : logoInk}
      alt="Genesis by Preethy"
      priority={priority}
      // Height comes from the caller; `w-auto` keeps the aspect honest.
      className={`w-auto object-contain select-none ${className}`}
      sizes="(max-width: 640px) 140px, 220px"
    />
  );
}
