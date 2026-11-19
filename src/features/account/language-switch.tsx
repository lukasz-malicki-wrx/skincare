"use client";

import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";
import { setLocale } from "@/i18n/locale";
import { isLocale, type Locale } from "@/i18n/translations";
import { useLocale, useMessages } from "@/i18n/locale-provider";
import { ChoiceChip } from "@/components/choice-chip";
import { Text } from "@/components/text";

const OPTIONS = ["pl", "en"] as const satisfies readonly Locale[];

export function LanguageSwitch() {
  const locale = useLocale();
  const t = useMessages().profile;
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const choose = useCallback(
    (next: string) => {
      if (next === locale || !isLocale(next)) return;
      startTransition(async () => {
        await setLocale(next);
        router.refresh();
      });
    },
    [locale, router],
  );

  return (
    <fieldset className="flex flex-col gap-2" disabled={pending}>
      <Text as="legend" variant="body-sm" tone="muted">{t.language}</Text>
      <div className="grid grid-cols-2 gap-2">
        {OPTIONS.map((option) => (
          <ChoiceChip
            key={option}
            size="md"
            type="radio"
            name="locale"
            value={option}
            checked={option === locale}
            onChange={choose}
          >
            <span lang={option}>{t.languages[option]}</span>
          </ChoiceChip>
        ))}
      </div>
    </fieldset>
  );
}
