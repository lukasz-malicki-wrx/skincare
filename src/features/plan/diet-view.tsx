"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/button";
import { InlineLoading } from "@/components/spinner";
import { routes } from "@/config/routes";
import { DietList } from "@/features/plan/diet-list";
import { useDietPlan } from "@/features/plan/use-diet-plan";
import { fill } from "@/i18n/format";
import { useLocale, useMessages } from "@/i18n/locale-provider";
import { requestErrorMessage } from "@/lib/api-client";
import type { StoredAnalysis } from "@/lib/skin-analysis";
import type { SkinProfile } from "@/lib/skin-profile";
import { Alert } from "@/components/alert";
import { Text } from "@/components/text";
import { TextLink } from "@/components/text-link";
import { Input } from "@/components/input";

/** Screen 15: eat more / limit, filtered by the diet restrictions from the profile. Loaded lazily. */
export function DietView({ stored, profile }: { stored: StoredAnalysis; profile: SkinProfile }) {
  const locale = useLocale();
  const messages = useMessages();
  const copy = messages.plan.dietList;
  const dietLabels = messages.profile.skin.dietOption;
  const { ready, plan, loading, error, removeItem, addItem, regenerate } = useDietPlan({
    locale,
    skinType: profile.skinType ?? stored.result.skin_type,
    concerns: stored.result.findings.map((f) => f.name),
    restrictions: profile.diet,
  });
  const [draft, setDraft] = useState("");

  if (!ready) return null;

  function submit(e: FormEvent) {
    e.preventDefault();
    addItem(draft);
    setDraft("");
  }

  const restrictions = profile.diet.map((item) => (item in dietLabels ? dietLabels[item as keyof typeof dietLabels] : item));

  return (
    <div className="flex flex-col gap-5">
      <Text variant="body-sm" tone="muted">
        {restrictions.length > 0 ? fill(copy.adjustedFor, { list: restrictions.join(", ") }) : copy.noRestrictions}{" "}
        <TextLink href={routes.app.skinProfile}>
          {copy.editRestrictions}
        </TextLink>
      </Text>

      {loading && <InlineLoading label={copy.building} />}
      {error !== null && (
        <Alert>
          {requestErrorMessage(error, messages.errors)}
        </Alert>
      )}

      {plan && (
        <>
          <DietList list="eat_more" title={copy.eatMore} items={plan.eat_more} onRemove={removeItem} />
          <form onSubmit={submit} className="flex gap-2">
            <Input
              size="sm"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={copy.addPlaceholder}
              aria-label={copy.addPlaceholder}
              className="min-w-0 flex-1"
            />
            <Button type="submit" variant="outline" size="sm">
              {copy.add}
            </Button>
          </form>
          <DietList list="limit" title={copy.limit} items={plan.limit} onRemove={removeItem} />
        </>
      )}

      <Button onClick={regenerate} disabled={loading} variant="outline">
        {copy.regenerate}
      </Button>
    </div>
  );
}
