import ProductBrowser from "../../../components/shop/ProductBrowser";

export default function BeyondPage() {
  return (
    <ProductBrowser
      scope={{ sectionSlugs: ["beyond"], modeSlugs: ["ambition", "occasion", "casual-out"] }}
      heading={{ eyebrow: "The Edit · Beyond", title: "Beyond" }}
    />
  );
}
