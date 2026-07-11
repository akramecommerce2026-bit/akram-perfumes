import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { Container } from "@/components/common/container";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { productService } from "@/services/product-service";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await productService.getCategoryBySlug(slug);
  if (!category) return { title: "Collection — Akram Perfumes" };
  return {
    title: `${category.name} — Akram Perfumes`,
    description:
      category.description ?? `Explore the Akram Perfumes ${category.name} collection.`,
  };
}

export default async function CollectionPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await productService.getCategoryBySlug(slug);
  if (!category) notFound();

  const { items } = await productService.listProducts({ categorySlug: slug, sort: "featured" });

  return (
    <div className="py-section-sm lg:py-section">
      <Container>
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/collections" className="transition-colors hover:text-foreground">
            Collections
          </Link>
          <ChevronRight className="size-3.5" aria-hidden="true" />
          <span className="text-foreground">{category.name}</span>
        </nav>

        <header className="mb-8 lg:mb-12">
          <h1 className="font-heading text-4xl font-semibold text-foreground sm:text-5xl">
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-3 max-w-xl text-muted-foreground">{category.description}</p>
          )}
          <p className="mt-3 text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "product" : "products"}
          </p>
        </header>

        <ProductGrid products={items} />
      </Container>
    </div>
  );
}
