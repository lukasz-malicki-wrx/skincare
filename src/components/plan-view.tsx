"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { routes } from "@/config/routes";
import { DietView } from "@/components/diet-view";
import { useMessages } from "@/components/locale-provider";
import { ProductDialog } from "@/components/product-dialog";
import { useLocalJson } from "@/components/use-local-json";
import { usePlanSwaps } from "@/components/use-plan-state";
import { useStoredAnalysis } from "@/components/use-stored-analysis";
import { fill } from "@/i18n/format";
import { buildPlan, nextCandidate, planTotal, type PlanStep } from "@/lib/plan";
import type { StoredAnalysis } from "@/lib/skin-analysis";
import { PROFILE_KEY, parseProfile, type SkinProfile } from "@/lib/skin-profile";

type Tab = "care" | "diet";
type Period = "morning" | "evening";

function formatPln(value: number) {
  return `${value.toFixed(0)} zł`;
}

/** Screens 14 and 15: the plan with its two tabs. Needs an analysis; otherwise points to the camera. */
export function PlanView() {
  const copy = useMessages().plan;
  const stored = useStoredAnalysis();
  const [profile] = useLocalJson(PROFILE_KEY, parseProfile);
  const [tab, setTab] = useState<Tab>("care");

  if (stored === undefined || profile === undefined) return null;
  if (!stored || !stored.result.photo_quality.ok) return <NoPlan />;
  // The photo is saved, but the routine is built on the paywall's next screen.
  if (stored.routineReady === false) return <ResumeRoutine />;

  return (
    <div className="flex flex-col gap-5">
      <div role="tablist" className="flex gap-1 rounded-full bg-brand-peach-light/40 p-1">
        {(["care", "diet"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-full py-2 text-sm font-medium ${
              tab === t ? "bg-paper shadow-sm" : "text-ink/60"
            }`}
          >
            {copy[t]}
          </button>
        ))}
      </div>

      {tab === "care" ? <CareTab stored={stored} profile={profile} /> : <DietView stored={stored} profile={profile} />}
    </div>
  );
}

function CareTab({ stored, profile }: { stored: StoredAnalysis; profile: SkinProfile }) {
  const copy = useMessages().plan;
  const { swaps, swap, reset } = usePlanSwaps();
  const [period, setPeriod] = useState<Period>("morning");
  const [openKey, setOpenKey] = useState<string | null>(null);

  if (swaps === undefined) return null;

  const steps = buildPlan(stored.result, profile, swaps);
  const visible = steps.filter((s) => s.ref.period === period);
  const emptyPeriod = { morning: copy.noMorning, evening: copy.noEvening }[period];
  const total = planTotal(steps);
  const over = total - profile.budgetPln;
  const open = steps.find((s) => s.ref.key === openKey) ?? null;

  function swapStep(step: PlanStep) {
    const next = nextCandidate(step);
    if (next) swap(step.ref.key, next.id);
  }

  return (
    <div className="flex flex-col gap-5">
      <BudgetBar total={total} budget={profile.budgetPln} over={over} />

      <div role="tablist" className="flex gap-2">
        {(["morning", "evening"] as const).map((p) => (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={period === p}
            onClick={() => setPeriod(p)}
            className={`rounded-full border px-4 py-1.5 text-sm ${
              period === p ? "border-accent bg-accent text-paper" : "border-line"
            }`}
          >
            {copy[p]}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="body-md text-ink/60">{emptyPeriod}</p>
      ) : (
        <ol className="flex flex-col gap-3">
          {visible.map((s) => (
            <StepCard
              key={s.ref.key}
              step={s}
              onOpen={() => setOpenKey(s.ref.key)}
              onSwap={() => swapStep(s)}
              onReset={() => reset(s.ref.key)}
            />
          ))}
        </ol>
      )}

      <ProductDialog
        product={open?.product ?? null}
        stepLabel={
          open
            ? fill(copy.product.step, {
                period: copy[open.ref.period],
                n: open.ref.index + 1,
                name: open.ref.step,
              })
            : ""
        }
        canSwap={open ? nextCandidate(open) !== null : false}
        onSwap={() => {
          if (open) swapStep(open);
        }}
        onClose={() => setOpenKey(null)}
      />
    </div>
  );
}

function BudgetBar({ total, budget, over }: { total: number; budget: number; over: number }) {
  const copy = useMessages().plan;
  const ratio = Math.min(1, budget > 0 ? total / budget : 0);
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-line p-4">
      <div className="flex items-baseline justify-between">
        <span className="body-sm text-ink/60">{copy.cost}</span>
        <span className="title-md">
          {formatPln(total)} <span className="body-sm text-ink/50">{fill(copy.ofBudget, { amount: formatPln(budget) })}</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-line/60">
        <div
          className={`h-full rounded-full ${over > 0 ? "bg-red-700" : "bg-gradient-to-r from-brand-peach to-brand-terracotta"}`}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      {over > 0 ? (
        <p className="body-sm text-red-800">{fill(copy.overBudget, { amount: formatPln(over) })}</p>
      ) : (
        <p className="body-sm text-ink/50">
          {copy.budgetFrom}{" "}
          <Link href={routes.app.skinProfile} className="text-accent">
            {copy.skinProfile}
          </Link>
          .
        </p>
      )}
    </div>
  );
}

function StepCard({
  step,
  onOpen,
  onSwap,
  onReset,
}: {
  step: PlanStep;
  onOpen: () => void;
  onSwap: () => void;
  onReset: () => void;
}) {
  const copy = useMessages().plan;
  const p = step.product;
  const canSwap = nextCandidate(step) !== null;

  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-peach-light text-sm font-medium">
          {step.ref.index + 1}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="body-md font-medium capitalize">{step.ref.step}</p>
          <p className="body-sm text-ink/60">{step.ref.ingredient}</p>
        </div>
      </div>

      {p ? (
        <button type="button" onClick={onOpen} className="flex flex-col gap-0.5 rounded-xl bg-paper px-3 py-2 text-left">
          <span className="body-sm font-medium text-accent">{p.name}</span>
          <span className="body-sm text-ink/60">
            {p.shop}
            {p.pricePln !== null && `, ${p.pricePln.toFixed(2).replace(".", ",")} zł`}
          </span>
          <span className="body-sm text-ink/70">{p.howTo}</span>
        </button>
      ) : (
        <p className="body-sm text-ink/50">{copy.noProduct}</p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onSwap}
          disabled={!canSwap}
          className="rounded-full border border-line px-4 py-2 text-sm disabled:opacity-40"
        >
          {copy.swap}
        </button>
        {step.swapped && (
          <button type="button" onClick={onReset} className="rounded-full px-4 py-2 text-sm text-ink/60">
            {copy.undo}
          </button>
        )}
      </div>
    </li>
  );
}

/** A confirmed photo whose routine is not built yet. The plan screen builds it. */
function ResumeRoutine() {
  const router = useRouter();
  const copy = useMessages().result;

  useEffect(() => {
    router.replace(routes.app.onboarding.plan);
  }, [router]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <span className="h-12 w-12 animate-spin rounded-full border-4 border-line border-t-accent" aria-hidden />
      <p className="body-md text-ink/70">{copy.buildingRoutine}</p>
    </div>
  );
}

function NoPlan() {
  const copy = useMessages().plan;
  return (
    <div className="flex flex-col gap-4">
      <p className="body-lg text-ink/80">{copy.noPlan}</p>
      <Link href={routes.app.onboarding.photo} className="rounded-full bg-ink px-6 py-4 text-center font-semibold text-paper">
        {copy.takePhoto}
      </Link>
    </div>
  );
}
