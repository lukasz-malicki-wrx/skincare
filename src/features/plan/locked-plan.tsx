import { ButtonLink } from "@/components/button";
import { routes } from "@/config/routes";
import { LockIcon } from "@/components/icons";
import { fill } from "@/i18n/format";
import type { Messages } from "@/i18n/translations";
import { MONTHLY_PRICE_PLN } from "@/lib/subscription";
import { Text } from "@/components/text";
import { Card } from "@/components/card";
import { StepNumber } from "@/components/step-number";

export function LockedPlan({ copy }: Readonly<{ copy: Messages["plan"] }>) {
  const preview = [copy.preview.cleanser, copy.preview.serum, copy.preview.moisturizer, copy.preview.spf];

  return (
    <div className="relative flex flex-1 flex-col">
      <div aria-hidden className="pointer-events-none select-none blur-sm">
        <ol className="flex flex-col gap-3">
          {preview.map((label, i) => (
            <Card as="li" key={label} tone="surface" className="flex items-center gap-3">
              <StepNumber>{i + 1}</StepNumber>
              <Text as="span">{label}</Text>
            </Card>
          ))}
        </ol>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-paper" aria-hidden>
          <LockIcon />
        </span>
        <Text variant="title-lg">{copy.ready}</Text>
        <Text tone="muted">{fill(copy.unlockBody, { price: MONTHLY_PRICE_PLN })}</Text>
        <ButtonLink href={routes.app.onboarding.paywall}>
          {copy.unlock}
        </ButtonLink>
      </div>
    </div>
  );
}
