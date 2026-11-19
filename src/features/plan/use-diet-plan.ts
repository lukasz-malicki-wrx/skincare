"use client";

import { useCallback, useEffect, useState } from "react";
import { removeLocalJson, useLocalJson } from "@/hooks/use-local-json";
import { isAbortError, postJson } from "@/lib/api-client";
import { DIET_KEY, dietInputsKey, parseStoredDiet, type DietItem, type DietPlan, type DietRequest } from "@/lib/diet";

/** Stored on items the user adds, so a language switch can still show the translated line. */
export const ADDED_BY_YOU = "Added by you.";

export type DietList = keyof DietPlan;

/**
 * The diet list for the current inputs, cached in localStorage per inputs. A missing or stale
 * list means "loading": the effect fetches and stores it. Regenerate just clears the stored list.
 */
export function useDietPlan(request: DietRequest) {
  const [saved, setSaved] = useLocalJson(DIET_KEY, parseStoredDiet);
  const [error, setError] = useState<unknown>(null);
  // The key is the request in canonical form: it is the effect's only dependency.
  const inputsKey = dietInputsKey(request);
  const plan = saved?.inputsKey === inputsKey ? saved.plan : null;
  const loading = saved !== undefined && !plan && error === null;

  useEffect(() => {
    if (!loading) return;
    const controller = new AbortController();
    postJson<{ plan: DietPlan }>("/api/diet", requestFromKey(inputsKey), controller.signal)
      .then((res) => setSaved({ inputsKey, plan: res.plan }))
      .catch((err: unknown) => {
        if (!isAbortError(err)) setError(err);
      });
    return () => controller.abort();
  }, [loading, inputsKey, setSaved]);

  const removeItem = useCallback(
    (list: DietList, item: DietItem) => {
      if (plan) setSaved({ inputsKey, plan: { ...plan, [list]: plan[list].filter((i) => i !== item) } });
    },
    [plan, inputsKey, setSaved],
  );

  const addItem = useCallback(
    (text: string) => {
      const item = text.trim();
      if (plan && item) setSaved({ inputsKey, plan: { ...plan, eat_more: [...plan.eat_more, { item, why: ADDED_BY_YOU }] } });
    },
    [plan, inputsKey, setSaved],
  );

  const regenerate = useCallback(() => {
    setError(null);
    removeLocalJson(DIET_KEY);
  }, []);

  return { ready: saved !== undefined, plan, loading, error, removeItem, addItem, regenerate };
}

function requestFromKey(inputsKey: string): DietRequest {
  const [locale, skinType, concerns, restrictions] = JSON.parse(inputsKey) as [string, string, string[], string[]];
  return { locale, skinType, concerns, restrictions };
}
