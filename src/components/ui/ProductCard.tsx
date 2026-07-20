"use client";

import { useState } from "react";
import Link from "next/link";
import { cldOptimize } from "../../lib/image";
import {
  type Product,
  fromPrice,
  fromOldPrice,
  productImagePool,
  garmentLabel,
  formatINR,
} from "../../lib/product";

export default function ProductCard({
  product,
  className = "",
  imageRatio = "aspect-[3/4]",
}: {
  product: Product;
  className?: string;
  imageRatio?: string;
}) {
  const pool = productImagePool(product);
  const price = fromPrice(product);
  const oldPrice = fromOldPrice(product);
  const garment = garmentLabel(product);

  // Walk the pool rather than trusting its first entry.
  //
  // A dead URL used to cost the card its photograph entirely: the studio's free
  // -text URL field lets a non-image (or a URL that simply 404s) sit at index 0,
  // ahead of every real upload, so a piece with four good photographs still
  // rendered the placeholder. Each failure now advances to the next candidate;
  // only a pool where everything fails falls back to the placeholder.
  const [failed, setFailed] = useState<string[]>([]);
  const live = pool.filter((src: string) => !failed.includes(src));
  const markFailed = (src: string) =>
    setFailed((prev) => (prev.includes(src) ? prev : [...prev, src]));

  const primary = live[0];
  const secondary = live[1];
  const hasPrimary = !!primary;
  const hasSecondary = !!secondary;

  return (
    <Link href={`/products/${product._id}`} className={`group block ${className}`}>
      <div className={`relative overflow-hidden bg-sand ${imageRatio}`}>
        {hasPrimary ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cldOptimize(primary!, 800)}
              alt={product.name}
              loading="lazy"
              onError={() => markFailed(primary!)}
              className={`absolute inset-0 h-full w-full object-cover transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] ${
                hasSecondary ? "group-hover:opacity-0" : ""
              }`}
            />
            {hasSecondary && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cldOptimize(secondary!, 800)}
                alt=""
                aria-hidden
                loading="lazy"
                onError={() => markFailed(secondary!)}
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="img-placeholder absolute inset-0 flex items-center justify-center">
            <span className="font-display uppercase tracking-[0.35em] text-xs text-ink/25 pl-[0.35em]">
              Genesis
            </span>
          </div>
        )}

        {product.offerText && (
          <span className="absolute top-3 left-3 eyebrow bg-ivory/90 text-ink px-2.5 py-1">
            {product.offerText}
          </span>
        )}
      </div>

      <div className="pt-4 text-center">
        <h3 className="font-display text-xl text-ink leading-tight">{product.name}</h3>
        {garment && (
          <p className="font-sans text-[12px] text-muted mt-1">{garment}</p>
        )}
        <p className="font-display text-[15px] text-ink mt-2 flex items-center justify-center gap-2">
          {price > 0 ? formatINR(price) : "Enquire"}
          {oldPrice && (
            <span className="text-faint line-through text-[13px]">{formatINR(oldPrice)}</span>
          )}
        </p>
      </div>
    </Link>
  );
}
