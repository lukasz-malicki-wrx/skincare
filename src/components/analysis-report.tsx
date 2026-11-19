"use client";

import Link from "next/link";
import { useState } from "react";
import { routes } from "@/config/routes";
import { useMessages } from "@/components/locale-provider";
import { countLabel } from "@/i18n/format";
import { stepKey, type Product } from "@/lib/products";
import type { RoutineStepData, SkinAnalysis, StoredAnalysis } from "@/lib/skin-analysis";
import { useRoutineBuild } from "@/components/use-routine-build";
import { useRoutineProducts, type RoutineProductsState } from "@/components/use-routine-products";
import { useSnapCarousel } from "@/components/use-snap-carousel";
import { useStoredAnalysis } from "@/components/use-stored-analysis";

const SEVERITY_WIDTH = { low: "33%", medium: "66%", high: "100%" } as const;

type SlideKey = "skin" | "morning" | "evening" | "next";

/**
 * The onboarding shows the analysis in two screens, in this order:
 * - "skin": the skin report right after the photo (type, concerns). No routine, no products.
 * - "plan": the care plan after the user confirmed budget and preferences. The routine is built
 *   here from the assessment plus that form, then one product per step is searched.
 */
export type ReportPart = "skin" | "plan";

const NO_PRODUCTS: RoutineProductsState = { status: "skipped" };

/**
 * Swipeable stepper. Each slide fills the screen with its content centred; the footer with
 * Back, dots and Next sticks to the bottom and the top bar follows the slides.
 */
export function AnalysisReport({ part }: { part: ReportPart }) {
  const stored = useStoredAnalysis();
  if (stored === undefined) return null;
  if (!stored) return <EmptyReport />;
  if (!stored.result.photo_quality.ok) return <RetakeReport issue={stored.result.photo_quality.issue} />;
  if (part === "skin") return <ReportSlides stored={stored} part="skin" products={NO_PRODUCTS} />;
  if (stored.routineReady === false) return <BuildingRoutine stored={stored} />;
  return <PlanSlides stored={stored} />;
}

/** The plan screen owns the product search, so the skin report never triggers it. */
function PlanSlides({ stored }: { stored: StoredAnalysis }) {
  const products = useRoutineProducts(stored);
  return <ReportSlides stored={stored} part="plan" products={products} />;
}

/**
 * Shown after the profile form: the routine is built from the photo assessment plus the form.
 * A new `key` restarts the request on retry.
 */
function BuildingRoutine({ stored }: { stored: StoredAnalysis }) {
  const [attempt, setAttempt] = useState(0);
  return <RoutineBuilder key={attempt} stored={stored} onRetry={() => setAttempt((n) => n + 1)} />;
}

