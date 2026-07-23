import ProductBrowser from "../../../components/shop/ProductBrowser";

export default function WithinPage() {
  return (
    <ProductBrowser
      scope={{ sectionSlugs: ["within"], modeSlugs: ["at-home-identity"] }}
      heading={{ eyebrow: "The Edit · Within", title: "Within" }}
    />
  );
}
