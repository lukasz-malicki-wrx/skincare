"use client";

import { routes } from "@/config/routes";
import { NextSlide } from "@/features/analysis/report/next-slide";
import { RoutineSlide } from "@/features/analysis/report/routine-slide";
import { SkinSlide } from "@/features/analysis/report/skin-slide";
import { SlideNav } from "@/features/analysis/report/slide-nav";
import { SlideProgress } from "@/features/analysis/report/slide-progress";
import { slidesFor, type ReportPart } from "@/features/analysis/report/slides";
import type { RoutineProductsState } from "@/features/analysis/report/use-routine-products";
import { useSnapCarousel } from "@/features/analysis/report/use-snap-carousel";
import { fill } from "@/i18n/format";
import { useMessages } from "@/i18n/locale-provider";
import type { StoredAnalysis } from "@/lib/skin-analysis";

export function ReportSlides({
  stored,
  part,
  products,
}: Readonly<{
  stored: StoredAnalysis;
  part: ReportPart;
  products: RoutineProductsState;
}>) {
  const t = useMessages();
  const r = stored.result;
  const slides = slidesFor(r, part);
  // The skin report leads to the preferences form. The plan is already paid for, so it opens the plan tab.
  const exit =
    part === "skin"
      ? { href: routes.app.onboarding.profile, label: t.result.toPreferences }
      : { href: routes.app.plan, label: t.result.startRoutine };
  const { trackRef, index, onScroll, goTo } = useSnapCarousel(slides.length);

  return (
    <div className="-mx-5 flex flex-1 flex-col">
      <SlideProgress current={index} total={slides.length} />

      <ol
        ref={trackRef}
        onScroll={onScroll}
        // Scrollable regions must be focusable so keyboard users can scroll them (WCAG 2.1.1,
        // axe scrollable-region-focusable), which outranks the rule against tabIndex on lists.
        tabIndex={0} // NOSONAR typescript:S6845
        aria-roledescription="carousel"
        aria-label={part === "skin" ? t.result.title : t.result.planTitle}
        className="flex flex-1 snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]"
      >
        {slides.map((key, i) => (
          <li
            key={key}
            aria-roledescription="slide"
            aria-label={fill(t.result.slide, { n: i + 1, total: slides.length })}
            aria-hidden={i !== index}
            inert={i !== index}
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

      <SlideNav index={index} total={slides.length} exit={exit} onGoTo={goTo} />
    </div>
  );
}
