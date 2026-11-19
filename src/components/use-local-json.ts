"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Writes through localStorage and wakes every hook on this key in the same tab. */
export function writeLocalJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
  listeners.forEach((fn) => fn());
}

export function removeLocalJson(key: string) {
  localStorage.removeItem(key);
  listeners.forEach((fn) => fn());
}

/**
 * localStorage as a store: `undefined` during SSR and hydration, otherwise the parsed value.
 * `parse` turns the raw string (or null) into the typed value and must handle bad input.
 */
export function useLocalJson<T>(key: string, parse: (raw: string | null) => T) {
  const raw = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(key),
    () => undefined,
  );
  const value = useMemo(() => (raw === undefined ? undefined : parse(raw)), [raw, parse]);
  const set = useCallback((next: T) => writeLocalJson(key, next), [key]);
  return [value, set] as const;
}
