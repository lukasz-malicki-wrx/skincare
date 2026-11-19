"use client";

import { ButtonLink } from "@/components/button";
import { routes } from "@/config/routes";
import { useMessages } from "@/i18n/locale-provider";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";

export function RetakeReport({ issue }: { issue: string | null }) {
  const t = useMessages().result;
  return (
    <div className="flex flex-1 flex-col justify-center gap-6">
      <Heading level={2} variant="heading-lg">{t.retakeTitle}</Heading>
      <Text variant="body-lg" tone="muted">{issue ?? t.unclearPhoto}</Text>
      <ButtonLink href={routes.app.onboarding.photo} size="lg">
        {t.takeNewPhoto}
      </ButtonLink>
    </div>
  );
}
