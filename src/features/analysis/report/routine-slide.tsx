"use client";

import { StepProduct } from "@/features/analysis/report/step-product";
import type { RoutineProductsState } from "@/features/analysis/report/use-routine-products";
import { countLabel } from "@/i18n/format";
import { useMessages } from "@/i18n/locale-provider";
import { stepKey } from "@/lib/products";
import type { RoutineStepData } from "@/lib/skin-analysis";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { StepNumber } from "@/components/step-number";

export function RoutineSlide({
  title,
  period,
  steps,
  products,
}: Readonly<{
  title: string;
  period: "morning" | "evening";
  steps: RoutineStepData[];
  products: RoutineProductsState;
}>) {
  const stepsLabel = useMessages().result.steps;
  return (
    <>
      <header className="flex items-baseline justify-between gap-3">
        <Heading level={2} variant="heading-lg">{title}</Heading>
        <Text as="span" variant="body-sm" tone="muted">{countLabel(steps.length, stepsLabel)}</Text>
      </header>

      <ol className="flex flex-col gap-3 rounded-3xl bg-brand-peach-light/40 p-4">
        {steps.map((s, i) => (
          <li key={stepKey(period, i)} className="flex gap-3">
            <StepNumber>{i + 1}</StepNumber>
            <div className="flex min-w-0 flex-1 flex-col gap-1 pt-1">
              <Text weight="medium" className="capitalize">{s.step}</Text>
              <Text variant="body-sm" tone="muted">
                {s.ingredient}. {s.why}
              </Text>
              <StepProduct state={products} stepKey={stepKey(period, i)} />
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
