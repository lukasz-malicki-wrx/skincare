"use client";

import { ButtonLink } from "@/components/button";
import { routes } from "@/config/routes";
import { useMessages } from "@/i18n/locale-provider";
import { Text } from "@/components/text";

export function NoPlan() {
  const copy = useMessages().plan;
  return (
    <div className="flex flex-col gap-4">
      <Text variant="body-lg" tone="muted">{copy.noPlan}</Text>
      <ButtonLink href={routes.app.onboarding.photo} size="lg">
        {copy.takePhoto}
      </ButtonLink>
    </div>
  );
}
