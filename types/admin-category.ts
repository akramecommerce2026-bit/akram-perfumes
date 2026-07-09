export type CategoryStatus = "active" | "hidden";

/** Row shape for the admin categories table. */
export interface AdminCategoryListItem {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly imageUrl: string;
  readonly productCount: number;
  readonly status: CategoryStatus;
  readonly createdAt: string;
}

/** Full editable category loaded into the edit form. */
export interface AdminCategoryDetail {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly imageUrl: string;
  readonly metaTitle: string;
  readonly metaDescription: string;
  readonly active: boolean;
  readonly productCount: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface AdminCategoryQuery {
  readonly search?: string;
  readonly sort?: "newest" | "oldest" | "name";
  readonly page?: number;
  readonly pageSize?: number;
}

export interface AdminCategoryListResult {
  readonly items: readonly AdminCategoryListItem[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
}
