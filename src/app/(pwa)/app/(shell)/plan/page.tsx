import type { Metadata } from "next";
import { LockedPlan } from "@/features/plan/locked-plan";
import { PlanView } from "@/features/plan/plan-view";
import { getTranslations } from "@/i18n/locale";
import { requireSessionContext } from "@/lib/auth";
import { hasAccess } from "@/lib/subscription";
import { Heading } from "@/components/heading";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t.plan.title };
}

/** Screens 14-16. Locked until the mocked purchase: blurred preview with a lock that leads to the paywall. */
export default async function PlanPage() {
  const [t, { subscription }] = await Promise.all([getTranslations(), requireSessionContext()]);

  return (
    <section className="flex flex-1 flex-col gap-5">
      <Heading level={1} variant="heading-md">{t.plan.title}</Heading>
      {hasAccess(subscription) ? <PlanView /> : <LockedPlan copy={t.plan} />}
    </section>
  );
}
