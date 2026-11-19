"use client";

import { useCallback } from "react";
import { useLocalJson } from "@/components/use-local-json";

export const PLAN_KEY = "pielegnacja:plan";

/** Step key -> catalogue product id the user swapped in. Absent = the report's own pick. */
export type PlanSwaps = Record<string, string>;

function parseSwaps(raw: string | null): PlanSwaps {
  if (!raw) return {};
  try {
    const value = JSON.parse(raw) as unknown;
    if (!value || typeof value !== "object") return {};
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).filter(([, v]) => typeof v === "string"),
    ) as PlanSwaps;
  } catch {
    return {};
  }
}

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
