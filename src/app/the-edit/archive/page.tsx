import ProductBrowser from "../../../components/shop/ProductBrowser";

export default function ArchivePage() {
  return (
    <ProductBrowser
      scope={{ sectionSlugs: ["archive"], modeSlugs: [] }}
      heading={{ eyebrow: "The Edit · Archive", title: "Archive" }}
    />
  );
}
