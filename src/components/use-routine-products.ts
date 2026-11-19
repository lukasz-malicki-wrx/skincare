"use client";

import { useEffect, useState } from "react";
import {
  PRODUCTS_VERSION,
  routineSteps,
  type RoutineProducts,
  type RoutineProductsRequest,
  type RoutineProductsResponse,
} from "@/lib/products";
import { useLocale, useMessages } from "@/components/locale-provider";
import { STORAGE_KEY, type StoredAnalysis } from "@/lib/skin-analysis";
import { PROFILE_KEY, parseProfile } from "@/lib/skin-profile";

export type RoutineProductsState =
  | { status: "skipped" }
  | { status: "loading" }
  | { status: "done"; products: RoutineProducts }
  | { status: "error"; message: string };

/**
 * One product per routine step. The search starts as soon as the report opens and the
 * result is written back into the stored analysis, so reopening the report is free.
 */
export function useRoutineProducts(stored: StoredAnalysis): RoutineProductsState {
  const locale = useLocale();
  const networkError = useMessages().errors.network;
  const [state, setState] = useState<RoutineProductsState>(() => initialState(stored));

  useEffect(() => {
    if (state.status !== "loading") return;
    let cancelled = false;

    const body: RoutineProductsRequest = {
      steps: routineSteps(stored.result),
      skinType: stored.result.skin_type,
      avoid: stored.result.avoid_ingredients,
      profile: readProfile(),
      budgetPln: parseProfile(localStorage.getItem(PROFILE_KEY)).budgetPln,
      locale,
    };

    fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then(async (res) => {
        const json = (await res.json()) as RoutineProductsResponse | { error: string };
        if (!res.ok || "error" in json) {
          throw new Error("error" in json ? json.error : `Error ${res.status}`);
        }
        return json.products;
      })
      .then((products) => {
        if (cancelled) return;
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ ...stored, routineProducts: products, routineProductsVersion: PRODUCTS_VERSION }),
        );
        setState({ status: "done", products });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({ status: "error", message: err instanceof Error ? err.message : networkError });
      });

    return () => {
      cancelled = true;
    };
  }, [locale, networkError, state.status, stored]);

  return state;
}

function initialState(stored: StoredAnalysis): RoutineProductsState {
  if (stored.routineProducts && stored.routineProductsVersion === PRODUCTS_VERSION) {
    return { status: "done", products: stored.routineProducts };
  }
  const hasSteps = stored.result.photo_quality.ok && routineSteps(stored.result).length > 0;
  return hasSteps ? { status: "loading" } : { status: "skipped" };
}

function readProfile(): unknown {
  try {
    const raw = localStorage.getItem("pielegnacja:profile");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
