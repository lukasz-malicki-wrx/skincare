"use client";

import { ReportSlides } from "@/features/analysis/report/report-slides";
import { useRoutineProducts } from "@/features/analysis/report/use-routine-products";
import type { StoredAnalysis } from "@/lib/skin-analysis";

/** The plan screen owns the product search, so the skin report never triggers it. */
export function PlanSlides({ stored }: Readonly<{ stored: StoredAnalysis }>) {
  const products = useRoutineProducts(stored);
  return <ReportSlides stored={stored} part="plan" products={products} />;
}
