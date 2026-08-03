"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import Reveal from "../ui/Reveal";
import ProductCard from "../ui/ProductCard";
import { isMoment, type Product } from "../../lib/product";
import { fetchMoment } from "../../lib/moment";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");

/**
 * The Moment as a product grid — the same set as the homepage carousel, since
 * both filter on `isMoment`. Filing a piece under the "The Moment" category in
 * the Products module is the only way in; there is no per-section curation.
 *
 * Header copy comes from the studio's Moment settings rather than being fixed
 * here: this grid used to be hardcoded to the Onam collection, which would now
 * mislabel any non-Onam piece the studio files.
 */
export default function MomentCollectionGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [eyebrow, setEyebrow] = useState("");
  const [heading, setHeading] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaHref, setCtaHref] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${API_BASE}/api/v1/products`).then((r) => (r.data?.data as Product[]) || []),
      fetchMoment(),
    ])
      .then(([all, moment]) => {
        const s = moment?.seasonal;
        setProducts(all.filter(isMoment));
        setEyebrow(s?.eyebrow || "Now · The Moment");
        setHeading(s?.heading || "The pieces of this Moment.");
        setCtaLabel(s?.ctaLabel || "View All Pieces");
        // The Moment membership is by `category`, not `collectionName`, so any
        // href that filters on collection or shows the unfiltered shop must be
        // rewritten to the category filter.
        const href = s?.ctaHref || "/products?category=the-moment";
        const needsFix =
          href === "/products" ||
          href.startsWith("/products?collection=") ||
          href.startsWith("/collections/");
        setCtaHref(needsFix ? "/products?category=the-moment" : href);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Nothing in The Moment yet: drop the section rather than show an empty heading.
  if (!loading && products.length === 0) return null;

  return (
    <section className="bg-tan">
      <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 section-pad">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <Reveal>
            <p className="eyebrow text-bronze-deep mb-4">{eyebrow}</p>
            <h2 className="font-display font-light leading-[1.08] text-[clamp(2rem,4.5vw,3.5rem)] text-ink max-w-2xl">
              {heading}
            </h2>
          </Reveal>
          <Link
            href={ctaHref}
            className="eyebrow text-ink link-underline self-start sm:self-auto shrink-0"
          >
            {ctaLabel} →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-[3/4] img-placeholder animate-pulse" />
                <div className="h-4 bg-sand mt-4 w-2/3 animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
            {products.map((p, i) => (
              <Reveal key={p._id} delay={(i % 4) * 0.06}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
