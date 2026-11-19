"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { advanceSevenDaysAction, cancelSubscriptionAction } from "@/app/actions/subscription";
import { useLocale, useMessages } from "@/components/locale-provider";
import { routes } from "@/config/routes";
import { fill } from "@/i18n/format";
import type { Locale } from "@/i18n/translations";
import { MONTHLY_PRICE_PLN, accessUntil, hasAccess, nextRenewal, type Subscription } from "@/lib/subscription";

function formatDate(iso: string | null, locale: Locale) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(locale === "pl" ? "pl-PL" : "en-GB", {
    day: "numeric",
    month: "long",
  });
}

/** Status line plus cancel in two taps. The checkout itself is mocked on the paywall. */
export function SubscriptionControls({ subscription }: { subscription: Subscription }) {
  const locale = useLocale();
  const copy = useMessages().profile.subscription;
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const renewal = nextRenewal(subscription);
  const price = MONTHLY_PRICE_PLN;
  const endDate = formatDate(subscription.trialEndsAt, locale);

  const status = {
    none: fill(copy.none, { price }),
    trial: fill(copy.trial, { date: endDate, price }),
    active: fill(copy.active, { date: renewal ? formatDate(renewal.toISOString(), locale) : "", price }),
    cancelled: hasAccess(subscription)
      ? fill(copy.cancelledUntil, { date: endDate })
      : copy.cancelled,
  }[subscription.status];

  const canCancel = subscription.status === "trial" || subscription.status === "active";

  return (
    <div className="flex flex-col gap-3">
      <p className="body-md">{status}</p>

      {!hasAccess(subscription) && (
        <Link
          href={routes.app.onboarding.paywall}
          className="rounded-full bg-ink px-5 py-3 text-center text-sm font-semibold text-paper"
        >
          {fill(copy.startTrial, { price })}
        </Link>
      )}

      {canCancel && !confirming && (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="rounded-full border border-line px-5 py-3 text-sm"
        >
          {copy.cancel}
        </button>
      )}

      {canCancel && confirming && (
        <div className="flex flex-col gap-2 rounded-2xl border border-line p-4">
          <p className="body-sm text-ink/70">{fill(copy.keepAccess, { date: formatDate(accessUntil(subscription), locale) })}</p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await cancelSubscriptionAction();
                  setConfirming(false);
                })
              }
              className="flex-1 rounded-full bg-red-800 px-4 py-3 text-sm font-semibold text-paper disabled:opacity-60"
            >
              {copy.confirmCancel}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="flex-1 rounded-full border border-line px-4 py-3 text-sm"
            >
              {copy.keep}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Hidden demo control, rendered as a faint line under the version number. */
export function DemoAdvanceButton() {
  const copy = useMessages().profile.subscription;
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => advanceSevenDaysAction())}
      className="text-xs text-ink/30 underline-offset-2 hover:underline disabled:opacity-50"
    >
      {copy.demoSkip}
    </button>
  );
}