function RoutineBuilder({ stored, onRetry }: { stored: StoredAnalysis; onRetry: () => void }) {
  const t = useMessages().result;
  const state = useRoutineBuild(stored);

  if (state.status === "done") return <PlanSlides stored={state.stored} />;

  if (state.status === "error") {
    return (
      <div className="flex flex-1 flex-col justify-center gap-6">
        <h2 className="heading-lg">{t.routineFailed}</h2>
        <p role="alert" className="body-md text-ink/70">
          {state.message}
        </p>
        <button type="button" onClick={onRetry} className="rounded-full bg-ink px-6 py-4 font-semibold text-paper">
          {t.tryAgain}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <span className="h-16 w-16 animate-spin rounded-full border-4 border-line border-t-accent" aria-hidden />
      <h2 className="heading-md">{t.buildingRoutine}</h2>
      <p className="body-md text-ink/70">{t.buildingRoutineBody}</p>
    </div>
  );
}

function ReportSlides({
  stored,
  part,
  products,
}: {
  stored: StoredAnalysis;
  part: ReportPart;
  products: RoutineProductsState;
}) {
  const t = useMessages();
  const r = stored.result;
  const slides = slidesFor(r, part);
  // The skin report leads to the preferences form. The plan is already paid for, so it opens the plan tab.
  const exit =
    part === "skin"
      ? { href: routes.app.onboarding.profile, label: t.result.toPreferences }
      : { href: routes.app.plan, label: t.result.startRoutine };
  const { trackRef, index, onScroll, goTo } = useSnapCarousel(slides.length);
  const last = index === slides.length - 1;

  return (
    <div className="-mx-5 flex flex-1 flex-col">
      <SlideProgress current={index} total={slides.length} />

      <ol
        ref={trackRef}
        onScroll={onScroll}
        className="flex flex-1 snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]"
      >
        {slides.map((key) => (
          <li
            key={key}
            className="flex w-full shrink-0 snap-center flex-col justify-center gap-8 px-5 py-8"
          >
            {key === "skin" && <SkinSlide stored={stored} />}
            {key === "morning" && (
              <RoutineSlide title={t.result.morning} period="morning" steps={r.routine.morning} products={products} />
            )}
            {key === "evening" && (
              <RoutineSlide title={t.result.evening} period="evening" steps={r.routine.evening} products={products} />
            )}
            {key === "next" && <NextSlide result={r} />}
          </li>
        ))}
      </ol>

      <nav
        aria-label={t.result.sections}
        className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-line bg-paper px-5 pt-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]"
      >
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          className="rounded-full px-4 py-3 text-sm font-medium text-ink disabled:opacity-30"
        >
          {t.result.back}
        </button>
        <ol className="flex gap-1.5" aria-hidden>
          {slides.map((key, i) => (
            <li
              key={key}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-accent" : "w-1.5 bg-line"}`}
            />
          ))}
        </ol>
        {last ? (
          <Link href={exit.href} className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-paper">
            {exit.label}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-paper"
          >
            {t.result.next}
          </button>
        )}
      </nav>
    </div>
  );
}

function slidesFor(r: SkinAnalysis, part: ReportPart): SlideKey[] {
  if (part === "skin") return ["skin"];
  const keys: SlideKey[] = [];
  if (r.routine.morning.length > 0) keys.push("morning");
  if (r.routine.evening.length > 0) keys.push("evening");
  keys.push("next");
  return keys;
}

function SlideProgress({ current, total }: { current: number; total: number }) {
  const progressLabel = useMessages().result.progress;
  return (
    <div
      role="progressbar"
      aria-label={progressLabel}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current + 1}
      className="mx-5 h-1 overflow-hidden rounded-full bg-line"
    >
      <div
        className="h-full rounded-full bg-accent transition-all duration-300"
        style={{ width: `${((current + 1) / total) * 100}%` }}
      />
    </div>
  );
}

