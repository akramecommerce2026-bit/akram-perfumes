import type { Product } from "@/types/product";

/**
 * The narrative block.
 *
 * A Server Component: this was a Client Component purely to fade a paragraph in,
 * which meant the product's description shipped at opacity 0 and depended on JS
 * to become readable. The entrance is CSS now, so the copy is visible whatever
 * hydration does.
 */
export function ProductDescription({ product }: { product: Product }) {
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-(--animate-duration-enter) motion-safe:fill-mode-both ease-lux">
      <span className="text-xs font-medium tracking-[0.2em] text-accent uppercase">
        The Experience
      </span>
      <h2 className="text-2xl font-bold text-foreground sm:text-3xl">The Art of {product.name}</h2>
      <span aria-hidden="true" className="h-px w-16 bg-accent/50" />
      <p className="text-[15px] leading-relaxed text-muted-foreground sm:text-base">
        {product.description}
      </p>
    </section>
  );
}
