"use client";

import { routes } from "@/config/routes";
import { countLabel } from "@/i18n/format";
import { useMessages } from "@/i18n/locale-provider";
import type { SkinAnalysis } from "@/lib/skin-analysis";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { TextLink } from "@/components/text-link";

export function NextSlide({ result }: Readonly<{ result: SkinAnalysis }>) {
  const t = useMessages().result;
  return (
    <>
      <Heading level={2} variant="heading-lg">{t.whatsNext}</Heading>

      <div className="flex flex-col gap-1">
        <Text variant="body-sm" tone="muted">{t.nextPhoto}</Text>
        <Text variant="heading-md">{countLabel(result.followup_days, t.inDays)}</Text>
      </div>

      {result.avoid_ingredients.length > 0 && (
        <div className="flex flex-col gap-2">
          <Text variant="body-sm" tone="muted">{t.skipIngredients}</Text>
          <ul className="flex flex-wrap gap-2">
            {result.avoid_ingredients.map((a) => (
              <li key={a} className="rounded-full border border-line px-3 py-1.5 body-sm">
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Text variant="body-sm" tone="muted">{t.disclaimer}</Text>
      <Text variant="body-sm">
        <TextLink href={routes.app.onboarding.photo} variant="standalone">
          {t.retakePhoto}
        </TextLink>
      </Text>
    </>
  );
}
