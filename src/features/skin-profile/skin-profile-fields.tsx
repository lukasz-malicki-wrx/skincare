"use client";

import { useRouter } from "next/navigation";
import { useCallback, useId, useState, type FormEvent } from "react";
import { Button } from "@/components/button";
import { ChoiceChip } from "@/components/choice-chip";
import { AiLegend } from "@/features/skin-profile/ai-legend";
import { formatPln } from "@/i18n/format";
import { useMessages } from "@/i18n/locale-provider";
import { ALLERGY_OPTIONS, BUDGET_MAX, BUDGET_MIN, DIET_OPTIONS, SKIN_TYPES, toggleValue, type SkinProfile, type SkinType } from "@/lib/skin-profile";
import { Text } from "@/components/text";

export function SkinProfileFields({
  initial,
  ai,
  submitLabel,
  nextHref,
  onSave,
}: Readonly<{
  initial: SkinProfile;
  ai: { skinType: boolean; allergies: boolean };
  submitLabel: string;
  nextHref: string;
  onSave: (p: SkinProfile) => void;
}>) {
  const router = useRouter();
  const copy = useMessages().profile.skin;
  const budgetId = useId();
  const skinTypeLabel = useMessages().skinType;
  const [draft, setDraft] = useState<SkinProfile>(initial);

  const selectSkinType = useCallback((type: string) => setDraft((d) => ({ ...d, skinType: type as SkinType })), []);
  const toggleAllergy = useCallback((value: string) => setDraft((d) => ({ ...d, allergies: toggleValue(d.allergies, value) })), []);
  const toggleDiet = useCallback((value: string) => setDraft((d) => ({ ...d, diet: toggleValue(d.diet, value) })), []);

  function submit(e: FormEvent) {
    e.preventDefault();
    onSave(draft);
    router.push(nextHref);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-2">
        <AiLegend ai={ai.skinType && draft.skinType === initial.skinType}>{copy.skinType}</AiLegend>
        <div className="flex flex-wrap gap-2">
          {SKIN_TYPES.map((type) => (
            <ChoiceChip key={type} type="radio" name="skinType" value={type} checked={draft.skinType === type} onChange={selectSkinType}>
              {skinTypeLabel[type]}
            </ChoiceChip>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <AiLegend ai={ai.allergies && draft.allergies === initial.allergies}>{copy.allergies}</AiLegend>
        <div className="flex flex-wrap gap-2">
          {ALLERGY_OPTIONS.map((a) => (
            <ChoiceChip key={a} type="checkbox" name="allergies" value={a} checked={draft.allergies.includes(a)} onChange={toggleAllergy}>
              {copy.allergy[a]}
            </ChoiceChip>
          ))}
          {draft.allergies
            .filter((a) => !ALLERGY_OPTIONS.includes(a as (typeof ALLERGY_OPTIONS)[number]))
            .map((a) => (
              <ChoiceChip key={a} type="checkbox" name="allergies" value={a} checked onChange={toggleAllergy}>
                {a}
              </ChoiceChip>
            ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <Text as="div" variant="body-sm" tone="muted" className="flex w-full items-baseline justify-between">
          <label htmlFor={budgetId}>{copy.budget}</label>
          <output htmlFor={budgetId} className="title-md text-ink">
            {formatPln(draft.budgetPln, 0)}
          </output>
        </Text>
        <input
          id={budgetId}
          type="range"
          aria-valuetext={formatPln(draft.budgetPln, 0)}
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
      </div>

      <fieldset className="flex flex-col gap-2">
        <AiLegend ai={false}>{copy.diet}</AiLegend>
        <div className="flex flex-wrap gap-2">
          {DIET_OPTIONS.map((d) => (
            <ChoiceChip key={d} type="checkbox" name="diet" value={d} checked={draft.diet.includes(d)} onChange={toggleDiet}>
              {copy.dietOption[d]}
            </ChoiceChip>
          ))}
        </div>
      </fieldset>

      <Button type="submit" size="lg">
        {submitLabel}
      </Button>
    </form>
  );
}
