"use client";

import { routes } from "@/config/routes";
import { useLocale, useMessages } from "@/i18n/locale-provider";
import { useStoredAnalysis } from "@/hooks/use-stored-analysis";
import { ButtonLink } from "@/components/button";
import { Text } from "@/components/text";
import { formatDate } from "@/i18n/format";
import { Card, CardLink } from "@/components/card";

export function TodayStart() {
  const locale = useLocale();
  const t = useMessages().today;
  const skinType = useMessages().skinTypeShort;
  const stored = useStoredAnalysis();
  if (stored === undefined) return null;

  if (!stored) {
    return (
      <Card padding="lg" className="flex flex-col gap-4">
        <Text weight="medium">{t.emptyTitle}</Text>
        <ButtonLink href={routes.app.onboarding.photo} variant="accent">
          {t.emptyCta}
        </ButtonLink>
      </Card>
    );
  }

  const date = formatDate(stored.createdAt, locale);

  return (
    <div className="flex flex-col gap-3">
      <CardLink href={routes.app.onboarding.report} className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={stored.imageDataUrl} alt="" className="h-16 w-14 shrink-0 rounded-xl object-cover" />
        <Text as="span" variant="body-sm" className="flex min-w-0 flex-1 flex-col gap-1">
          <Text as="span" variant="body-sm" tone="muted">
            {t.lastAnalysis}: {date}
          </Text>
          <span>
            {t.skin}: <strong>{skinType[stored.result.skin_type]}</strong>
          </span>
          <Text as="span" variant="body-sm" tone="accent" weight="medium">
            {t.openReport}
          </Text>
        </Text>
      </CardLink>
      <ButtonLink href={routes.app.onboarding.photo} variant="outline-accent">
        {t.newAnalysis}
      </ButtonLink>
    </div>
  );
}
