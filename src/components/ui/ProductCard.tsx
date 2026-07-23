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
  productTags,
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
  const tags = productTags(product);

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

        {tags.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {tags.map((t, i) => (
              <span
                key={i}
                className={`font-sans uppercase tracking-[0.08em] text-[10px] leading-none px-2.5 py-1.5 ${
                  t.limited ? "bg-[#8B7355] text-ivory" : "bg-tan text-ink"
                }`}
              >
                {t.label}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4">
        <h3 className="font-display text-[19px] text-ink leading-tight group-hover:text-bronze transition-colors">
          {product.name}
        </h3>
        {garment && (
          <p className="font-sans text-[13px] text-muted mt-1">{garment}</p>
        )}
        <p className="font-sans text-[14px] text-ink mt-2 flex items-center gap-2">
          {price > 0 ? formatINR(price) : "Enquire"}
          {oldPrice && (
            <span className="text-faint line-through text-[13px]">{formatINR(oldPrice)}</span>
          )}
        </p>
      </div>
    </Link>
  );
}
