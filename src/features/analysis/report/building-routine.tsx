"use client";

import { useCallback, useState } from "react";
import { RoutineBuilder } from "@/features/analysis/report/routine-builder";
import type { StoredAnalysis } from "@/lib/skin-analysis";

/**
 * Shown after the profile form: the routine is built from the photo assessment plus the form.
 * Once it is saved the stored report has `routineReady: true` and AnalysisReport switches to the
 * plan. A new `key` restarts the request on retry.
 */
export function BuildingRoutine({ stored }: { stored: StoredAnalysis }) {
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return <RoutineBuilder key={attempt} stored={stored} onRetry={retry} />;
}
