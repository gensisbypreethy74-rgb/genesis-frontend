"use client";

import { useState } from "react";
import Image from "next/image";
import { cldOptimize } from "../../../../lib/image";

interface GalleryProps {
  images: string[];
  /** Product name — used to write meaningful alt text. */
  name: string;
}

/**
 * Product gallery: one large portrait frame with a horizontal thumbnail strip
 * beneath it. Sharp corners throughout, no shadow.
 *
 * The frames are stacked and cross-faded on opacity rather than swapped, so the
 * new photo arrives over the old one instead of flashing the placeholder tone
 * while it decodes.
 */
export default function Gallery({ images, name }: GalleryProps) {
  const [active, setActive] = useState(0);

  return (
    // The gallery column is 58% of a 1500px page, so an uncapped 4:5 frame runs
    // ~880px tall on a large screen — taller than the viewport. Capped on lg up;
    // phones and tablets still get the full column width.
    <div className="flex flex-col gap-3 lg:max-w-[540px]">
      {/* Main frame */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-sand img-placeholder">
        {/* No photography yet — show the warm placeholder tone rather than a
            stand-in from another product, so the frame still reads as intentional. */}
        {images.length === 0 && (
          <div className="flex h-full w-full items-center justify-center">
            <span className="select-none pl-[0.4em] font-display text-sm uppercase tracking-[0.4em] text-ink/25">
              Genesis
            </span>
          </div>
        )}
        {images.map((src, i) => (
          <Image
            key={`${src}-${i}`}
            src={cldOptimize(src, 1200)}
            alt={i === active ? `${name} — view ${i + 1}` : ""}
            aria-hidden={i !== active}
            fill
            sizes="(max-width: 1024px) 100vw, 540px"
            priority={i === 0}
            unoptimized
            className={`object-cover transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

      {/* Thumbnail strip — scrolls sideways on narrow screens rather than wrapping */}
      {images.length > 1 && (
        <div
          className="hide-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1"
          role="group"
          aria-label="Product images"
        >
          {images.map((src, i) => (
            <button
              key={`${src}-thumb-${i}`}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1} of ${images.length}`}
              aria-current={i === active}
              // 4:5, matching the main frame — a thumbnail that crops differently
              // from the photo it opens reads as a different picture.
              className={`relative h-[120px] w-24 shrink-0 cursor-pointer overflow-hidden bg-sand border transition-[opacity,border-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                i === active
                  ? "border-ink opacity-100"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={cldOptimize(src, 300)}
                alt=""
                aria-hidden
                fill
                sizes="96px"
                unoptimized
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
