import type { Metadata } from "next";
import Link from "next/link";
import { PlanView } from "@/components/plan-view";
import { routes } from "@/config/routes";
import { fill } from "@/i18n/format";
import { getTranslations } from "@/i18n/locale";
import type { Messages } from "@/i18n/translations";
import { requireSessionContext } from "@/lib/auth";
import { hasAccess, MONTHLY_PRICE_PLN } from "@/lib/subscription";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t.plan.title };
}

/** Screens 14-16. Locked until the mocked purchase: blurred preview with a lock that leads to the paywall. */
export default async function PlanPage() {
  const [t, { subscription }] = await Promise.all([getTranslations(), requireSessionContext()]);

  return (
    <section className="flex flex-1 flex-col gap-5">
      <h1 className="heading-md">{t.plan.title}</h1>
      {hasAccess(subscription) ? <PlanView /> : <LockedPlan copy={t.plan} />}
    </section>
  );
}

function LockedPlan({ copy }: { copy: Messages["plan"] }) {
  const preview = [copy.preview.cleanser, copy.preview.serum, copy.preview.moisturizer, copy.preview.spf];

  return (
    <div className="relative flex flex-1 flex-col">
      <div aria-hidden className="pointer-events-none select-none blur-sm">
        <ol className="flex flex-col gap-3">
          {preview.map((label, i) => (
            <li key={label} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-peach-light text-sm">{i + 1}</span>
              <span className="body-md">{label}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-paper" aria-hidden>
          <LockGlyph />
        </span>
        <p className="title-lg">{copy.ready}</p>
        <p className="body-md text-ink/70">{fill(copy.unlockBody, { price: MONTHLY_PRICE_PLN })}</p>
        <Link href={routes.app.onboarding.paywall} className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper">
          {copy.unlock}
        </Link>
      </div>
    </div>
  );
}

function LockGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}
