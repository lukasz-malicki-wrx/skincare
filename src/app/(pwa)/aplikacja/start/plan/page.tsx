import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AnalysisReport } from "@/components/analysis-report";
import { routes } from "@/config/routes";
import { getTranslations } from "@/i18n/locale";
import { requireSessionContext } from "@/lib/auth";
import { hasAccess } from "@/lib/subscription";

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
      <h1 className="body-sm text-ink/60">{t.result.planTitle}</h1>
      <AnalysisReport part="plan" />
    </section>
  );
}
