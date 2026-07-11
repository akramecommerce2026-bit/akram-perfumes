import Image from "next/image";
import { Package, Trophy } from "lucide-react";

import { formatMoney } from "@/lib/money";
import type { BestSellingProduct } from "@/types/admin-analytics";

export function BestSellers({ products, rangeLabel }: { products: readonly BestSellingProduct[]; rangeLabel: string }) {
  return (
    <section className="flex flex-col rounded-2xl border border-border bg-card shadow-sm">
      <header className="flex items-center gap-2 border-b border-border px-6 py-4">
        <Trophy className="size-4 text-accent" aria-hidden="true" />
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground">Best Selling Products</h2>
          <p className="text-xs text-muted-foreground">Top {products.length || 10} · {rangeLabel}</p>
        </div>
      </header>

      {products.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-muted-foreground">
          No sales in this period yet.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {products.map((product, index) => (
            <li key={product.productId} className="flex items-center gap-4 px-6 py-3">
              <span className="w-5 shrink-0 text-center text-sm font-medium text-muted-foreground">
                {index + 1}
              </span>
              <div className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted">
                {product.image ? (
                  <Image src={product.image} alt={product.name} fill sizes="44px" className="object-cover" />
                ) : (
                  <span className="flex size-full items-center justify-center text-muted-foreground">
                    <Package className="size-5" aria-hidden="true" />
                  </span>
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium text-foreground">{product.name}</span>
                <span className="text-xs text-muted-foreground">{product.unitsSold} units sold</span>
              </div>
              <span className="shrink-0 text-sm font-semibold text-foreground">
                {formatMoney(product.revenue)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
