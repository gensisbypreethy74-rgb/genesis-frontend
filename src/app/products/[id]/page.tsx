"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Breadcrumbs from "../../../components/common/Breadcrumbs";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { Check, MessageCircle } from "lucide-react";
import { useCart } from "../../../context/CartContext";
import { formatINR } from "../../../lib/product";
import { Button } from "../../../components/ui/Button";
import Reveal from "../../../components/ui/Reveal";
import Gallery from "./_components/Gallery";
import SizeSelector from "./_components/SizeSelector";
import Accordion from "./_components/Accordion";
import { CARE_ICON_MAP, isCareIcon, type CareIcon } from "./_components/careIcons";

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * The studio's WhatsApp line. Mirrors `WHATSAPP_NUMBER` in
 * src/components/common/Footer.tsx — that file declares it privately, so the
 * value is repeated here rather than invented. Change both together.
 */
const WHATSAPP_NUMBER = "916235251520";

/** Provenance + dispatch line shown under the CTA on every piece. */
const MADE_IN_NOTE = "Made in India — Kochi, Kerala. Ships in 5–9 days.";

/**
 * Fallback for pieces with no `shippingReturns` override. Condensed from
 * /shipping-information and /returns-exchanges so the PDP can't quietly
 * contradict the policy pages.
 */
const DEFAULT_SHIPPING_RETURNS =
  "In-stock pieces are dispatched from Kochi within one to two working days. Delivery takes two to four working days across Kerala and the metros, and four to seven working days elsewhere in India.\n\nYou have seven days from delivery to request a return or exchange, provided the piece is unworn and its tags are intact. The first size exchange on an order is free.";

// ─── Data ─────────────────────────────────────────────────────────────────────

interface Variant {
  /**
   * The size label (M / L / XL). Named `volume` in the schema this store grew
   * out of; carts and historical orders key off that exact string, so it is
   * passed through untouched and merely labelled "Size" in the UI.
   */
  volume: string;
  price: number;
  oldPrice?: number;
}

interface Spec {
  label: string;
  value: string;
}

/**
 * The raw API shapes, kept separate from the view models above.
 *
 * Everything is optional and loosely typed on purpose: these describe what the
 * endpoint *may* send, not what this page needs. The mapper below is where the
 * two meet — it fills defaults and drops anything unrenderable, so the rest of
 * the component can rely on `Product` being complete.
 */
interface ApiCategory {
  name?: string;
  status?: string;
}

interface ApiVariant {
  volume?: string;
  price?: number;
  oldPrice?: number;
  images?: string[];
}

interface ApiProduct {
  _id: string;
  name?: string;
  category?: string;
  collectionName?: string;
  lifeMode?: string;
  garmentType?: string;
  tagline?: string;
  fitNote?: string;
  modelNote?: string;
  studioNotes?: string;
  materialText?: string;
  specs?: Partial<Spec>[];
  fitFooter?: string;
  careIcons?: string[];
  careText?: string;
  shippingReturns?: string;
  images?: string[];
  variants?: ApiVariant[];
}

