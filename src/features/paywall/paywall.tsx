"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { startTrialAction } from "@/app/actions/subscription";
import { routes } from "@/config/routes";
import { Arches } from "@/features/paywall/arches";
import { ArrowIcon, CameraIcon, CloseIcon, LockIcon, MoonIcon, ScanIcon, SparkIcon, TrendIcon } from "@/components/icons";
import { PlanOption } from "@/features/paywall/plan-option";
import { Processing } from "@/features/paywall/processing";
import { fill } from "@/i18n/format";
import { useMessages } from "@/i18n/locale-provider";
import { Heading } from "@/components/heading";

const STAGE_MS = 900;

type PlanId = "annual" | "monthly";

/** The paywall artboard: arches, plan radios and Continue. Continue never charges a card. */
export function Paywall() {
  const copy = useMessages().paywall;
  const [plan, setPlan] = useState<PlanId>("annual");
  const [stage, setStage] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const stages = [copy.stages.card, copy.stages.charge, copy.stages.accepted];
  const features = [
    { label: copy.unlocks.report, Icon: CameraIcon },
    { label: copy.unlocks.routine, Icon: MoonIcon },
    { label: copy.unlocks.scan, Icon: ScanIcon },
    { label: copy.unlocks.assistant, Icon: SparkIcon },
    { label: copy.unlocks.progress, Icon: TrendIcon },
  ];

  useEffect(() => {
    if (stage === null) return;
    if (stage < stages.length) {
      const t = setTimeout(() => setStage(stage + 1), STAGE_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => startTransition(() => startTrialAction()), 1200);
    return () => clearTimeout(t);
  }, [stage, stages.length]);

  function start() {
    setStage(0);
  }

  function selectAnnual() {
    setPlan("annual");
  }

  function selectMonthly() {
    setPlan("monthly");
  }

  if (stage !== null) return <Processing stage={stage} stages={stages} />;

  const detail = plan === "annual" ? copy.annualBilled : copy.monthlyDetail;

  return (
    <div className="relative -mx-5 -mt-3 -mb-6 flex min-h-full flex-1 flex-col overflow-hidden bg-paper text-ink">
      <Arches />

      <Link
        href={routes.app.onboarding.report}
        aria-label={copy.close}
        className="absolute top-4 left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-ink/70"
      >
        <CloseIcon />
      </Link>

      <header className="relative flex flex-col items-center gap-2.5 px-6 pt-14 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/landing/img/logo.png"
          alt=""
          className="h-16 w-16 rounded-2xl shadow-lg"
        />
        <Heading level={1} className="mt-1.5">{copy.proTitle}</Heading>
        <p className="text-[15px] text-ink/70">{copy.subtitle}</p>
      </header>

      <ul className="relative flex flex-col gap-2 px-8 pt-5">
        {features.map(({ label, Icon }) => (
          <li key={label} className="flex items-center gap-3.5 text-[15px]">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-peach-light text-ink">
              <Icon />
            </span>
            {label}
          </li>
        ))}
      </ul>

      <div className="min-h-4 flex-1" />

      <fieldset className="relative flex flex-col gap-3 px-5">
        <legend className="sr-only">{copy.proTitle}</legend>
        <PlanOption
          selected={plan === "annual"}
          badge={copy.bestOffer}
          title={copy.annual}
          note={copy.annualBilled}
          price={copy.annualPrice}
          period={copy.perMonth}
          onSelect={selectAnnual}
        />
        <PlanOption
          selected={plan === "monthly"}
          badge={null}
          title={copy.monthly}
          note={copy.monthlyNote}
          price={copy.monthlyPrice}
          period={copy.perMonth}
          onSelect={selectMonthly}
        />
      </fieldset>

      <div className="relative flex flex-col items-center gap-2.5 px-5 pt-4 pb-6">
        <button
          type="button"
          disabled={pending}
          onClick={start}
          className="flex min-h-14 w-full items-center justify-center gap-2.5 rounded-full bg-accent text-[17px] font-semibold text-white disabled:opacity-60"
        >
          {copy.continue}
          <ArrowIcon />
        </button>
        <p className="text-center text-[13px] text-ink/70">{fill(copy.billed, { detail })}</p>
        <p className="flex items-center gap-1.5 text-[13px] text-ink/70">
          <LockIcon size={14} />
          {copy.secured}
        </p>
        <nav aria-label={copy.terms} className="flex w-full justify-between px-3 pt-1 text-[13px] text-ink/70">
          <Link href={routes.app.profile} className="py-1.5">
            {copy.terms}
          </Link>
          <Link href={routes.app.profile} className="py-1.5">
            {copy.privacy}
          </Link>
          <button type="button" onClick={start} className="py-1.5">
            {copy.restore}
          </button>
        </nav>
        <p className="text-center text-[11px] text-ink/70">{copy.demo}</p>
      </div>
    </div>
  );
}
