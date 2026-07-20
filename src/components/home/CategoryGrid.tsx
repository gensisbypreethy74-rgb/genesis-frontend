"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Reveal from "../ui/Reveal";
import { cldOptimize } from "../../lib/image";
import { fetchActiveCategories, type StoreCategory } from "../../lib/categories";

/**
 * The Edit — the storefront's category grid.
 *
 * Was `FourLifeModes`, which hardcoded four "life modes" and four cosmetics-era
 * images. Nothing here came from the database, so categories added in the studio
 * never appeared. This now renders whatever ACTIVE categories exist: add, rename,
 * re-photograph or deactivate one in the studio and the site follows.
 *
 * `lifeMode` still exists as a *product* attribute (the pill on the detail page);
 * it just no longer pretends to be the site's navigation.
 */

/**
 * Column spans, cycled. The original design is an asymmetric 2-1 / 1-2 rhythm
 * across three columns, which only worked because there were exactly four tiles.
 * Cycling the pattern keeps that rhythm for any number: two categories fill one
 * row exactly, four fill two, and an odd tail is simply a shorter last row.
 */
const SPANS = ["lg:col-span-2", "lg:col-span-1", "lg:col-span-1", "lg:col-span-2"];

function Tile({ category, index }: { category: StoreCategory; index: number }) {
  return (
    <Reveal
      delay={(index % 2) * 0.1}
      scaleFrom={0.96}
      className={SPANS[index % SPANS.length]}
    >
      <Link
        href={`/products?category=${category.id}`}
        aria-label={`Shop ${category.name}`}
        className="group relative block h-[360px] sm:h-[440px] lg:h-[520px] overflow-hidden bg-sand"
      >
        {category.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cldOptimize(category.image, 1400)}
            alt={category.name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          />
        ) : (
          // A category with no photograph still reads as intentional.
          <div className="absolute inset-0 img-placeholder transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]" />
        )}

        {/* Legibility gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/45 via-ink/5 to-transparent transition-opacity duration-500 group-hover:from-ink/55" />

        <div className="absolute inset-0 flex flex-col justify-end p-7 lg:p-9">
          <span className="eyebrow text-ivory/80 mb-2">Life Mode</span>
          <span className="font-display text-3xl lg:text-4xl text-ivory">
            {category.name}
          </span>
        </div>
      </Link>
    </Reveal>
  );
}

/** Warm placeholders at the real tile height, so the page doesn't jump. */
function TileSkeleton({ index }: { index: number }) {
  return (
    <div className={SPANS[index % SPANS.length]}>
      <div className="img-placeholder h-[360px] sm:h-[440px] lg:h-[520px] w-full" />
    </div>
  );
}

export default function CategoryGrid() {
  const [categories, setCategories] = useState<StoreCategory[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchActiveCategories()
      .then((list) => {
        if (!cancelled) setCategories(list);
      })
      .catch((err) => {
        console.error("Failed to load categories", err);
        if (!cancelled) setCategories([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Nothing published yet (or the request failed): drop the section rather than
  // leave a heading standing over an empty grid. The id stays mounted so the
  // "The Edit" nav link still has something to scroll to.
  if (categories !== null && categories.length === 0) {
    return <section id="the-edit" aria-hidden className="bg-ivory" />;
  }

  return (
    <section id="the-edit" className="bg-ivory">
      <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 section-pad">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div>
            <p className="eyebrow text-bronze-deep mb-4">The Edit</p>
            <h2 className="font-display font-light leading-[1.08] text-[clamp(2rem,4.5vw,3.5rem)] text-ink max-w-2xl">
              Find your way in.
            </h2>
          </div>
          <Link
            href="/products"
            className="eyebrow text-ink link-underline self-start sm:self-auto shrink-0"
          >
            Shop All →
          </Link>
        </div>

        {/* Asymmetric grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {categories === null
            ? Array.from({ length: 4 }).map((_, i) => <TileSkeleton key={i} index={i} />)
            : categories.map((category, i) => (
                <Tile key={category.id} category={category} index={i} />
              ))}
        </div>
      </div>
    </section>
  );
}
