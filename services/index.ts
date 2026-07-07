/**
 * Public entry point for the service layer.
 *
 * UI code imports from here (or `@/services/product-service`) and never from
 * `@/lib/products` or the repositories directly, keeping components fully
 * independent of the data source.
 */
export { ProductService, productService } from "@/services/product-service";
export { getProductRepository } from "@/services/repositories";
export type { ProductRepository } from "@/services/repositories/product-repository";
