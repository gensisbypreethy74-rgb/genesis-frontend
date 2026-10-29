import type { Metadata } from "next";
import ProductBrowser from "../../../components/shop/ProductBrowser";

export const metadata: Metadata = { title: "Within" };

export default function WithinPage() {
  return (
    <ProductBrowser
      scope={{ sectionSlugs: ["within"], modeSlugs: ["at-home-identity"] }}
      heading={{
        eyebrow: "The Edit · Within",
        title: "Within",
        description:
          "For the identity lived at home — the quiet hours, the unwatched ones. Pieces cut for ease that keep their composure long after the door is closed.",
      }}
    />
  );
}
