import { filterSummaries, paginate, sortSummaries } from "@/lib/product-filters";
import { getProductRepository } from "@/services/repositories";
import type { ProductRepository } from "@/services/repositories/product-repository";
import type { Category } from "@/types/category";
import type {
  PaginatedResult,
  Product,
  ProductQuery,
  ProductRecord,
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
    const summaries = await this.buildSummaries();

    const filtered = filterSummaries(summaries, query);
    const sorted = sortSummaries(filtered, query.sort ?? "featured");

    const total = sorted.length;
    const offset = Math.max(0, query.offset ?? 0);
    const limit = query.limit ?? total;

    return { items: paginate(sorted, limit, offset), total, limit, offset };
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

  private async buildSummaries(): Promise<ProductSummary[]> {
    const [products, variants, categories] = await Promise.all([
      this.repository.findAllProducts(),
      this.repository.findAllVariants(),
      this.repository.findAllCategories(),
    ]);

    const categoryById = new Map(categories.map((category) => [category.id, category]));
    const activeVariantsByProduct = groupActiveVariantsByProduct(variants);

    return products.map((product) =>
      toSummary(
        product,
        categoryById.get(product.categoryId) ?? unknownCategory(product.categoryId),
        activeVariantsByProduct.get(product.id) ?? [],
      ),
    );
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
      shortDescription: record.shortDescription,
      description: record.description,
      featuredImage: record.featuredImage,
      galleryImages: record.galleryImages,
      rating: record.rating,
      reviewCount: record.reviewCount,
      fragranceFamily: record.fragranceFamily,
      gender: record.gender,
      occasions: record.occasions,
      notes: record.notes,
      profile: record.profile,
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
  const cheapest = lowestPricedVariant(activeVariants);

  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    category,
    shortDescription: record.shortDescription,
    featuredImage: record.featuredImage,
    rating: record.rating,
    reviewCount: record.reviewCount,
    fragranceFamily: record.fragranceFamily,
    gender: record.gender,
    occasions: record.occasions,
    isFeatured: record.isFeatured,
    isSignature: record.isSignature,
    priceFrom: cheapest?.price ?? null,
    comparePriceFrom: cheapest?.comparePrice ?? null,
    variantNames: activeVariants.map((variant) => variant.variantName),
    variantCount: activeVariants.length,
    inStock: activeVariants.some((variant) => variant.stockQuantity > 0),
    createdAt: record.createdAt,
  };
}

function lowestPricedVariant(variants: readonly ProductVariant[]): ProductVariant | null {
  return variants.reduce<ProductVariant | null>((lowest, variant) => {
    if (!lowest || variant.price.amount < lowest.price.amount) {
      return variant;
    }
    return lowest;
  }, null);
}

function unknownCategory(id: string): Category {
  return { id, name: "Uncategorized", slug: "uncategorized", displayOrder: Number.MAX_SAFE_INTEGER };
}
