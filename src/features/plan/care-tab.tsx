"use client";

import { useCallback, useId, useMemo, useState } from "react";
import { TabPanel, Tabs } from "@/components/tabs";
import { BudgetBar } from "@/features/plan/budget-bar";
import { ProductDialog } from "@/features/plan/lazy-product-dialog";
import { PERIODS } from "@/features/plan/plan-options";
import { StepCard } from "@/features/plan/step-card";
import { usePlanSwaps } from "@/features/plan/use-plan-state";
import { useSearchParamOption } from "@/hooks/use-search-param-option";
import { useMessages } from "@/i18n/locale-provider";
import { buildPlan, nextCandidate, planTotal, type PlanStep } from "@/lib/plan";
import type { StoredAnalysis } from "@/lib/skin-analysis";
import type { SkinProfile } from "@/lib/skin-profile";
import { Text } from "@/components/text";

export function CareTab({ stored, profile }: Readonly<{ stored: StoredAnalysis; profile: SkinProfile }>) {
  const copy = useMessages().plan;
  const { swaps, swap, reset } = usePlanSwaps();
  const [period, setPeriod] = useSearchParamOption("period", PERIODS, "morning");
  const [openKey, setOpenKey] = useState<string | null>(null);
  const tabsId = useId();
  const periodOptions = useMemo(() => PERIODS.map((value) => ({ value, label: copy[value] })), [copy]);

  // Memoised so the step objects keep their identity and unchanged cards skip re-rendering.
  const steps = useMemo(() => (swaps ? buildPlan(stored.result, profile, swaps) : []), [stored.result, profile, swaps]);

  const swapStep = useCallback(
    (step: PlanStep) => {
      const next = nextCandidate(step);
      if (next) swap(step.ref.key, next.id);
    },
    [swap],
  );
  const closeDialog = useCallback(() => setOpenKey(null), []);

  if (swaps === undefined) return null;

  const visible = steps.filter((s) => s.ref.period === period);
  const total = planTotal(steps);
  const open = steps.find((s) => s.ref.key === openKey) ?? null;

  return (
    <>
      <BudgetBar total={total} budget={profile.budgetPln} />

      <Tabs id={tabsId} label={copy.periods} options={periodOptions} value={period} onChange={setPeriod} variant="pills" />

      <TabPanel id={tabsId} value={period}>
        {visible.length === 0 ? (
          <Text tone="muted">{period === "morning" ? copy.noMorning : copy.noEvening}</Text>
        ) : (
          <ol className="flex flex-col gap-3">
            {visible.map((s) => (
              <StepCard key={s.ref.key} step={s} onOpen={setOpenKey} onSwap={swapStep} onReset={reset} />
            ))}
          </ol>
        )}
      </TabPanel>

      {open && <ProductDialog step={open} onSwap={swapStep} onClose={closeDialog} />}
    </>
  );
}
