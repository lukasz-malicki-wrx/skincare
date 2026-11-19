"use client";

import { useEffect, useState } from "react";
import { readLocalJson } from "@/hooks/use-local-json";
import { saveStoredAnalysis } from "@/hooks/use-stored-analysis";
import { useLocale } from "@/i18n/locale-provider";
import { isAbortError, postJson } from "@/lib/api-client";
import {
  PRODUCTS_VERSION,
  routineSteps,
  type RoutineProducts,
  type RoutineProductsRequest,
  type RoutineProductsResponse,
} from "@/lib/products";
import type { StoredAnalysis } from "@/lib/skin-analysis";
import { BUDGET_DEFAULT, PROFILE_KEY, parseSavedProfile } from "@/lib/skin-profile";

export type RoutineProductsState =
  | { status: "skipped" }
  | { status: "loading" }
  | { status: "done"; products: RoutineProducts }
  | { status: "error" };

/**
 * One product per routine step. The search starts as soon as the report opens and the result is
 * written back into the stored analysis, so reopening the report is free. "Done" is derived from
 * the stored report rather than kept in state: once the products are saved, the search stops.
 */
export function useRoutineProducts(stored: StoredAnalysis): RoutineProductsState {
  const locale = useLocale();
  const [failed, setFailed] = useState(false);
  const cached = cachedProducts(stored);
  const searchable = stored.result.photo_quality.ok && routineSteps(stored.result).length > 0;
  const needsSearch = !cached && searchable && !failed;

  useEffect(() => {
    if (!needsSearch) return;
    const controller = new AbortController();
    const profile = readLocalJson(PROFILE_KEY, parseSavedProfile);

    const body: RoutineProductsRequest = {
      steps: routineSteps(stored.result),
      skinType: stored.result.skin_type,
      avoid: stored.result.avoid_ingredients,
      profile,
      budgetPln: profile?.budgetPln ?? BUDGET_DEFAULT,
      locale,
    };

    postJson<RoutineProductsResponse>("/api/products", body, controller.signal)
      .then(({ products }) =>
        saveStoredAnalysis({ ...stored, routineProducts: products, routineProductsVersion: PRODUCTS_VERSION }),
      )
      .catch((error: unknown) => {
        if (!isAbortError(error)) setFailed(true);
      });

    return () => controller.abort();
  }, [needsSearch, locale, stored]);

  if (cached) return { status: "done", products: cached };
  if (!searchable) return { status: "skipped" };
  return failed ? { status: "error" } : { status: "loading" };
}

/** Products saved with the current search version; older caches are searched again. */
function cachedProducts(stored: StoredAnalysis): RoutineProducts | null {
  return stored.routineProducts && stored.routineProductsVersion === PRODUCTS_VERSION ? stored.routineProducts : null;
}
