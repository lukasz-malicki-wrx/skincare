"use client";

import { usePathname } from "next/navigation";
import { routes } from "@/config/routes";
import { useMessages } from "@/components/locale-provider";

/** Screen numbers from scope-mvp.md; the bar replaces "Step 4 of 11" text. */
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

  return (
    <div
      role="progressbar"
      aria-label={progressLabel}
      aria-valuemin={1}
      aria-valuemax={TOTAL_STEPS}
      aria-valuenow={step}
      className="h-1 w-full overflow-hidden rounded-full bg-line"
    >
      <div className="h-full rounded-full bg-accent" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
    </div>
  );
}
