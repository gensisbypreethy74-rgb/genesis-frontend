import type { Metadata } from 'next';
import { fetchProductById, productImagePool, type Product } from '../../../lib/product';
import { resolveImageUrl } from '../../../lib/image';
import { SITE_URL } from '../../../lib/contact';

type Props = { params: Promise<{ id: string }> };

/**
 * Every usable image as an absolute URL, for crawlers and link previews:
 * backend uploads resolve to the API origin, storefront assets to the site.
 */
function absoluteImages(product: Product): string[] {
  return productImagePool(product).map((src) => {
    const url = resolveImageUrl(src);
    return url.startsWith('/') ? `${SITE_URL}${url}` : url;
  });
}

// Metadata and the layout below make the same request; Next memoises it.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProductById(id);
  if (!product) return {};

  const description = product.tagline || product.name || 'View this product at Genesis by Preethy.';
  const image = absoluteImages(product)[0];

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      url: `/products/${id}`,
      images: image ? [image] : undefined,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description,
      images: image ? [image] : undefined,
    },
  };
}

/** schema.org Product, so search engines can show the piece with its price. */
function productJsonLd(product: Product, id: string) {
  const variants = product.variants || [];
  const price = variants[0]?.price;
  // `stock` is only tracked when the studio enters it; 0 means sold out.
  const soldOut = variants.length > 0 && variants.every((v) => v.stock === 0);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: absoluteImages(product),
    description: product.description || product.tagline || undefined,
    // A ₹0 piece is "Enquire" on the site — publishing a free offer would be wrong.
    offers:
      price && price > 0
        ? {
            '@type': 'Offer',
            url: `${SITE_URL}/products/${id}`,
            priceCurrency: 'INR',
            price,
            availability: soldOut ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
          }
        : undefined,
  };
}

export default async function ProductLayout({
  children,
  params,
}: Props & {
  children: React.ReactNode;
}) {
  const { id } = await params;
  const product = await fetchProductById(id);
  // Archived pieces render as "moved on", so they get no listing data.
  const jsonLd = product && product.status !== 'Archived' ? productJsonLd(product, id) : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          // Escaping "<" keeps studio-typed text from closing the script tag.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
      )}
      {children}
    </>
  );
}
