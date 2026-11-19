"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { routes } from "@/config/routes";
import { useLocale, useMessages } from "@/components/locale-provider";
import { removeLocalJson, useLocalJson } from "@/components/use-local-json";
import { fill } from "@/i18n/format";
import { DIET_KEY, dietInputsKey, parseStoredDiet, type DietItem, type DietPlan, type DietRequest } from "@/lib/diet";
import type { StoredAnalysis } from "@/lib/skin-analysis";
import type { SkinProfile } from "@/lib/skin-profile";

/** Stored on items the user adds, so a language switch can still show the translated line. */
const ADDED_BY_YOU = "Added by you.";

/**
 * The diet list for the current inputs. Missing or stale list means "loading": the effect
 * fetches it and stores it; regenerate just clears the stored list.
 */

function useDietPlan(request: DietRequest) {
  const networkError = useMessages().errors.network;
  const requestError = useMessages().errors.request;
  const [saved, setSaved] = useLocalJson(DIET_KEY, parseStoredDiet);
  const [error, setError] = useState<string | null>(null);
  const inputsKey = dietInputsKey(request);
  const plan = saved && saved.inputsKey === inputsKey ? saved.plan : null;
  const loading = saved !== undefined && !plan && !error;

  useEffect(() => {
    if (!loading) return;
    let cancelled = false;

    fetch("/api/diet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(JSON.parse(inputsKeyToRequest(inputsKey))),
    })
      .then(async (res) => {
        const json = (await res.json()) as { plan: DietPlan } | { error: string };
        if (!res.ok || "error" in json) throw new Error("error" in json ? json.error : fill(requestError, { status: res.status }));
        return json.plan;
      })
      .then((next) => {
        if (!cancelled) setSaved({ inputsKey, plan: next });
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : networkError);
      });

    return () => {
      cancelled = true;
    };
  }, [loading, inputsKey, setSaved, networkError, requestError]);

  const update = (next: DietPlan) => setSaved({ inputsKey, plan: next });
  const regenerate = () => {
    setError(null);
    removeLocalJson(DIET_KEY);
  };

  return { ready: saved !== undefined, plan, loading, error, update, regenerate };
}

/** The inputs key is the request itself in canonical form, so the effect needs nothing else. */
function inputsKeyToRequest(inputsKey: string): string {
  const [locale, skinType, concerns, restrictions] = JSON.parse(inputsKey) as [string, string, string[], string[]];
  return JSON.stringify({ locale, skinType, concerns, restrictions } satisfies DietRequest);
}

/** Screen 15: eat more / limit, filtered by the diet restrictions from the profile. */
export function DietView({ stored, profile }: { stored: StoredAnalysis; profile: SkinProfile }) {
  const locale = useLocale();
  const copy = useMessages().plan.dietList;
  const dietLabels = useMessages().profile.skin.dietOption;
  const { ready, plan, loading, error, update, regenerate } = useDietPlan({
    locale,
    skinType: profile.skinType ?? stored.result.skin_type,
    concerns: stored.result.findings.map((f) => f.name),
    restrictions: profile.diet,
  });
  const [draft, setDraft] = useState("");

  if (!ready) return null;

  function remove(list: keyof DietPlan, item: DietItem) {
    if (!plan) return;
    update({ ...plan, [list]: plan[list].filter((i) => i !== item) });
  }

  function add(e: React.FormEvent) {
    e.preventDefault();
    const item = draft.trim();
    if (!plan || !item) return;
    update({ ...plan, eat_more: [...plan.eat_more, { item, why: ADDED_BY_YOU }] });
    setDraft("");
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="body-sm text-ink/60">
        {profile.diet.length > 0
          ? fill(copy.adjustedFor, { list: profile.diet.map((item) => dietLabel(item, dietLabels)).join(", ") })
          : copy.noRestrictions}{" "}
        <Link href={routes.app.skinProfile} className="text-accent">
          {copy.editRestrictions}
        </Link>
      </p>

      {loading && (
        <p className="flex items-center gap-2 body-sm text-ink/60">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          {copy.building}
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {plan && (
        <>
          <DietList title={copy.eatMore} items={plan.eat_more} onRemove={(i) => remove("eat_more", i)} />
          <form onSubmit={add} className="flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={copy.addPlaceholder}
              className="min-w-0 flex-1 rounded-full border border-line bg-surface px-4 py-2 text-sm"
            />
            <button type="submit" className="rounded-full border border-line px-4 py-2 text-sm">
              {copy.add}
            </button>
          </form>
          <DietList title={copy.limit} items={plan.limit} onRemove={(i) => remove("limit", i)} />
        </>
      )}

      <button
        type="button"
        onClick={regenerate}
        disabled={loading}
        className="rounded-full border border-line px-5 py-3 text-sm disabled:opacity-50"
      >
        {copy.regenerate}
      </button>
    </div>
  );
}

function DietList({ title, items, onRemove }: { title: string; items: DietItem[]; onRemove: (item: DietItem) => void }) {
  const copy = useMessages().plan.dietList;
  return (
    <section className="flex flex-col gap-2">
      <h2 className="title-md">{title}</h2>
      {items.length === 0 ? (
        <p className="body-sm text-ink/50">{copy.nothing}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((i) => (
            <li key={i.item} className="flex items-start gap-3 rounded-2xl border border-line bg-surface px-4 py-3">
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="body-md font-medium capitalize">{i.item}</span>
                <span className="body-sm text-ink/70">{i.why === ADDED_BY_YOU ? copy.addedByYou : i.why}</span>
              </div>
              <button type="button" onClick={() => onRemove(i)} aria-label={fill(copy.remove, { item: i.item })} className="text-ink/40">
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function dietLabel(value: string, labels: { readonly [key: string]: string }) {
  return value in labels ? labels[value] : value;
}
