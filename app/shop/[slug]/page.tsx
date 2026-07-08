import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { Container } from "@/components/common/container";
import { FragranceNotes } from "@/components/product/FragranceNotes";
import { ProductDescription } from "@/components/product/ProductDescription";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { PurchasePanel } from "@/components/product/PurchasePanel";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { ReviewSection } from "@/components/product/ReviewSection";
import { getProductReviews } from "@/services/review-service";
import { productService } from "@/services/product-service";
import type { Product, ProductSummary } from "@/types/product";

const RELATED_LIMIT = 6;

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
  };
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
    <div className="py-section-sm lg:py-section">
      <Container>
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground lg:mb-10">
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

        <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
          <ProductGallery images={galleryImages} name={product.name} />
          <div className="flex flex-col gap-8">
            <ProductInfo product={product} />
            <PurchasePanel product={product} />
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
