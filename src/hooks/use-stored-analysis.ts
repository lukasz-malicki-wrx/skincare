"use client";

import { useLocalJson, writeLocalJson } from "@/hooks/use-local-json";
import { STORAGE_KEY, parseStoredAnalysis, type StoredAnalysis } from "@/lib/skin-analysis";

/**
 * The last analysis from localStorage: `undefined` during SSR and hydration, `null` when there is
 * none. Every write goes through `saveStoredAnalysis`, so all readers in the tab update together.
 */
export function useStoredAnalysis(): StoredAnalysis | null | undefined {
  return useLocalJson(STORAGE_KEY, parseStoredAnalysis)[0];
}

export function saveStoredAnalysis(next: StoredAnalysis) {
  writeLocalJson(STORAGE_KEY, next);
}