function SkinSlide({ stored }: { stored: StoredAnalysis }) {
  const t = useMessages();
  const r = stored.result;
  return (
    <>
      <header className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={stored.imageDataUrl} alt="" className="h-20 w-16 shrink-0 rounded-2xl object-cover" />
        <div>
          <h2 className="heading-lg">{t.skinType[r.skin_type]}</h2>
        </div>
      </header>

      <p className="body-lg text-ink/80">{r.summary}</p>

      {r.findings.length > 0 ? (
        <ul className="flex flex-col gap-5">
          {r.findings.map((f) => (
            <li key={`${f.name}-${f.area}`} className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-3">
                <span className="body-md font-medium capitalize">{f.name}</span>
                <span className="body-sm text-ink/60">{t.severity[f.severity]}</span>
              </div>
              <MetricBar width={SEVERITY_WIDTH[f.severity]} />
              <span className="body-sm text-ink/50 capitalize">{f.area}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="body-md text-ink/60">{t.result.nothingToFlag}</p>
      )}

      {r.see_a_doctor && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 body-md text-red-900">
          {t.result.seeDoctor}
          {r.see_a_doctor_reason ? ` ${r.see_a_doctor_reason}` : ""}
        </p>
      )}
    </>
  );
}

function MetricBar({ width }: { width: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-line/60" aria-hidden>
      <div
        className="h-full rounded-full bg-gradient-to-r from-brand-peach to-brand-terracotta"
        style={{ width }}
      />
    </div>
  );
}

function RoutineSlide({
  title,
  period,
  steps,
  products,
}: {
  title: string;
  period: "morning" | "evening";
  steps: RoutineStepData[];
  products: RoutineProductsState;
}) {
  const stepsLabel = useMessages().result.steps;
  return (
    <>
      <header className="flex items-baseline justify-between gap-3">
        <h2 className="heading-lg">{title}</h2>
        <span className="body-sm text-ink/60">{countLabel(steps.length, stepsLabel)}</span>
      </header>

      <ol className="flex flex-col gap-3 rounded-3xl bg-brand-peach-light/40 p-4">
        {steps.map((s, i) => (
          <li key={stepKey(period, i)} className="flex gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-peach-light text-sm font-medium">
              {i + 1}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1 pt-1">
              <p className="body-md font-medium capitalize">{s.step}</p>
              <p className="body-sm text-ink/70">
                {s.ingredient}. {s.why}
              </p>
              <StepProduct state={products} stepKey={stepKey(period, i)} />
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}

function StepProduct({ state, stepKey }: { state: RoutineProductsState; stepKey: string }) {
  const t = useMessages().result;
  if (state.status === "skipped") return null;

  if (state.status === "loading") {
    return (
      <p className="flex items-center gap-2 body-sm text-ink/50">
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        {t.findingProduct}
      </p>
    );
  }

  if (state.status === "error") {
    return <p className="body-sm text-red-800">{t.productSearchFailed}</p>;
  }

  const product = state.products[stepKey];
  if (!product) return <p className="body-sm text-ink/50">{t.noProduct}</p>;
  return <ProductLink product={product} />;
}

function ProductLink({ product }: { product: Product }) {
  return (
    <a
      href={product.url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-1 flex flex-col gap-0.5 rounded-2xl bg-surface px-3 py-2"
    >
      <span className="body-sm font-medium text-accent">{product.name}</span>
      <span className="body-sm text-ink/60">
        {product.shop}
        {product.price_pln !== null && `, ${formatPln(product.price_pln)}`}
      </span>
    </a>
  );
}

function NextSlide({ result }: { result: SkinAnalysis }) {
  const t = useMessages().result;
  return (
    <>
      <h2 className="heading-lg">{t.whatsNext}</h2>

      <div className="flex flex-col gap-1">
        <p className="body-sm text-ink/60">{t.nextPhoto}</p>
        <p className="heading-md">{countLabel(result.followup_days, t.inDays)}</p>
      </div>

      {result.avoid_ingredients.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="body-sm text-ink/60">{t.skipIngredients}</p>
          <ul className="flex flex-wrap gap-2">
            {result.avoid_ingredients.map((a) => (
              <li key={a} className="rounded-full border border-line px-3 py-1.5 body-sm">
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="body-sm text-ink/50">{t.disclaimer}</p>
      <Link href={routes.app.onboarding.photo} className="body-sm font-medium text-accent">
        {t.retakePhoto}
      </Link>
    </>
  );
}

function RetakeReport({ issue }: { issue: string | null }) {
  const t = useMessages().result;
  return (
    <div className="flex flex-1 flex-col justify-center gap-6">
      <h2 className="heading-lg">{t.retakeTitle}</h2>
      <p className="body-lg text-ink/80">{issue ?? t.unclearPhoto}</p>
      <Link
        href={routes.app.onboarding.photo}
        className="rounded-full bg-ink px-6 py-4 text-center font-semibold text-paper"
      >
        {t.takeNewPhoto}
      </Link>
    </div>
  );
}

function EmptyReport() {
  const t = useMessages().result;
  return (
    <div className="flex flex-1 flex-col justify-center gap-6">
      <h2 className="heading-lg">{t.emptyTitle}</h2>
      <p className="body-lg text-ink/80">{t.emptyBody}</p>
      <Link
        href={routes.app.onboarding.photo}
        className="rounded-full bg-ink px-6 py-4 text-center font-semibold text-paper"
      >
        {t.takePhoto}
      </Link>
    </div>
  );
}

function formatPln(value: number) {
  return `${value.toFixed(2).replace(".", ",")} zł`;
}
