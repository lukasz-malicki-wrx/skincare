"use client";

import { ProgressBar } from "@/components/progress-bar";
import { SEVERITY_LEVEL, SEVERITY_LEVELS } from "@/features/analysis/report/slides";
import { useMessages } from "@/i18n/locale-provider";
import type { StoredAnalysis } from "@/lib/skin-analysis";
import { Alert } from "@/components/alert";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";

export function SkinSlide({ stored }: { stored: StoredAnalysis }) {
  const t = useMessages();
  const r = stored.result;
  return (
    <>
      <header className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={stored.imageDataUrl} alt="" className="h-20 w-16 shrink-0 rounded-2xl object-cover" />
        <div>
          <Heading level={2} variant="heading-lg">{t.skinType[r.skin_type]}</Heading>
        </div>
      </header>

      <Text variant="body-lg" tone="muted">{r.summary}</Text>

      {r.findings.length > 0 ? (
        <ul className="flex flex-col gap-5">
          {r.findings.map((f) => (
            <li key={`${f.name}-${f.area}`} className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-3">
                <Text as="span" weight="medium" className="capitalize">{f.name}</Text>
                <Text as="span" variant="body-sm" tone="muted">{t.severity[f.severity]}</Text>
              </div>
              <ProgressBar value={SEVERITY_LEVEL[f.severity]} max={SEVERITY_LEVELS} tone="brand" size="md" />
              <Text as="span" variant="body-sm" tone="muted" className="capitalize">{f.area}</Text>
            </li>
          ))}
        </ul>
      ) : (
        <Text tone="muted">{t.result.nothingToFlag}</Text>
      )}

      {r.see_a_doctor && (
        <Alert announce={false} size="md">
          {t.result.seeDoctor}
          {r.see_a_doctor_reason ? ` ${r.see_a_doctor_reason}` : ""}
        </Alert>
      )}
    </>
  );
}
