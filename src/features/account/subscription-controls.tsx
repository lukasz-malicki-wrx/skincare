"use client";

import { useState, useTransition } from "react";
import { cancelSubscriptionAction } from "@/app/actions/subscription";
import { Button, ButtonLink } from "@/components/button";
import { routes } from "@/config/routes";
import { fill, formatDate } from "@/i18n/format";
import { useLocale, useMessages } from "@/i18n/locale-provider";
import { MONTHLY_PRICE_PLN, accessUntil, hasAccess, nextRenewal, type Subscription } from "@/lib/subscription";
import { Text } from "@/components/text";
import { Card } from "@/components/card";

/** Status line plus cancel in two taps. The checkout itself is mocked on the paywall. */
export function SubscriptionControls({ subscription }: Readonly<{ subscription: Subscription }>) {
  const locale = useLocale();
  const copy = useMessages().profile.subscription;
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const renewal = nextRenewal(subscription);
  const price = MONTHLY_PRICE_PLN;
  const endDate = formatDate(subscription.trialEndsAt, locale, "dayMonth");

  const status = {
    none: fill(copy.none, { price }),
    trial: fill(copy.trial, { date: endDate, price }),
    active: fill(copy.active, { date: renewal ? formatDate(renewal.toISOString(), locale, "dayMonth") : "", price }),
    cancelled: hasAccess(subscription)
      ? fill(copy.cancelledUntil, { date: endDate })
      : copy.cancelled,
  }[subscription.status];

  const canCancel = subscription.status === "trial" || subscription.status === "active";

  return (
    <div className="flex flex-col gap-3">
      <Text >{status}</Text>

      {!hasAccess(subscription) && (
        <ButtonLink
          href={routes.app.onboarding.paywall}
          
        >
          {fill(copy.startTrial, { price })}
        </ButtonLink>
      )}

      {canCancel && !confirming && (
        <Button onClick={() => setConfirming(true)} variant="outline">
          {copy.cancel}
        </Button>
      )}

      {canCancel && confirming && (
        <Card className="flex flex-col gap-2">
          <Text variant="body-sm" tone="muted">{fill(copy.keepAccess, { date: formatDate(accessUntil(subscription), locale, "dayMonth") })}</Text>
          <div className="flex gap-2">
            <Button
              variant="danger"
              className="flex-1"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await cancelSubscriptionAction();
                  setConfirming(false);
                })
              }
            >
              {copy.confirmCancel}
            </Button>
            <Button onClick={() => setConfirming(false)} variant="outline" className="flex-1">
              {copy.keep}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
