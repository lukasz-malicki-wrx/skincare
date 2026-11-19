"use client";

import Link from "next/link";
import { routes } from "@/config/routes";
import { useLocale, useMessages } from "@/components/locale-provider";
import { useStoredAnalysis } from "@/components/use-stored-analysis";

export function TodayStart() {
  const locale = useLocale();
  const t = useMessages().today;
  const skinType = useMessages().skinTypeShort;
  const stored = useStoredAnalysis();
  if (stored === undefined) return null;

  if (!stored) {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-line p-5">
        <p className="body-md font-medium">{t.emptyTitle}</p>
        <Link
          href={routes.app.onboarding.photo}
          className="rounded-full bg-accent px-6 py-3 text-center font-semibold text-paper"
        >
          {t.emptyCta}
        </Link>
      </div>
    );
  }

  const date = new Date(stored.createdAt).toLocaleDateString(locale === "pl" ? "pl-PL" : "en-GB");

  return (
    <div className="flex flex-col gap-3">
      <Link
        href={routes.app.onboarding.report}
        className="flex items-center gap-3 rounded-2xl border border-line p-4"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={stored.imageDataUrl} alt="" className="h-16 w-14 shrink-0 rounded-xl object-cover" />
        <span className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
          <span className="text-ink/60">
            {t.lastAnalysis}: {date}
          </span>
          <span>
            {t.skin}: <strong>{skinType[stored.result.skin_type]}</strong>
          </span>
          <span className="font-medium text-accent">{t.openReport}</span>
        </span>
      </Link>
      <Link
        href={routes.app.onboarding.photo}
        className="rounded-full border border-accent px-6 py-3 text-center text-sm font-medium text-accent"
      >
        {t.newAnalysis}
      </Link>
    </div>
  );
}
