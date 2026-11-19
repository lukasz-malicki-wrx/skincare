"use client";

import { BuildingRoutine } from "@/features/analysis/report/building-routine";
import { EmptyReport } from "@/features/analysis/report/empty-report";
import { PlanSlides } from "@/features/analysis/report/plan-slides";
import { ReportSlides } from "@/features/analysis/report/report-slides";
import { RetakeReport } from "@/features/analysis/report/retake-report";
import type { ReportPart } from "@/features/analysis/report/slides";
import type { RoutineProductsState } from "@/features/analysis/report/use-routine-products";
import { useStoredAnalysis } from "@/hooks/use-stored-analysis";

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
