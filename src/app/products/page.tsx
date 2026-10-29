import type { Metadata } from "next";
import ProductBrowser from "../../components/shop/ProductBrowser";

export const metadata: Metadata = { title: "Shop All" };

// The shop / Categories browser — the canonical listing. The four THE EDIT
// pages render the same <ProductBrowser> scoped to their edit section.
export default function ProductsPage() {
  return <ProductBrowser />;
}
