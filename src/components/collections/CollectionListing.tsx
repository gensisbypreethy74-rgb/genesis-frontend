"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Reveal from "../ui/Reveal";
import ProductCard from "../ui/ProductCard";
import { ButtonLink } from "../ui/Button";
import Breadcrumbs from "../common/Breadcrumbs";
import type { Product } from "../../lib/product";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(
  /\/api\/?$/,
  ""
);

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface CollectionListingProps {
  title: string;
  eyebrow: string;
  blurb: string;
  /** Collection / season / garment slug to match against */
  collectionSlug?: string;
  /** Life-mode slug to match against */
  modeSlug?: string;
}

export default function CollectionListing({
  title,
  eyebrow,
  blurb,
  collectionSlug,
  modeSlug,
}: CollectionListingProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/api/v1/products`);
        const json = res.data;
        const list: Product[] = Array.isArray(json)
          ? json
          : json?.data || json?.products || [];
        if (active) setProducts(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error("Failed to load products, using fallback:", error);
        const fallbackProducts: Product[] = [
          {
            _id: "demo-1",
            name: "Luminous Silk Kurta",
            description: "A meticulously crafted kurta set reflecting tropical-intelligent design.",
            images: ["/products/test-1.jpg", "/products/test-2.jpg"],
            variants: [{ volume: "Standard", price: 18500, oldPrice: 22000, stock: 10, sku: "DEMO-1" }],
            offerText: "20% off",
            category: "Dresses",
            keyFeatures: "Breathable, Premium Silk, Hand-finished",
            collectionName: "Within",
            season: "Q3",
            lifeMode: "ambition",
            garmentType: "kurta",
            status: "ACTIVE"
          },
          {
            _id: "demo-2",
            name: "Summer Linen Co-ord",
            description: "Effortless styling for humid afternoons.",
            images: ["/products/test-2.jpg"],
            variants: [{ volume: "Standard", price: 12500, oldPrice: 12500, stock: 10, sku: "DEMO-2" }],
            category: "Co-ords",
            keyFeatures: "Lightweight, Relaxed fit",
            collectionName: "Beyond",
            season: "Q3",
            lifeMode: "casual-out",
            garmentType: "co-ord",
            status: "ACTIVE"
          },
          {
            _id: "demo-3",
            name: "Midnight Organza Saree",
            description: "Woven for absolute breathability and elegance.",
            images: ["/products/suncream-1.jpg"],
            variants: [{ volume: "Standard", price: 34000, oldPrice: 40000, stock: 10, sku: "DEMO-3" }],
            offerText: "15% off",
            category: "Sarees",
            keyFeatures: "Sheer texture, Intricate embroidery",
            collectionName: "Archive",
            season: "Q2",
            lifeMode: "occasion",
            garmentType: "saree",
            status: "ACTIVE"
          },
          {
            _id: "demo-4",
            name: "Ivory Draped Dress",
            description: "Signature draped dress.",
            images: ["/products/suncream-2.jpg", "/products/test-1.jpg"],
            variants: [{ volume: "Standard", price: 21000, oldPrice: 21000, stock: 10, sku: "DEMO-4" }],
            category: "Dresses",
            keyFeatures: "Comfort fit, Elegant drape",
            collectionName: "Within",
            season: "Q3",
            lifeMode: "at-home-identity",
            garmentType: "dress",
            status: "ACTIVE"
          },
          {
            _id: "demo-5",
            name: "Embroidered Tunic",
            description: "Modern silhouette with traditional embellishments.",
            images: ["/products/body-wash-1.jpg"],
            variants: [{ volume: "Standard", price: 15000, oldPrice: 17000, stock: 10, sku: "DEMO-5" }],
            offerText: "10% off",
            category: "Dresses",
            keyFeatures: "Versatile styling, Hand embroidery",
            collectionName: "Genesis Man",
            season: "Q3",
            lifeMode: "ambition",
            garmentType: "tunic",
            status: "ACTIVE"
          },
          {
            _id: "demo-6",
            name: "Classic Silk Lehenga",
            description: "A statement piece for grand celebrations.",
            images: ["/products/body-wash-2.jpg"],
            variants: [{ volume: "Standard", price: 42000, oldPrice: 42000, stock: 10, sku: "DEMO-6" }],
            category: "Sarees",
            keyFeatures: "Voluminous, Rich texture",
            collectionName: "Beyond",
            season: "Q3",
            lifeMode: "occasion",
            garmentType: "lehenga",
            status: "ACTIVE"
          }
        ];
        if (active) setProducts(fallbackProducts);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  // Filter to products matching this collection or life mode. If nothing
  // matches yet (fresh catalogue), gracefully show everything.
  const shown = useMemo(() => {
    const wanted = [collectionSlug, modeSlug].filter(Boolean).map((s) => slugify(s!));
    if (wanted.length === 0) return products;

    const matched = products.filter((p) => {
      const fields = [p.collectionName, p.season, p.lifeMode, p.garmentType, p.category]
        .filter(Boolean)
        .map((f) => slugify(f as string));
      return fields.some((f) => wanted.includes(f));
    });

    return matched.length > 0 ? matched : products;
  }, [products, collectionSlug, modeSlug]);

  return (
    <main className="bg-ivory min-h-screen">
      {/* Hero band */}
      <section className="pt-[108px] lg:pt-[140px] pb-14 lg:pb-20 border-b border-line">
        <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16">
          <Breadcrumbs className="mb-8 sm:mb-10" />
          <Reveal>
            <p className="eyebrow text-bronze-deep mb-5">{eyebrow}</p>
            <h1 className="font-display font-light leading-[1.05] text-[clamp(2.5rem,6vw,4.75rem)] text-ink mb-7">
              {title}
            </h1>
            <p className="font-sans text-[15px] leading-[1.9] text-muted max-w-xl">
              {blurb}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Grid */}
      <section className="section-pad">
        <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-sand" />
                  <div className="pt-4 flex flex-col items-center gap-2">
                    <div className="h-4 w-2/3 bg-sand" />
                    <div className="h-3 w-1/3 bg-sand" />
                  </div>
                </div>
              ))}
            </div>
          ) : shown.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
              {shown.map((product, i) => (
                <Reveal key={product._id} delay={(i % 4) * 0.06} scaleFrom={0.97}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center max-w-md mx-auto">
              <p className="font-display font-light text-[clamp(1.6rem,3vw,2.25rem)] text-ink leading-[1.15] mb-4">
                Nothing here just yet.
              </p>
              <p className="font-sans text-[14px] leading-[1.85] text-muted mb-9">
                Pieces for this part of the edit are still being finished in the studio.
                In the meantime, the full collection is open to browse.
              </p>
              <ButtonLink href="/products" variant="outline" size="md">
                View the Collection
              </ButtonLink>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
