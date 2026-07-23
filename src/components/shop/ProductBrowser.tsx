"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import ProductCard from "../ui/ProductCard";
import Reveal from "../ui/Reveal";
import { Button } from "../ui/Button";
import Breadcrumbs from "../common/Breadcrumbs";
import { type Product, fromPrice } from "../../lib/product";
import { slugify } from "../../lib/categories";

// ─── Config ──────────────────────────────────────────────────────────────────

interface PriceRange {
  id: string;
  label: string;
  min: number;
  max: number;
}

const PRICE_RANGES: PriceRange[] = [
  { id: "under-50", label: "Under ₹50", min: 0, max: 50 },
  { id: "50-100", label: "₹50 – ₹100", min: 50, max: 100 },
  { id: "100-200", label: "₹100 – ₹200", min: 100, max: 200 },
  { id: "200-500", label: "₹200 – ₹500", min: 200, max: 500 },
  { id: "over-500", label: "Over ₹500", min: 500, max: Infinity },
];

const SORT_OPTIONS = [
  { id: "popularity", label: "Featured" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
];

const prettify = (slug: string) =>
  slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

/**
 * Scope this browser to one THE EDIT page. A piece belongs when its explicit
 * `editSection` (or legacy `collectionName`) slug is in `sectionSlugs`, or its
 * `lifeMode` slug is in `modeSlugs` (Beyond spans three modes; Genesis Men uses
 * none so women's pieces don't leak in).
 */
export interface BrowserScope {
  sectionSlugs: string[];
  modeSlugs: string[];
}

interface ProductBrowserProps {
  /** When set, only pieces belonging to this edit section are shown. */
  scope?: BrowserScope;
  /** Fixed header for edit pages; the shop derives its own. */
  heading?: { eyebrow: string; title: string };
}

// ─── Filter panel ─────────────────────────────────────────────────────────────

interface FilterPanelProps {
  categories: { id: string; label: string; count: number }[];
  selectedCategories: string[];
  selectedPriceRanges: string[];
  onToggleCategory: (id: string) => void;
  onTogglePriceRange: (id: string) => void;
}

function FilterPanel({
  categories,
  selectedCategories,
  selectedPriceRanges,
  onToggleCategory,
  onTogglePriceRange,
}: FilterPanelProps) {
  return (
    <div className="space-y-10">
      {/* Categories */}
      <div>
        <p className="eyebrow text-bronze-deep pb-4 mb-4 border-b border-line">Category</p>
        <div className="flex flex-col gap-3.5">
          {categories.length === 0 && (
            <p className="font-sans text-sm text-faint">No categories yet.</p>
          )}
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.id)}
                onChange={() => onToggleCategory(cat.id)}
                className="h-3.5 w-3.5 accent-forest cursor-pointer"
              />
              <span className="font-sans text-sm text-muted group-hover:text-ink transition-colors">
                {cat.label} <span className="text-faint">({cat.count})</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <p className="eyebrow text-bronze-deep pb-4 mb-4 border-b border-line">Price</p>
        <div className="flex flex-col gap-3.5">
          {PRICE_RANGES.map((range) => (
            <label key={range.id} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedPriceRanges.includes(range.id)}
                onChange={() => onTogglePriceRange(range.id)}
                className="h-3.5 w-3.5 accent-forest cursor-pointer"
              />
              <span className="font-sans text-sm text-muted group-hover:text-ink transition-colors">
                {range.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Content ────────────────────────────────────────────────────────────────

function BrowserContent({ scope, heading }: ProductBrowserProps) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  const initialSearch = searchParams.get("search") || "";

  const modeParam = searchParams.get("mode") || "";
  const collectionParam = searchParams.get("collection") || "";
  const modeSlug = slugify(modeParam);
  const collectionSlug = slugify(collectionParam);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  );
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [sortBy, setSortBy] = useState("popularity");
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL
          ? process.env.NEXT_PUBLIC_API_URL.replace("/api", "")
          : "http://localhost:5000";

        const [prodRes, catRes] = await Promise.all([
          axios.get(`${baseUrl}/api/v1/products`),
          axios.get(`${baseUrl}/api/v1/categories`),
        ]);

        const prodJson = prodRes.data;
        const catJson = catRes.data;

        const activeBackendCats =
          catJson?.success && Array.isArray(catJson.data)
            ? catJson.data.filter((c: any) => c.status === "ACTIVE")
            : [];

        setCategories(
          activeBackendCats.map((c: any) => ({ id: slugify(c.name), label: c.name }))
        );

        if (prodJson?.success && Array.isArray(prodJson.data)) {
          const activeCatNames = activeBackendCats.map((c: any) => c.name.toLowerCase());
          const visibleProducts =
            activeCatNames.length > 0
              ? prodJson.data.filter((p: any) =>
                  activeCatNames.includes((p.category || "").toLowerCase())
                )
              : prodJson.data;

          const mappedProds: Product[] = visibleProducts.map((p: any) => ({
            _id: p._id,
            name: p.name,
            images: p.images && p.images.length > 0 ? p.images : ["/products/suncream-1.jpg"],
            variants: p.variants,
            offerText: p.offerText || "",
            category: p.category || "",
            garmentType: p.garmentType,
            collectionName: p.collectionName,
            season: p.season,
            lifeMode: p.lifeMode,
            editSection: p.editSection,
            limited: p.limited,
            description: p.keyFeatures || p.description || "",
            createdAt: p.createdAt,
          }));
          setProducts(mappedProds);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Sync category/search from URL
  useEffect(() => {
    const category = searchParams.get("category");
    if (category) setSelectedCategories([category]);
    const search = searchParams.get("search");
    setSearchTerm(search !== null ? search : "");
  }, [searchParams]);

  // Scope to this edit section (if any). Everything downstream — counts,
  // filtering, sort — runs over the scoped set, so an edit page behaves exactly
  // like the shop but over its own slice of the catalogue.
  const scoped = useMemo(() => {
    if (!scope) return products;
    const sections = scope.sectionSlugs.map(slugify);
    const modes = scope.modeSlugs.map(slugify);
    return products.filter((p) => {
      if (p.editSection && sections.includes(slugify(p.editSection))) return true;
      if (p.collectionName && sections.includes(slugify(p.collectionName))) return true;
      if (modes.length && p.lifeMode && modes.includes(slugify(p.lifeMode))) return true;
      return false;
    });
  }, [products, scope]);

  const toggleCategory = (id: string) =>
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );

  const togglePriceRange = (id: string) =>
    setSelectedPriceRanges((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );

  const categoriesWithCounts = useMemo(
    () =>
      categories
        .map((c) => ({
          ...c,
          count: scoped.filter((p) => slugify(p.category) === c.id).length,
        }))
        // On an edit page, hide categories with nothing in this section.
        .filter((c) => (scope ? c.count > 0 : true)),
    [categories, scoped, scope]
  );

  const matchesPrice = (price: number) => {
    if (selectedPriceRanges.length === 0) return true;
    return selectedPriceRanges.some((id) => {
      const range = PRICE_RANGES.find((r) => r.id === id);
      return range ? price >= range.min && price < range.max : true;
    });
  };

  const anyHasLifeMode = useMemo(() => scoped.some((p) => !!p.lifeMode), [scoped]);
  const anyHasCollection = useMemo(
    () => scoped.some((p) => !!(p.collectionName || p.season)),
    [scoped]
  );

  const filtered = useMemo(() => {
    const result = scoped.filter((p) => {
      const catOk =
        selectedCategories.length === 0 ||
        selectedCategories.includes(slugify(p.category));

      const searchOk =
        searchTerm === "" ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(searchTerm.toLowerCase());

      // ?mode / ?collection only apply to the un-scoped shop.
      const modeOk = !!scope || !modeSlug || !anyHasLifeMode || slugify(p.lifeMode) === modeSlug;
      const collectionOk =
        !!scope ||
        !collectionSlug ||
        !anyHasCollection ||
        slugify(p.collectionName) === collectionSlug ||
        slugify(p.season) === collectionSlug;

      return catOk && matchesPrice(fromPrice(p)) && searchOk && modeOk && collectionOk;
    });

    switch (sortBy) {
      case "price-asc":
        return [...result].sort((a, b) => fromPrice(a) - fromPrice(b));
      case "price-desc":
        return [...result].sort((a, b) => fromPrice(b) - fromPrice(a));
      default:
        return result;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    scoped,
    selectedCategories,
    selectedPriceRanges,
    searchTerm,
    sortBy,
    modeSlug,
    collectionSlug,
    anyHasLifeMode,
    anyHasCollection,
    scope,
  ]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  // Header: edit pages pass a fixed heading; the shop derives one from filters.
  const derived = useMemo(() => {
    if (searchTerm) return { eyebrow: "The Edit · Search", title: searchTerm };
    if (modeSlug) return { eyebrow: "The Edit · Life Mode", title: prettify(modeParam) };
    if (collectionSlug)
      return { eyebrow: "The Edit · Collection", title: prettify(collectionParam) };
    if (selectedCategories.length === 1) {
      const cat = categoriesWithCounts.find((c) => c.id === selectedCategories[0]);
      return {
        eyebrow: "The Edit · Category",
        title: cat ? cat.label : prettify(selectedCategories[0]),
      };
    }
    return { eyebrow: "The Edit · Shop All", title: "Shop All" };
  }, [
    searchTerm,
    modeSlug,
    modeParam,
    collectionSlug,
    collectionParam,
    selectedCategories,
    categoriesWithCounts,
  ]);

  const { eyebrow, title } = heading ?? derived;

  const panelProps: FilterPanelProps = {
    categories: categoriesWithCounts,
    selectedCategories,
    selectedPriceRanges,
    onToggleCategory: toggleCategory,
    onTogglePriceRange: togglePriceRange,
  };

  const countLabel = `${filtered.length} ${filtered.length === 1 ? "piece" : "pieces"}`;

  return (
    <div className="min-h-screen bg-ivory pt-[68px] lg:pt-[84px]">
      {/* Header band */}
      <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16">
        <Breadcrumbs className="pt-8" />
        <header className="pt-6 lg:pt-8 pb-8 lg:pb-10 border-b border-line">
          <p className="eyebrow text-bronze-deep">{eyebrow}</p>
          <h1 className="font-display font-light text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.08] text-ink mt-4">
            {title}
          </h1>
          <p className="font-sans text-sm text-muted mt-4">
            {loading ? "Loading the edit…" : countLabel}
          </p>
        </header>
      </div>

      {/* Body */}
      <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 pb-24">
        <div className="flex gap-10 lg:gap-14">
          {/* Desktop filters */}
          <aside className="hidden lg:block w-60 xl:w-64 shrink-0">
            <div className="sticky top-[104px] pt-10">
              <FilterPanel {...panelProps} />
            </div>
          </aside>

          {/* Mobile drawer */}
          {drawerOpen && (
            <>
              <div
                className="fixed inset-x-0 bottom-0 top-[68px] z-40 bg-ink/30 lg:hidden"
                onClick={() => setDrawerOpen(false)}
                aria-hidden="true"
              />
              <div className="fixed bottom-0 left-0 top-[68px] z-40 w-80 max-w-full bg-cream overflow-y-auto lg:hidden shadow-2xl">
                <div className="flex items-center justify-between px-6 pt-6 pb-4">
                  <span className="eyebrow text-bronze-deep">Filters</span>
                  <button
                    onClick={() => setDrawerOpen(false)}
                    aria-label="Close filters"
                    className="p-2 -mr-2 rounded-full hover:bg-ink/5 text-ink transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="px-6 pb-10">
                  <FilterPanel {...panelProps} />
                </div>
              </div>
            </>
          )}

          {/* Main column */}
          <main className="flex-1 min-w-0 pt-10">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 pb-8 border-b border-line">
              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 font-sans uppercase tracking-[0.15em] text-[11px] text-ink border border-line px-4 py-2.5 hover:border-ink transition-colors"
              >
                <SlidersHorizontal size={14} />
                Filters
              </button>

              <p className="hidden lg:block font-sans text-sm text-muted">{countLabel}</p>

              <div className="flex items-center gap-3">
                <label htmlFor="sort" className="hidden sm:inline eyebrow text-faint">
                  Sort
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-transparent border border-line text-ink font-sans uppercase tracking-[0.14em] text-[11px] px-4 py-2.5 pr-8 cursor-pointer outline-none focus:border-ink transition-colors"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active search chip */}
            {searchTerm && (
              <p className="font-sans text-sm text-muted mt-6">
                Results for <span className="text-ink">&ldquo;{searchTerm}&rdquo;</span>
                <button
                  onClick={() => setSearchTerm("")}
                  className="ml-3 link-underline text-bronze-deep text-xs uppercase tracking-[0.15em]"
                >
                  Clear
                </button>
              </p>
            )}

            {/* Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-32">
                <div className="h-6 w-6 rounded-full border-2 border-ink/20 border-t-ink animate-spin" />
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 mt-10">
                {filtered.map((product, i) => (
                  <Reveal key={product._id} delay={(i % 4) * 0.06}>
                    <ProductCard product={product} />
                  </Reveal>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-32">
                <p className="eyebrow text-bronze-deep">Nothing here yet</p>
                <h3 className="font-display font-light text-3xl text-ink mt-4">
                  No pieces match this edit
                </h3>
                <p className="font-sans text-sm text-muted mt-3 max-w-sm">
                  Try loosening the filters, or clear them to browse the full collection.
                </p>
                <div className="mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCategories([]);
                      setSelectedPriceRanges([]);
                      setSearchTerm("");
                    }}
                  >
                    Clear filters
                  </Button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// ─── Wrapper (Suspense for useSearchParams) ─────────────────────────────────

export default function ProductBrowser(props: ProductBrowserProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-ivory pt-[84px] flex items-center justify-center">
          <div className="h-6 w-6 rounded-full border-2 border-ink/20 border-t-ink animate-spin" />
        </div>
      }
    >
      <BrowserContent {...props} />
    </Suspense>
  );
}
