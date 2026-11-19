"use client";

import { useEffect, useState } from "react";
import { useLocale, useMessages } from "@/components/locale-provider";
import { fill } from "@/i18n/format";
import { PROFILE_KEY, parseProfile } from "@/lib/skin-profile";
import { STORAGE_KEY, assessmentOf, withRoutine, type RoutinePlan, type StoredAnalysis } from "@/lib/skin-analysis";

export type RoutineBuildState =
  | { status: "building" }
  | { status: "done"; stored: StoredAnalysis }
  | { status: "error"; message: string };

/**
 * Stage 2 of the analysis: once the user confirmed the profile and budget, the routine is built
 * from the photo assessment plus that form. The merged report is saved, so reopening it is free.
 * Remount the caller (a new `key`) to retry after an error.
 */
export function useRoutineBuild(stored: StoredAnalysis): RoutineBuildState {
  const locale = useLocale();
  const t = useMessages();
  const [state, setState] = useState<RoutineBuildState>({ status: "building" });

  useEffect(() => {
    let cancelled = false;
    const profile = parseProfile(localStorage.getItem(PROFILE_KEY));
    const assessment = assessmentOf(stored.result);

    fetch("/api/routine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assessment, profile, locale }),
    })
      .then(async (res) => {
        const json = (await res.json()) as RoutinePlan | { error: string };
        if (!res.ok || "error" in json) {
          throw new Error("error" in json ? json.error : fill(t.errors.request, { status: res.status }));
        }
        return json;
      })
      .then((plan) => {
        if (cancelled) return;
        const next: StoredAnalysis = {
          ...stored,
          result: withRoutine(stored.result, plan, profile),
          routineReady: true,
          routineProducts: undefined,
          routineProductsVersion: undefined,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setState({ status: "done", stored: next });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({ status: "error", message: err instanceof Error ? err.message : t.errors.network });
      });

    return () => {
      cancelled = true;
    };
    // The request depends on the stored assessment only; locale and messages are read once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stored]);

  return state;
}
