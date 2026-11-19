"use client";

import { useMemo, useSyncExternalStore } from "react";
import { STORAGE_KEY, type StoredAnalysis } from "@/lib/skin-analysis";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}
const readRaw = () => localStorage.getItem(STORAGE_KEY);
const readServer = () => undefined;

/**
 * Ostatnia analiza z localStorage.
 * `undefined` = jeszcze na serwerze / hydracja, `null` = brak analizy.
 */
export function useStoredAnalysis(): StoredAnalysis | null | undefined {
  const raw = useSyncExternalStore(subscribe, readRaw, readServer);

  return useMemo(() => {
    if (raw === undefined) return undefined;
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredAnalysis;
    } catch {
      return null;
    }
  }, [raw]);
}
