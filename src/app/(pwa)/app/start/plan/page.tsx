import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AnalysisReport } from "@/features/analysis/report/analysis-report";
import { routes } from "@/config/routes";
import { getTranslations } from "@/i18n/locale";
import { requireSessionContext } from "@/lib/auth";
import { hasAccess } from "@/lib/subscription";
import { Heading } from "@/components/heading";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t.result.planTitle };
}

/**
 * After the mocked payment: the care plan. The routine is built here from the skin assessment
 * plus the confirmed profile and budget, then one product per step is searched.
 */
export default async function OnboardingPlanPage() {
  const [t, { subscription }] = await Promise.all([getTranslations(), requireSessionContext()]);
  if (!hasAccess(subscription)) redirect(routes.app.onboarding.paywall);

  return (
    <section className="flex flex-1 flex-col gap-3">
      <Heading level={1} variant="body-sm" tone="muted">{t.result.planTitle}</Heading>
      <AnalysisReport part="plan" />
    </section>
  );
}
