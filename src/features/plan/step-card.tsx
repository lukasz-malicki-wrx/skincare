"use client";

import { memo } from "react";
import { Button } from "@/components/button";
import { preloadProductDialog } from "@/features/plan/lazy-product-dialog";
import { formatPln } from "@/i18n/format";
import { useMessages } from "@/i18n/locale-provider";
import { nextCandidate, type PlanStep } from "@/lib/plan";
import { Text } from "@/components/text";
import { Card } from "@/components/card";
import { StepNumber } from "@/components/step-number";

/** One routine step. Memoised: the callbacks are stable and the step keeps its identity until it changes. */
export const StepCard = memo(function StepCard({
  step,
  onOpen,
  onSwap,
  onReset,
}: {
  step: PlanStep;
  onOpen: (stepKey: string) => void;
  onSwap: (step: PlanStep) => void;
  onReset: (stepKey: string) => void;
}) {
  const copy = useMessages().plan;
  const p = step.product;
  const canSwap = nextCandidate(step) !== null;

  return (
    <Card as="li" tone="surface" className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <StepNumber>{step.ref.index + 1}</StepNumber>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <Text weight="medium" className="capitalize">{step.ref.step}</Text>
          <Text variant="body-sm" tone="muted">{step.ref.ingredient}</Text>
        </div>
      </div>

      {p ? (
        <button
          type="button"
          onClick={() => onOpen(step.ref.key)}
          onPointerEnter={preloadProductDialog}
          onFocus={preloadProductDialog}
          aria-haspopup="dialog"
          className="flex flex-col gap-0.5 rounded-xl bg-paper px-3 py-2 text-left"
        >
          <Text as="span" variant="body-sm" tone="accent" weight="medium">{p.name}</Text>
          <Text as="span" variant="body-sm" tone="muted">
            {p.shop}
            {p.pricePln !== null && `, ${formatPln(p.pricePln)}`}
          </Text>
          <Text as="span" variant="body-sm" tone="muted">{p.howTo}</Text>
        </button>
      ) : (
        <Text variant="body-sm" tone="muted">{copy.noProduct}</Text>
      )}

      <div className="flex gap-2">
        <Button onClick={() => onSwap(step)} disabled={!canSwap} variant="outline" size="sm">
          {copy.swap}
        </Button>
        {step.swapped && (
          <Button onClick={() => onReset(step.ref.key)} variant="ghost" size="sm">
            {copy.undo}
          </Button>
        )}
      </div>
    </Card>
  );
});
