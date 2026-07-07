import { getProductRepository } from "@/services/repositories";
import type { ProductRepository } from "@/services/repositories/product-repository";
import type { Category } from "@/types/category";
import type { Money } from "@/types/money";
import type {
  PaginatedResult,
  Product,
  ProductQuery,
  ProductRecord,
  ProductSort,
  ProductSummary,
} from "@/types/product";
import type { ProductVariant } from "@/types/variant";

/**
 * Catalogue read service consumed by the Shop page, Product page, Featured and
 * Signature sections. It depends only on the ProductRepository abstraction, so
 * the data source can move from mock to Supabase without touching this file or
 * any UI. It returns customer-facing read models (active variants only) and
 * composes normalized records into the shapes the UI needs.
 */
export class ProductService {
  constructor(private readonly repository: ProductRepository) {}

  async listProducts(query: ProductQuery = {}): Promise<PaginatedResult<ProductSummary>> {
    const [products, variants, categories] = await Promise.all([
      this.repository.findAllProducts(),
      this.repository.findAllVariants(),
      this.repository.findAllCategories(),
    ]);

    const categoryById = new Map(categories.map((category) => [category.id, category]));
    const activeVariantsByProduct = groupActiveVariantsByProduct(variants);

    let summaries = products.map((product) =>
      toSummary(
        product,
        categoryById.get(product.categoryId) ?? unknownCategory(product.categoryId),
        activeVariantsByProduct.get(product.id) ?? [],
      ),
    );

    if (query.categorySlug) {
      summaries = summaries.filter((summary) => summary.category.slug === query.categorySlug);
    }
    if (query.featured !== undefined) {
      summaries = summaries.filter((summary) => summary.isFeatured === query.featured);
    }
    if (query.signature !== undefined) {
      summaries = summaries.filter((summary) => summary.isSignature === query.signature);
    }
    if (query.search) {
      const needle = query.search.trim().toLowerCase();
      summaries = summaries.filter((summary) => summary.name.toLowerCase().includes(needle));
    }

    summaries = sortSummaries(summaries, query.sort ?? "featured");

    const total = summaries.length;
    const offset = Math.max(0, query.offset ?? 0);
    const limit = query.limit ?? total;
    const items = summaries.slice(offset, offset + limit);

    return { items, total, limit, offset };
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const record = await this.repository.findProductBySlug(slug);
    return record ? this.composeProduct(record) : null;
  }

  async getProductById(id: string): Promise<Product | null> {
    const record = await this.repository.findProductById(id);
    return record ? this.composeProduct(record) : null;
  }

  async getFeaturedProducts(limit?: number): Promise<readonly ProductSummary[]> {
    const { items } = await this.listProducts({ featured: true, sort: "featured", limit });
    return items;
  }

  async getSignatureProducts(limit?: number): Promise<readonly ProductSummary[]> {
    const { items } = await this.listProducts({ signature: true, sort: "featured", limit });
    return items;
  }

  async getCategories(): Promise<readonly Category[]> {
    const categories = await this.repository.findAllCategories();
    return [...categories].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  getCategoryBySlug(slug: string): Promise<Category | null> {
    return this.repository.findCategoryBySlug(slug);
  }

  private async composeProduct(record: ProductRecord): Promise<Product> {
    const [category, variants] = await Promise.all([
      this.repository.findCategoryById(record.categoryId),
      this.repository.findVariantsByProductId(record.id),
    ]);

    return {
      id: record.id,
      name: record.name,
      slug: record.slug,
      category: category ?? unknownCategory(record.categoryId),
      description: record.description,
      featuredImage: record.featuredImage,
      galleryImages: record.galleryImages,
      isFeatured: record.isFeatured,
      isSignature: record.isSignature,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      variants: sortActiveVariants(variants),
    };
  }
}

/** Default singleton wired to the configured repository. UI imports this. */
export const productService = new ProductService(getProductRepository());

// ---------------------------------------------------------------------------
// Internal composition helpers
// ---------------------------------------------------------------------------

function sortActiveVariants(variants: readonly ProductVariant[]): ProductVariant[] {
  return variants
    .filter((variant) => variant.status === "active")
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

function groupActiveVariantsByProduct(
  variants: readonly ProductVariant[],
): Map<string, ProductVariant[]> {
  const map = new Map<string, ProductVariant[]>();
  for (const variant of sortActiveVariants(variants)) {
    const list = map.get(variant.productId) ?? [];
    list.push(variant);
    map.set(variant.productId, list);
  }
  return map;
}

function toSummary(
  record: ProductRecord,
  category: Category,
  activeVariants: readonly ProductVariant[],
): ProductSummary {
  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    category,
    featuredImage: record.featuredImage,
    isFeatured: record.isFeatured,
    isSignature: record.isSignature,
    priceFrom: lowestPrice(activeVariants),
    variantCount: activeVariants.length,
    inStock: activeVariants.some((variant) => variant.stockQuantity > 0),
    createdAt: record.createdAt,
  };
}

function lowestPrice(variants: readonly ProductVariant[]): Money | null {
  return variants.reduce<Money | null>((lowest, variant) => {
    if (!lowest || variant.price.amount < lowest.amount) {
      return variant.price;
    }
    return lowest;
  }, null);
}

function sortSummaries(summaries: ProductSummary[], sort: ProductSort): ProductSummary[] {
  const copy = [...summaries];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => priceValue(a) - priceValue(b));
    case "price-desc":
      return copy.sort((a, b) => priceValue(b) - priceValue(a));
    case "name-asc":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "newest":
      return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "featured":
    default:
      return copy.sort(
        (a, b) => Number(b.isFeatured) - Number(a.isFeatured) || a.name.localeCompare(b.name),
      );
  }
}

function priceValue(summary: ProductSummary): number {
  return summary.priceFrom?.amount ?? Number.POSITIVE_INFINITY;
}

function unknownCategory(id: string): Category {
  return { id, name: "Uncategorized", slug: "uncategorized", displayOrder: Number.MAX_SAFE_INTEGER };
}
