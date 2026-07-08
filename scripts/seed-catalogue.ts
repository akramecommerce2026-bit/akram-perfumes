/**
 * Seeds the Supabase catalogue (categories, products, images, notes, variants)
 * from the app's existing data in `lib/`, keeping a single source of truth.
 *
 * Idempotent: upserts by id, and replaces images/notes per product on each run.
 * Requires the service-role key (bypasses RLS). Run with Node's env-file flag:
 *
 *   npx tsx --env-file=.env.local scripts/seed-catalogue.ts
 *
 * The client is created inline (not via lib/supabase/admin) so this standalone
 * script doesn't pull in the `server-only` guard.
 */
import { createClient } from "@supabase/supabase-js";

import { categoryRecords } from "../lib/categories";
import { productRecords, variantRecords } from "../lib/products";
import type { Database, TablesInsert } from "../lib/supabase/database.types";
// Reuse the app's normalized URL (strips a stray trailing slash / `/rest/v1`)
// and validated service-role key so the script and app connect identically.
import { getServiceRoleKey, isSupabaseConfigured, supabaseUrl } from "../lib/supabase/env";

if (!isSupabaseConfigured()) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
      "Run with: npx tsx --env-file=.env.local scripts/seed-catalogue.ts",
  );
}

const db = createClient<Database>(supabaseUrl, getServiceRoleKey(), {
  auth: { persistSession: false },
});

async function seed(): Promise<void> {
  // Categories --------------------------------------------------------------
  const categories: TablesInsert<"categories">[] = categoryRecords.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description ?? null,
    display_order: category.displayOrder,
  }));
  await upsert("categories", categories);
  console.log(`✓ ${categories.length} categories`);

  // Products ----------------------------------------------------------------
  const products: TablesInsert<"products">[] = productRecords.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    category_id: product.categoryId,
    short_description: product.shortDescription,
    description: product.description,
    featured_image: product.featuredImage,
    gender: product.gender,
    fragrance_family: product.fragranceFamily,
    occasions: [...product.occasions],
    concentration: product.profile.concentration,
    longevity: product.profile.longevity,
    projection: product.profile.projection,
    seasons: [...product.profile.seasons],
    rating: product.rating,
    review_count: product.reviewCount,
    is_featured: product.isFeatured,
    is_signature: product.isSignature,
    active: true,
  }));
  await upsert("products", products);
  console.log(`✓ ${products.length} products`);

  // Images + notes are replaced per product so re-runs stay clean.
  const productIds = productRecords.map((product) => product.id);
  await db.from("product_images").delete().in("product_id", productIds);
  await db.from("fragrance_notes").delete().in("product_id", productIds);

  const images: TablesInsert<"product_images">[] = productRecords.flatMap((product) =>
    product.galleryImages.map((imageUrl, index) => ({
      product_id: product.id,
      url: imageUrl,
      alt: `${product.name} — image ${index + 1}`,
      is_primary: false,
      display_order: index,
    })),
  );
  if (images.length > 0) {
    const { error } = await db.from("product_images").insert(images);
    if (error) throw error;
  }
  console.log(`✓ ${images.length} product images`);

  const notes: TablesInsert<"fragrance_notes">[] = productRecords.flatMap((product) => [
    ...product.notes.top.map((note, i) => note_row(product.id, "top", note, i)),
    ...product.notes.heart.map((note, i) => note_row(product.id, "heart", note, i)),
    ...product.notes.base.map((note, i) => note_row(product.id, "base", note, i)),
  ]);
  if (notes.length > 0) {
    const { error } = await db.from("fragrance_notes").insert(notes);
    if (error) throw error;
  }
  console.log(`✓ ${notes.length} fragrance notes`);

  // Variants ----------------------------------------------------------------
  const variants: TablesInsert<"product_variants">[] = variantRecords.map((variant) => ({
    id: variant.id,
    product_id: variant.productId,
    variant_name: variant.variantName,
    price: variant.price.amount,
    compare_price: variant.comparePrice?.amount ?? null,
    currency: variant.price.currency,
    sku: variant.sku,
    stock: variant.stockQuantity,
    weight_value: variant.weight?.value ?? null,
    weight_unit: variant.weight?.unit ?? null,
    status: variant.status,
    display_order: variant.displayOrder,
  }));
  await upsert("product_variants", variants);
  console.log(`✓ ${variants.length} product variants`);

  console.log("\nCatalogue seed complete.");
}

function note_row(
  productId: string,
  noteType: "top" | "heart" | "base",
  note: string,
  order: number,
): TablesInsert<"fragrance_notes"> {
  return { product_id: productId, note_type: noteType, note, display_order: order };
}

async function upsert<T extends "categories" | "products" | "product_variants">(
  table: T,
  rows: TablesInsert<T>[],
): Promise<void> {
  const { error } = await db.from(table).upsert(rows as never, { onConflict: "id" });
  if (error) throw error;
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
