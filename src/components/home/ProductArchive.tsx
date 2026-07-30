"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Reveal from "../ui/Reveal";
import { ButtonLink } from "../ui/Button";
import ProductCard from "../ui/ProductCard";
import { isMoment, type Product } from "../../lib/product";
import { fetchMoment, type SeasonalCollection } from "../../lib/moment";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");

// Text fallbacks — used until the studio's seasonal settings load / if none set.
const FALLBACK: SeasonalCollection = {
  eyebrow: "Now · The Onam Collection",
  heading: "Named for the flowers of the season.",
  description: "",
  ctaLabel: "View All Pieces",
  ctaHref: "/products",
};

export default function ProductArchive() {
  const [products, setProducts] = useState<Product[]>([]);
  const [seasonal, setSeasonal] = useState<SeasonalCollection>(FALLBACK);
  const [loading, setLoading] = useState(true);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      axios.get(`${API_BASE}/api/v1/products`).then((r) => (r.data?.data as Product[]) || []),
      fetchMoment(),
    ])
      .then(([all, moment]) => {
        const s = moment?.seasonal;
        if (s) setSeasonal(s);
        // Membership is the category, set in the Products module. Newest first,
        // following the products API's own order.
        const picked = all.filter(isMoment);
        if (picked.length) {
          setProducts(picked);
        } else {
          // Nothing filed under The Moment yet: fall back to landing-page pieces.
          const landing = all.filter((p) => p.showOnLandingPage);
          setProducts((landing.length ? landing : all).slice(0, 10));
        }
      })
      .catch(() => {})
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
            <p className="eyebrow text-bronze-deep mb-4">{seasonal.eyebrow}</p>
            <h2 className="font-display font-light leading-[1.08] text-[clamp(2rem,4.5vw,3.5rem)] text-ink max-w-2xl">
              {seasonal.heading}
            </h2>
            {seasonal.description && (
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
            <ButtonLink href={seasonal.ctaHref || "/products"} variant="outline" size="sm" arrow={false}>
              {seasonal.ctaLabel || "View All Pieces"}
            </ButtonLink>
          </div>
        </div>

        {/* Carousel */}
        {loading ? (
          <div className="flex gap-6 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-[260px] sm:w-[300px] shrink-0">
                <div className="aspect-[3/4] img-placeholder animate-pulse" />
                <div className="h-4 bg-sand mt-4 w-2/3 mx-auto animate-pulse" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="font-sans text-muted text-sm">
            Pieces from the collection will appear here soon.
          </p>
        ) : (
          <div
            ref={scroller}
            className="flex gap-6 lg:gap-8 overflow-x-auto hide-scrollbar snap-x snap-mandatory -mx-6 px-6 sm:mx-0 sm:px-0"
          >
            {products.map((p) => (
              <div key={p._id} className="w-[260px] sm:w-[300px] lg:w-[320px] shrink-0 snap-start">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
