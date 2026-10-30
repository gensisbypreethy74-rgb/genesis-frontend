"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Reveal from "../ui/Reveal";
import { ButtonLink } from "../ui/Button";
import ProductCard from "../ui/ProductCard";
import { isMoment, type Product } from "../../lib/product";
import type { Moment } from "../../lib/moment";
import { API_V1 } from "../../lib/api";
import { safeHref } from "../../lib/safeHref";

/**
 * `moment` is fetched once by the home page on the server and passed down; its
 * `seasonal` copy heads this carousel. Missing copy is left out, not replaced.
 */
export default function ProductArchive({ moment }: { moment?: Moment | null }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  const seasonal = moment?.seasonal;
  // The Moment membership is by `category`, not `collectionName`, so any href
  // that filters on collection or shows the unfiltered shop must be rewritten
  // to the category filter.
  const ctaHref =
    seasonal?.ctaHref === "/products" ||
    seasonal?.ctaHref?.startsWith("/products?collection=") ||
    seasonal?.ctaHref?.startsWith("/collections/")
      ? "/products?category=the-moment"
      : safeHref(seasonal?.ctaHref, "/products");

  useEffect(() => {
    axios
      .get(`${API_V1}/products`)
      // Membership is the category, set in the Products module. Newest first,
      // following the products API's own order. Nothing filed under The Moment
      // means an empty carousel — other pieces are never shown in its place.
      .then((r) => setProducts(((r.data?.data as Product[]) || []).filter(isMoment)))
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, []);

  const scrollBy = (dir: 1 | -1) => {
    scroller.current?.scrollBy({ left: dir * 360, behavior: "smooth" });
  };

  return (
    <section id="the-archive" className="bg-tan">
      <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 section-pad">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <Reveal>
            {seasonal?.eyebrow && <p className="eyebrow text-bronze-deep mb-4">{seasonal.eyebrow}</p>}
            {seasonal?.heading && (
              <h2 className="font-display font-light leading-[1.08] text-[clamp(2rem,4.5vw,3.5rem)] text-ink max-w-2xl">
                {seasonal.heading}
              </h2>
            )}
            {seasonal?.description && (
              <p className="font-sans text-[15px] leading-[1.85] text-muted max-w-xl mt-5">
                {seasonal.description}
              </p>
            )}
          </Reveal>
          <div className="flex items-center gap-6 shrink-0">
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => scrollBy(-1)}
                aria-label="Previous"
                className="w-11 h-11 border border-ink/25 flex items-center justify-center text-ink hover:bg-ink hover:text-ivory transition-colors"
              >
                ←
              </button>
              <button
                onClick={() => scrollBy(1)}
                aria-label="Next"
                className="w-11 h-11 border border-ink/25 flex items-center justify-center text-ink hover:bg-ink hover:text-ivory transition-colors"
              >
                →
              </button>
            </div>
            {seasonal?.ctaLabel && (
              <ButtonLink href={ctaHref} variant="outline" size="sm" arrow={false}>
                {seasonal.ctaLabel}
              </ButtonLink>
            )}
          </div>
        </div>

        {/* Carousel */}
        {loading ? (
          <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:flex sm:gap-6 sm:overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="sm:w-[300px] sm:shrink-0">
                <div className="aspect-[3/4] img-placeholder animate-pulse" />
                <div className="h-4 bg-sand mt-4 w-2/3 animate-pulse" />
              </div>
            ))}
          </div>
        ) : failed ? (
          <p className="font-sans text-muted text-sm">
            The collection couldn&apos;t be loaded right now. Please refresh the page.
          </p>
        ) : products.length === 0 ? (
          <p className="font-sans text-muted text-sm">
            Pieces from the collection will appear here soon.
          </p>
        ) : (
          <div
            ref={scroller}
            className="grid grid-cols-2 gap-x-6 gap-y-12 sm:flex sm:gap-6 lg:gap-8 sm:overflow-x-auto hide-scrollbar sm:snap-x sm:snap-mandatory"
          >
            {products.map((p) => (
              <div key={p._id} className="sm:w-[300px] lg:w-[320px] sm:shrink-0 sm:snap-start">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
