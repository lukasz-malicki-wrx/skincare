"use client";

import { useTransition } from "react";
import { advanceSevenDaysAction } from "@/app/actions/subscription";
import { Button } from "@/components/button";
import { useMessages } from "@/i18n/locale-provider";

/** Demo control under the version number: pretends a week passed so the trial rolls over. */
export function DemoAdvanceButton() {
  const copy = useMessages().profile.subscription;
  const [pending, startTransition] = useTransition();
  return (
    <Button variant="ghost" size="xs" disabled={pending} onClick={() => startTransition(() => advanceSevenDaysAction())}>
      {copy.demoSkip}
    </Button>
  );
}
