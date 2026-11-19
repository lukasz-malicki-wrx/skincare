"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { startTrialAction } from "@/app/actions/subscription";
import { useMessages } from "@/components/locale-provider";
import { routes } from "@/config/routes";
import { fill } from "@/i18n/format";

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
        className="absolute top-4 left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-ink/60"
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
        <h1 className="heading-lg mt-1.5">{copy.proTitle}</h1>
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

      <div role="radiogroup" aria-label={copy.proTitle} className="relative flex flex-col gap-3 px-5">
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
      </div>

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
        <p className="flex items-center gap-1.5 text-[13px] text-ink/60">
          <LockIcon />
          {copy.secured}
        </p>
        <nav aria-label={copy.terms} className="flex w-full justify-between px-3 pt-1 text-[13px] text-ink/60">
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
        <p className="text-center text-[11px] text-ink/40">{copy.demo}</p>
      </div>
    </div>
  );
}

function PlanOption({
  selected,
  badge,
  title,
  note,
  price,
  period,
  onSelect,
}: {
  selected: boolean;
  badge: string | null;
  title: string;
  note: string;
  price: string;
  period: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`relative flex min-h-[72px] items-center gap-3.5 rounded-[20px] border-[1.5px] px-[18px] py-3.5 text-left ${
        selected ? "border-accent bg-white" : "border-ink/10 bg-white/55"
      }`}
    >
      {badge && (
        <span className="absolute -top-2.5 right-4 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-white">
          {badge}
        </span>
      )}
      <span
        className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-[1.5px] ${
          selected ? "border-accent" : "border-ink/25"
        }`}
      >
        <span className={`h-2.5 w-2.5 rounded-full bg-accent ${selected ? "opacity-100" : "opacity-0"}`} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[17px] font-semibold">{title}</span>
        <span className="text-sm text-ink/70">{note}</span>
      </span>
      <span className="flex flex-col items-end gap-0.5">
        <span className="title-lg">{price}</span>
        <span className="text-[13px] text-ink/60">{period}</span>
      </span>
    </button>
  );
}

function Processing({ stage, stages }: { stage: number; stages: string[] }) {
  const copy = useMessages().paywall;
  const done = stage >= stages.length;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
      <div className="relative flex h-24 w-24 items-center justify-center">
        {done ? (
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-4xl text-white">✓</span>
        ) : (
          <span className="h-20 w-20 animate-spin rounded-full border-4 border-line border-t-accent" />
        )}
      </div>
      <ul className="flex flex-col gap-2">
        {stages.map((label, i) => (
          <li key={label} className={`body-md transition-opacity ${i < stage ? "text-ink" : i === stage ? "text-ink/70" : "text-ink/30"}`}>
            {i < stage ? "✓ " : ""}
            {label}
          </li>
        ))}
      </ul>
      {done && (
        <div className="flex flex-col gap-1">
          <p className="title-lg">{copy.acceptedTitle}</p>
          <p className="body-sm text-ink/60">{copy.opening}</p>
        </div>
      )}
    </div>
  );
}

function Arches() {
  return (
    <svg viewBox="0 0 390 260" className="pointer-events-none absolute top-0 left-0 h-auto w-full" aria-hidden>
      <path d="M85 260V150a110 110 0 0 1 220 0v110" fill="none" className="stroke-brand-peach" strokeWidth="1" />
      <path d="M55 260V150a140 140 0 0 1 280 0v110" fill="none" className="stroke-brand-peach-light" strokeWidth="1" />
      <path d="M25 260V150a170 170 0 0 1 340 0v110" fill="none" className="stroke-brand-peach-light" strokeWidth="1" />
      <path
        d="M322 70C323 75.3 324.7 77 330 78C324.7 79 323 80.7 322 86C321 80.7 319.3 79 314 78C319.3 77 321 75.3 322 70Z"
        className="fill-ink"
      />
      <path
        d="M70 118C70.6 121.2 71.6 122.2 74.8 122.8C71.6 123.4 70.6 124.4 70 127.6C69.4 124.4 68.4 123.4 65.2 122.8C68.4 122.2 69.4 121.2 70 118Z"
        className="fill-accent"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M19.5 14.5A7.5 7.5 0 1 1 9.5 4.5a6 6 0 0 0 10 10z" />
      <path d="M17.5 2.5c.3 1.7.9 2.3 2.5 2.5-1.6.2-2.2.8-2.5 2.5-.3-1.7-.9-2.3-2.5-2.5 1.6-.2 2.2-.8 2.5-2.5z" />
    </svg>
  );
}

function ScanIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M3 7V4h3M18 4h3v3M21 17v3h-3M6 20H3v-3" />
      <path d="M7 8v8M10 8v8M12.5 8v8M16 8v8" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M10 6c.9 4.6 1.8 5.5 6.5 6.5-4.7 1-5.6 1.9-6.5 6.5-.9-4.6-1.8-5.5-6.5-6.5 4.7-1 5.6-1.9 6.5-6.5z" />
      <path d="M18 2.5c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3z" />
    </svg>
  );
}

function TrendIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M3 20h18" />
      <path d="M4 16l5-5 4 3 7-7" />
      <path d="M15 7h5v5" />
    </svg>
  );
}
