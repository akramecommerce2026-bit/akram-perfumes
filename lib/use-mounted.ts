import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Returns false during SSR and the first (hydration) render, true thereafter.
 *
 * Uses useSyncExternalStore rather than a setState-in-effect so it stays
 * lint-clean and avoids a hydration mismatch — the pattern for gating on
 * client-only state such as a localStorage-hydrated cart.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
