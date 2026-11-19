"use client";

import { useEffect, useState } from "react";
import { readLocalJson } from "@/hooks/use-local-json";
import { saveStoredAnalysis } from "@/hooks/use-stored-analysis";
import { useLocale } from "@/i18n/locale-provider";
import { isAbortError, postJson } from "@/lib/api-client";
import { assessmentOf, withRoutine, type RoutinePlan, type StoredAnalysis } from "@/lib/skin-analysis";
import { PROFILE_KEY, parseProfile } from "@/lib/skin-profile";

export type RoutineBuildState = { status: "building" } | { status: "error"; error: unknown };

/**
 * Stage 2 of the analysis: once the user confirmed the profile and budget, the routine is built
 * from the photo assessment plus that form. The merged report is saved with `routineReady: true`,
 * which is what the caller switches on; this hook only reports the request until then.
 * Remount the caller (a new `key`) to retry after an error; unmounting aborts the request.
 */
export function useRoutineBuild(stored: StoredAnalysis): RoutineBuildState {
  const locale = useLocale();
  const [state, setState] = useState<RoutineBuildState>({ status: "building" });

  useEffect(() => {
    const controller = new AbortController();
    const profile = readLocalJson(PROFILE_KEY, parseProfile);
    const body = { assessment: assessmentOf(stored.result), profile, locale };

    postJson<RoutinePlan>("/api/routine", body, controller.signal)
      .then((plan) =>
        saveStoredAnalysis({
          ...stored,
          result: withRoutine(stored.result, plan, profile),
          routineReady: true,
          routineProducts: undefined,
          routineProductsVersion: undefined,
        }),
      )
      .catch((error: unknown) => {
        if (!isAbortError(error)) setState({ status: "error", error });
      });

    return () => controller.abort();
  }, [stored, locale]);

  return state;
}
