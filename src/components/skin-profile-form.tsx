"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMessages } from "@/components/locale-provider";
import { useLocalJson } from "@/components/use-local-json";
import { useStoredAnalysis } from "@/components/use-stored-analysis";
import { STORAGE_KEY, type StoredAnalysis } from "@/lib/skin-analysis";
import {
  ALLERGY_OPTIONS,
  BUDGET_MAX,
  BUDGET_MIN,
  DIET_OPTIONS,
  PROFILE_KEY,
  SKIN_TYPES,
  aiFilledFields,
  parseProfile,
  profileFromAnalysis,
  type SkinProfile,
} from "@/lib/skin-profile";

/**
 * Screens 8 and 9: skin type, allergies, monthly budget and diet restrictions.
 * In onboarding the CTA reads "Build my plan" and leads to the paywall; from Profile it saves and returns.
 */
export function SkinProfileForm({
  submitLabel,
  nextHref,
  rebuildRoutine = false,
}: {
  submitLabel: string;
  nextHref: string;
  /** Onboarding: saving the form marks the routine as not built, so the plan screen rebuilds it from these answers. */
  rebuildRoutine?: boolean;
}) {
  const [saved, setProfile] = useLocalJson(PROFILE_KEY, parseProfile);
  const stored = useStoredAnalysis();
  if (saved === undefined || stored === undefined) return null;
  const analysis = stored?.result ?? null;
  return (
    <Form
      initial={profileFromAnalysis(saved, analysis)}
      ai={aiFilledFields(saved, analysis)}
      submitLabel={submitLabel}
      nextHref={nextHref}
      onSave={(profile) => {
        setProfile(profile);
        if (rebuildRoutine && stored) {
          const pending: StoredAnalysis = { ...stored, routineReady: false, routineProducts: undefined, routineProductsVersion: undefined };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
        }
      }}
    />
  );
}

function Form({
  initial,
  ai,
  submitLabel,
  nextHref,
  onSave,
}: {
  initial: SkinProfile;
  ai: { skinType: boolean; allergies: boolean };
  submitLabel: string;
  nextHref: string;
  onSave: (p: SkinProfile) => void;
}) {
  const router = useRouter();
  const copy = useMessages().profile.skin;
  const skinTypeLabel = useMessages().skinType;
  const [draft, setDraft] = useState<SkinProfile>(initial);

  const toggle = (field: "allergies" | "diet", value: string) =>
    setDraft((d) => ({
      ...d,
      [field]: d[field].includes(value) ? d[field].filter((v) => v !== value) : [...d[field], value],
    }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSave(draft);
    router.push(nextHref);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-2">
        <Legend ai={ai.skinType && draft.skinType === initial.skinType}>{copy.skinType}</Legend>
        <div className="flex flex-wrap gap-2">
          {SKIN_TYPES.map((type) => (
            <Chip key={type} active={draft.skinType === type} onClick={() => setDraft((d) => ({ ...d, skinType: type }))}>
              {skinTypeLabel[type]}
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <Legend ai={ai.allergies && draft.allergies === initial.allergies}>{copy.allergies}</Legend>
        <div className="flex flex-wrap gap-2">
          {ALLERGY_OPTIONS.map((a) => (
            <Chip key={a} active={draft.allergies.includes(a)} onClick={() => toggle("allergies", a)}>
              {copy.allergy[a]}
            </Chip>
          ))}
          {draft.allergies
            .filter((a) => !ALLERGY_OPTIONS.includes(a as (typeof ALLERGY_OPTIONS)[number]))
            .map((a) => (
              <Chip key={a} active onClick={() => toggle("allergies", a)}>
                {a}
              </Chip>
            ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="flex w-full items-baseline justify-between body-sm text-ink/60">
          <span>{copy.budget}</span>
          <span className="title-md text-ink">{draft.budgetPln} zł</span>
        </legend>
        <input
          type="range"
          min={BUDGET_MIN}
          max={BUDGET_MAX}
          step={10}
          value={draft.budgetPln}
          onChange={(e) => {
            const budgetPln = Number(e.target.value);
            setDraft((d) => ({ ...d, budgetPln }));
          }}
          className="w-full accent-[var(--color-accent)]"
        />
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <Legend ai={false}>{copy.diet}</Legend>
        <div className="flex flex-wrap gap-2">
          {DIET_OPTIONS.map((d) => (
            <Chip key={d} active={draft.diet.includes(d)} onClick={() => toggle("diet", d)}>
              {copy.dietOption[d]}
            </Chip>
          ))}
        </div>
      </fieldset>

      <button type="submit" className="rounded-full bg-ink px-6 py-4 font-semibold text-paper">
        {submitLabel}
      </button>
    </form>
  );
}

/** Field label with an "AI" tag while the value is still the one the analysis suggested. */
function Legend({ ai, children }: { ai: boolean; children: React.ReactNode }) {
  const aiFilled = useMessages().profile.skin.aiFilled;
  return (
    <legend className="flex items-center gap-2 body-sm text-ink/60">
      {children}
      {ai && (
        <span className="rounded-full bg-brand-peach-light px-2 py-0.5 text-[11px] font-medium text-ink" title={aiFilled}>
          AI
        </span>
      )}
    </legend>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 text-sm ${
        active ? "border-accent bg-accent text-paper" : "border-line"
      }`}
    >
      {children}
    </button>
  );
}
