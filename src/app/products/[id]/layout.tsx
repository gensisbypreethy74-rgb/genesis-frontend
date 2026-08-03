import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> | { id: string } }): Promise<Metadata> {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '')
      : 'http://localhost:5000';
      
    // Fetch directly from the backend API for metadata generation
    const res = await fetch(`${baseUrl}/api/v1/products/${id}`);
    if (!res.ok) return {};
    
    const json = await res.json();
    const product = json?.data;
    
    if (!product) return {};
    
    return {
      title: `${product.name || 'Product'} | Genesis by Preethy`,
      description: product.tagline || product.name || 'View this product at Genesis by Preethy.',
      openGraph: {
        title: product.name,
        description: product.tagline || product.name,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description: product.tagline || product.name,
      },
    };
  } catch (error) {
    console.error("Failed to generate metadata for product:", error);
    return {};
  }
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
