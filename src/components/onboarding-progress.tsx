"use client";

import { usePathname } from "next/navigation";
import { ProgressBar } from "@/components/progress-bar";
import { routes } from "@/config/routes";
import { useMessages } from "@/i18n/locale-provider";

/** Screen numbers from docs/scope-mvp.md; the bar replaces "Step 4 of 11" text. */
const STEP_BY_PATH: Record<string, number> = {
  [routes.app.onboarding.photo]: 4,
  [routes.app.onboarding.report]: 6,
  [routes.app.onboarding.profile]: 8,
  [routes.app.onboarding.plan]: 9,
  [routes.app.onboarding.paywall]: 10,
};
const TOTAL_STEPS = 11;

export function OnboardingProgress() {
  const progressLabel = useMessages().onboarding.progress;
  const pathname = usePathname();
  const step = STEP_BY_PATH[pathname] ?? 1;

  return <ProgressBar value={step} min={1} max={TOTAL_STEPS} label={progressLabel} />;
}
