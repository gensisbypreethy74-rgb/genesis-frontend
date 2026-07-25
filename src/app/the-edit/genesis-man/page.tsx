import ProductBrowser from "../../../components/shop/ProductBrowser";

export default function GenesisManPage() {
  // Section-only match (no life modes), so women's Ambition/Occasion pieces
  // never leak into the men's archive. Accepts both slug spellings.
  return (
    <ProductBrowser
      scope={{ sectionSlugs: ["genesis-men", "genesis-man"], modeSlugs: [] }}
      heading={{
        eyebrow: "Genesis Man · Founding Archive",
        title: "Genesis Men",
        description:
          "The founding Genesis Man archive: botanical embroidery, a single placement, a mandarin collar, a knotted closure. The same three laws, a new set of shoulders.",
      }}
    />
  );
}
