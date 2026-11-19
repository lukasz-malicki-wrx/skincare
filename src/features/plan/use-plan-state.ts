"use client";

import { useCallback } from "react";
import { useLocalJson } from "@/hooks/use-local-json";
import { PLAN_KEY, parseSwaps } from "@/lib/plan";

/** The user's product swaps per routine step, persisted in localStorage. */
export function usePlanSwaps() {
  const [swaps, setSwaps] = useLocalJson(PLAN_KEY, parseSwaps);

  const swap = useCallback(
    (stepKey: string, productId: string) => setSwaps({ ...(swaps ?? {}), [stepKey]: productId }),
    [swaps, setSwaps],
  );

  const reset = useCallback(
    (stepKey: string) => {
      const next = { ...(swaps ?? {}) };
      delete next[stepKey];
      setSwaps(next);
    },
    [swaps, setSwaps],
  );

  return { swaps, swap, reset };
}
