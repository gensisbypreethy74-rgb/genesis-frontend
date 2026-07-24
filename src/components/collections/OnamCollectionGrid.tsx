"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import Reveal from "../ui/Reveal";
import ProductCard from "../ui/ProductCard";
import { type Product } from "../../lib/product";
import { slugify } from "../../lib/categories";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");

/** Every product in the Onam collection = collectionName slug "onam". */
export function isOnam(p: Product): boolean {
  return !!p.collectionName && slugify(p.collectionName) === "onam";
}

/**
 * The Onam collection as a product grid — the same seasonal set the dedicated
 * /collections/onam page lists (both filter on the collection tag), so they
 * stay in sync as pieces are tagged, edited or removed in the admin.
 */
export default function OnamCollectionGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/v1/products`)
      .then((r) => setProducts(((r.data?.data as Product[]) || []).filter(isOnam)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Nothing tagged Onam yet: drop the section rather than show an empty heading.
  if (!loading && products.length === 0) return null;

  return (
    <section className="bg-tan">
      <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 section-pad">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <Reveal>
            <p className="eyebrow text-bronze-deep mb-4">Now · The Onam Collection</p>
            <h2 className="font-display font-light leading-[1.08] text-[clamp(2rem,4.5vw,3.5rem)] text-ink max-w-2xl">
              Named for the flowers of the season.
            </h2>
          </Reveal>
          <Link
            href="/collections/onam"
            className="eyebrow text-ink link-underline self-start sm:self-auto shrink-0"
          >
            View All Pieces →
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