interface Product {
  id: string;
  name: string;
  category: string;
  collectionName: string;
  lifeMode: string;
  garmentType: string;
  tagline: string;
  fitNote: string;
  modelNote: string;
  studioNotes: string;
  materialText: string;
  specs: Spec[];
  fitFooter: string;
  careIcons: CareIcon[];
  careText: string;
  shippingReturns: string;
  images: string[];
  variants: Variant[];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Null until the shopper picks — the CTA stays inert until they do.
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL
          ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '')
          : 'http://localhost:5000';

        const [prodRes, catRes] = await Promise.all([
          axios.get(`${baseUrl}/api/v1/products`),
          axios.get(`${baseUrl}/api/v1/categories`)
        ]);

        const prodJson = prodRes.data;
        const catJson = catRes.data;

        let activeCatNames: string[] = [];
        if (catJson.success && catJson.data) {
          activeCatNames = (catJson.data as ApiCategory[])
            .filter((c) => c.status === "ACTIVE")
            .map((c) => (c.name || "").toLowerCase());
        }

        if (prodJson.success && prodJson.data) {
          // Only hide products in a deactivated category when the active-category
          // list actually loaded. If categories failed to load, a direct product
          // link must still resolve rather than 404 — never leave a real product
          // unreachable because a *separate* request hiccupped.
          const all = prodJson.data as ApiProduct[];
          const activeProducts =
            activeCatNames.length > 0
              ? all.filter((p) => activeCatNames.includes((p.category || "").toLowerCase()))
              : all;

          const mapped: Product[] = activeProducts.map((p) => {
            // Gallery = product-level images plus every variant's images, so
            // products whose photos live only on variants still render.
            const gallery: string[] = [
              ...(p.images || []),
              ...(p.variants || []).flatMap((v) => v.images || []),
            ].filter(Boolean);
            return {
              id: p._id,
              name: p.name || "",
              category: p.category || "",
              collectionName: p.collectionName || "",
              lifeMode: p.lifeMode || "",
              garmentType: p.garmentType || "",
              tagline: p.tagline || "",
              fitNote: p.fitNote || "",
              modelNote: p.modelNote || "",
              studioNotes: p.studioNotes || "",
              materialText: p.materialText || "",
              // Half-filled rows would render as a blank table line.
              specs: Array.isArray(p.specs)
                ? p.specs.filter((s): s is Spec => Boolean(s?.label && s?.value))
                : [],
              fitFooter: p.fitFooter || "",
              // Older rows may hold anything; keep only keys we can draw.
              careIcons: Array.isArray(p.careIcons) ? p.careIcons.filter(isCareIcon) : [],
              careText: p.careText || "",
              shippingReturns: p.shippingReturns || "",
              images: gallery,
              // A variant without a size label has no button to sit on, so it
              // is dropped rather than rendered as an empty square.
              variants: (p.variants || [])
                .filter((v) => Boolean(v?.volume))
                .map((v) => ({
                  volume: v.volume as string,
                  price: v.price ?? 0,
                  oldPrice: v.oldPrice,
                })),
            };
          });
          const found = mapped.find((p) => p.id === id) || null;
          setProduct(found);
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProducts();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory pt-[68px] lg:pt-[84px] flex items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border border-line border-t-ink" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-ivory pt-[68px] lg:pt-[84px] flex flex-col items-center justify-center text-center px-6">
        <p className="eyebrow text-bronze-deep mb-4">Not found</p>
        <h1 className="font-display font-light text-[clamp(2rem,4.5vw,3rem)] leading-[1.08] text-ink mb-4">
          This piece has moved on
        </h1>
        <p className="text-muted max-w-md mb-10 leading-relaxed">
          We couldn&apos;t find the garment you were looking for. It may have sold through or been retired from the collection.
        </p>
        <Button variant="outline" size="md" onClick={() => router.push("/products")}>
          Browse the collection
        </Button>
      </div>
    );
  }

  // ── Derived ────────────────────────────────────────────────────────────────

  const hasSizes = product.variants.length > 0;
  const selectedVariant = selectedSize !== null ? product.variants[selectedSize] : undefined;
  // Before a choice is made we still want a price on screen; sizes of one
  // garment share a price in practice, so the first variant is representative.
  const priceVariant = selectedVariant ?? product.variants[0];
  const price = priceVariant?.price ?? 0;
  const oldPrice =
    priceVariant?.oldPrice && priceVariant.oldPrice > price ? priceVariant.oldPrice : undefined;

  // A piece with no variants at all has nothing to choose, so it stays buyable
  // without a selection — the backend resolves the size in that case.
  const canAdd = !hasSizes || selectedSize !== null;

  const collectionLabel = product.collectionName || product.category;
  const hasMaterial = !!(product.materialText || product.specs.length || product.fitFooter);
  const hasCare = !!(product.careIcons.length || product.careText);
  const shippingText = product.shippingReturns || DEFAULT_SHIPPING_RETURNS;

  const handleAddToCart = () => {
    if (!canAdd) return;

    const savedUser = localStorage.getItem("heedy_user");
    if (!savedUser) {
      router.push("/sign-in");
      return;
    }

    // Payload shape is load-bearing: the backend keys a cart line by
    // productId + size, where `size` must be the variant's `volume` string.
    addToCart({
      id: product.id,
      name: product.name,
      image: product.images[0] ?? "",
      price,
      currency: "₹",
      size: selectedVariant?.volume,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-ivory pt-[68px] text-ink lg:pt-[84px]">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16">

        {/* ── Breadcrumb ── */}
        <Breadcrumbs currentLabel={product.name} className="py-8" />

        <section className="grid grid-cols-1 gap-10 pb-24 lg:grid-cols-[58fr_42fr] lg:gap-16 lg:pb-32 xl:gap-24">

          {/* ── Left: gallery ── */}
          <Reveal>
            <Gallery images={product.images} name={product.name} />
          </Reveal>

          {/* ── Right: the piece ── */}
          <Reveal delay={0.12} className="flex flex-col">

            {/* Tag pills */}
            {(collectionLabel || product.lifeMode) && (
              <div className="mb-6 flex flex-wrap gap-2">
                {collectionLabel && (
                  <span className="eyebrow bg-tan px-3 py-2 text-bronze-deep">
                    {collectionLabel}
                  </span>
                )}
                {product.lifeMode && (
                  <span className="eyebrow bg-beige px-3 py-2 text-bronze-deep">
                    Life Mode · {product.lifeMode}
                  </span>
                )}
              </div>
            )}

            {/* Name */}
            <h1 className="font-display text-[clamp(2.25rem,3.4vw,2.625rem)] font-light leading-[1.08] text-ink">
              {product.name}
            </h1>

            {/* Garment type */}
            {product.garmentType && (
              <p className="mt-2 font-sans text-[15px] text-muted">{product.garmentType}</p>
            )}

            {/* Price — follows the selected size */}
            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-display text-3xl font-light text-ink">
                {formatINR(price)}
              </span>
              {oldPrice && (
                <span className="font-display text-xl text-faint line-through">
                  {formatINR(oldPrice)}
                </span>
              )}
            </div>

            {/* Tagline */}
            {product.tagline && (
              <p className="mt-6 max-w-[400px] font-display text-[19px] italic leading-[1.6] text-muted">
                {product.tagline}
              </p>
            )}

            {/* Fit note */}
            {product.fitNote && (
              <p className="mt-4 font-sans text-[13px] leading-relaxed text-muted">
                {product.fitNote}
              </p>
            )}

            {/* Size */}
            {hasSizes && (
              <div className="mt-9">
                <SizeSelector
                  options={product.variants}
                  selected={selectedSize}
                  onSelect={setSelectedSize}
                  modelNote={product.modelNote}
                />
              </div>
            )}

            {/* Add to bag */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!canAdd}
              className={`mt-8 inline-flex w-full items-center justify-center gap-2.5 py-4 font-sans text-[11px] uppercase tracking-[0.18em] transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                canAdd
                  ? "cursor-pointer bg-ink text-ivory hover:bg-forest"
                  : "cursor-not-allowed bg-sand text-muted"
              }`}
            >
              {added ? (
                <>
                  <Check size={15} strokeWidth={1.5} aria-hidden /> Added to bag
                </>
              ) : canAdd ? (
                "Add to bag"
              ) : (
                "Select a size"
              )}
            </button>

            {/* Service notes */}
            <div className="mt-6 flex flex-col gap-2.5">
              <p className="flex items-start gap-2.5 font-sans text-[13px] leading-relaxed text-muted">
                <Check
                  size={14}
                  strokeWidth={1.5}
                  aria-hidden
                  className="mt-[3px] shrink-0 text-forest"
                />
                {MADE_IN_NOTE}
              </p>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 font-sans text-[13px] leading-relaxed text-muted transition-colors duration-300 hover:text-ink"
              >
                <MessageCircle
                  size={14}
                  strokeWidth={1.5}
                  aria-hidden
                  className="mt-[3px] shrink-0"
                />
                <span className="link-underline">Questions about fit? Message us on WhatsApp.</span>
              </a>
            </div>

            {/* Divider — the accordions below always render, so this never dangles */}
            <div className="mt-10 h-px bg-line" />

            {/* Studio notes */}
            {product.studioNotes && (
              <div className="py-8">
                <p className="eyebrow mb-4 text-bronze-deep">Studio Notes</p>
                <p className="whitespace-pre-wrap font-sans text-[14px] leading-[1.85] text-muted">
                  {product.studioNotes}
                </p>
              </div>
            )}

            {/* Accordions */}
            <div className={product.studioNotes ? "border-t border-line" : "mt-2"}>
              {hasMaterial && (
                <Accordion title="Material & Fit">
                  {product.materialText && (
                    <p className="font-sans text-[14px] leading-[1.8] text-muted">
                      {product.materialText}
                    </p>
                  )}

                  {product.specs.length > 0 && (
                    <dl className={product.materialText ? "mt-5" : ""}>
                      {product.specs.map((spec, i) => (
                        <div
                          key={`${spec.label}-${i}`}
                          className="flex items-baseline justify-between gap-6 border-b border-line/60 py-3 last:border-b-0"
                        >
                          <dt className="font-sans text-[13px] text-muted">{spec.label}</dt>
                          <dd className="text-right font-sans text-[13px] text-ink">
                            {spec.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}

                  {product.fitFooter && (
                    <p className="mt-5 font-sans text-[13px] leading-relaxed text-muted">
                      {product.fitFooter}
                    </p>
                  )}
                </Accordion>
              )}

              {hasCare && (
                <Accordion title="Care">
                  {product.careIcons.length > 0 && (
                    <ul className="mb-6 flex flex-wrap gap-x-7 gap-y-5">
                      {product.careIcons.map((key) => {
                        const { icon: Icon, caption } = CARE_ICON_MAP[key];
                        return (
                          <li
                            key={key}
                            className="flex w-[68px] flex-col items-center gap-2 text-center"
                          >
                            <Icon size={20} strokeWidth={1.25} aria-hidden className="text-ink" />
                            <span className="font-sans text-[10px] uppercase leading-[1.3] tracking-[0.1em] text-muted">
                              {caption}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  {product.careText && (
                    <p className="font-sans text-[14px] leading-[1.8] text-muted">
                      {product.careText}
                    </p>
                  )}
                </Accordion>
              )}

              <Accordion title="Shipping & Returns">
                <p className="whitespace-pre-wrap font-sans text-[14px] leading-[1.8] text-muted">
                  {shippingText}
                </p>
              </Accordion>
            </div>
          </Reveal>
        </section>
      </div>
    </div>
  );
}
