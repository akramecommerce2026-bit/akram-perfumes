import { NextResponse } from "next/server";

import { formatMoney } from "@/lib/money";
import { productService } from "@/services/product-service";

export const dynamic = "force-dynamic";

export interface SearchProductResult {
  id: string;
  name: string;
  slug: string;
  image: string;
  category: string;
  price: string | null;
}

export interface SearchCollectionResult {
  id: string;
  name: string;
  slug: string;
}

export interface SearchResponse {
  query: string;
  products: SearchProductResult[];
  collections: SearchCollectionResult[];
}

export async function GET(request: Request): Promise<NextResponse<SearchResponse>> {
  const query = (new URL(request.url).searchParams.get("q") ?? "").trim();

  if (query.length < 1) {
    return NextResponse.json({ query, products: [], collections: [] });
  }

  const [listing, categories] = await Promise.all([
    productService.listProducts({ search: query, sort: "featured", limit: 8 }),
    productService.getCategories(),
  ]);

  const lower = query.toLowerCase();
  const collections = categories
    .filter((category) => category.name.toLowerCase().includes(lower))
    .slice(0, 5)
    .map((category) => ({ id: category.id, name: category.name, slug: category.slug }));

  const products: SearchProductResult[] = listing.items.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    image: product.featuredImage,
    category: product.category.name,
    price: product.priceFrom ? formatMoney(product.priceFrom) : null,
  }));

  return NextResponse.json({ query, products, collections });
}
