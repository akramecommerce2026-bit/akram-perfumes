/**
 * A product category (Attars, Perfumes, Incense, Solid Perfumes, ...).
 *
 * Categories are normalized: products reference a category by id, and the
 * service layer resolves the full `Category` into the read models the UI needs.
 */
export interface Category {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly description?: string;
  /**
   * Category artwork, authored in the admin (`/admin/categories`). Empty when no
   * image has been uploaded — the storefront degrades to a plain tile rather
   * than assuming one exists.
   */
  readonly imageUrl?: string;
  readonly displayOrder: number;
}
