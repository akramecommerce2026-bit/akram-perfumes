import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { Accordion } from "@/components/common/accordion";
import { Container } from "@/components/common/container";
import { Surface } from "@/components/common/surface";
import { FragranceNotes } from "@/components/product/FragranceNotes";
import { ProductDescription } from "@/components/product/ProductDescription";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";
import { RecordView } from "@/components/product/RecordView";
import { PurchasePanel } from "@/components/product/PurchasePanel";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { ReviewSection } from "@/components/product/ReviewSection";
import { getProductReviews } from "@/services/review-service";
import { toProductSummary } from "@/lib/product-summary";
import { productService } from "@/services/product-service";
import type { Product, ProductSummary } from "@/types/product";

const RELATED_LIMIT = 6;

// Prebuild the known products, refresh from Supabase every 5 minutes (ISR), and
// render any product added later (e.g. via a future Admin Panel) on first
// request rather than 404ing.
export const revalidate = 300;
export const dynamicParams = true;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const { items } = await productService.listProducts();
  return items.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await productService.getProductBySlug(slug);
  if (!product) return { title: "Product not found — Akram Perfumes" };

  return {
    title: `${product.name} — Akram Perfumes`,
    description: product.shortDescription,
    alternates: { canonical: `/shop/${product.slug}` },
    openGraph: {
      type: "website",
      title: `${product.name} — Akram Perfumes`,
      description: product.shortDescription,
      url: `/shop/${product.slug}`,
      images: product.featuredImage ? [{ url: product.featuredImage }] : undefined,
    },
  };
}

/** Product schema.org JSON-LD for rich search results. */
function productJsonLd(product: Product, images: string[]): string {
  const cheapest = product.variants.reduce<Product["variants"][number] | null>(
    (lowest, variant) =>
      !lowest || variant.price.amount < lowest.price.amount ? variant : lowest,
    null,
  );
  const inStock = product.variants.some((variant) => variant.stockQuantity > 0);

  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    image: images,
    category: product.category.name,
    brand: { "@type": "Brand", name: "Akram Perfumes" },
    ...(product.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
    ...(cheapest
      ? {
          offers: {
            "@type": "Offer",
            price: (cheapest.price.amount / 100).toFixed(2),
            priceCurrency: "INR",
            availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            url: `https://akramperfumes.com/shop/${product.slug}`,
          },
        }
      : {}),
  });
}

async function getRelatedProducts(product: Product): Promise<ProductSummary[]> {
  const sameCategory = await productService.listProducts({
    categorySlug: product.category.slug,
    limit: RELATED_LIMIT + 1,
  });
  const related = sameCategory.items.filter((item) => item.id !== product.id);

  if (related.length < 4) {
    const bestSellers = await productService.listProducts({ sort: "best-selling", limit: 10 });
    const seen = new Set(related.map((item) => item.id));
    for (const item of bestSellers.items) {
      if (item.id !== product.id && !seen.has(item.id)) related.push(item);
    }
  }

  return related.slice(0, RELATED_LIMIT);
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await productService.getProductBySlug(slug);
  if (!product) notFound();

  const [related, reviews] = await Promise.all([
    getRelatedProducts(product),
    getProductReviews(product.id),
  ]);

  const galleryImages = [product.featuredImage, ...product.galleryImages].filter(
    (image, index, all) => all.indexOf(image) === index,
  );

  return (
    <div className="py-8 lg:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: productJsonLd(product, galleryImages) }}
      />
      <RecordView product={toProductSummary(product)} />
      <Container>
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-[13px] text-muted-foreground lg:mb-8">
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="size-3.5" aria-hidden="true" />
          <Link href="/shop" className="transition-colors hover:text-foreground">
            Shop
          </Link>
          <ChevronRight className="size-3.5" aria-hidden="true" />
          <span className="text-foreground">{product.name}</span>
        </nav>

        {/*
          The gallery sticks; the right column scrolls past it.
          
          Only the shorter column can stick: the taller one defines the row, so it
          has no travel inside its grid area and `position: sticky` is inert on it.
          The right column carries the copy, the panel and the disclosures, so it
          is always the taller — which makes the gallery the one that can hold.
          `items-start` is what gives it room to move within its area.
        */}
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-12">
          <div className="lg:sticky lg:top-24">
            <ProductGallery images={galleryImages} name={product.name} />
          </div>

          <div className="flex flex-col gap-7">
            <ProductInfo product={product} />
            <PurchasePanel product={product} />

            {/* Detail lives behind disclosures beside the buy button rather than
                a scroll away, which is what keeps the panel shippable on mobile. */}
            <Surface className="px-5">
              <Accordion title="Description" defaultOpen>
                {product.description}
              </Accordion>
              <Accordion title="Delivery & Returns">
                Free delivery on every order, dispatched in 1–2 business days and typically
                arriving in 3–7 days across India. Unopened items can be returned within 7 days
                of delivery.
              </Accordion>
              <Accordion title="Authenticity">
                Every bottle is filled and sealed in-house in Madurai, and quality-checked
                before dispatch.
              </Accordion>
            </Surface>
          </div>
        </div>

        <div className="mt-16 lg:mt-24">
          <ProductDescription product={product} />
        </div>

        <div className="mt-16 lg:mt-24">
          <FragranceNotes product={product} />
        </div>

        <div className="mt-16 lg:mt-24">
          <RelatedProducts products={related} />
        </div>

        <div className="mt-16 lg:mt-24">
          <RecentlyViewed currentId={product.id} />
        </div>

        <div className="mt-16 lg:mt-24">
          <ReviewSection
            reviews={reviews}
            rating={product.rating}
            reviewCount={product.reviewCount}
          />
        </div>
      </Container>
    </div>
  );
}
