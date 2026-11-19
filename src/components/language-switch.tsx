"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocale } from "@/i18n/locale";
import type { Locale } from "@/i18n/translations";
import { useLocale, useMessages } from "@/components/locale-provider";

const OPTIONS = ["pl", "en"] as const satisfies readonly Locale[];

export function LanguageSwitch() {
  const locale = useLocale();
  const t = useMessages().profile;
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function choose(next: Locale) {
    if (next === locale || pending) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return (
    <fieldset className="flex flex-col gap-2" disabled={pending}>
      <legend className="body-sm text-ink/70">{t.language}</legend>
      <div className="grid grid-cols-2 gap-2">
        {OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={option === locale}
            onClick={() => choose(option)}
            className={
              option === locale
                ? "rounded-full bg-accent px-4 py-3 text-sm font-medium text-paper"
                : "rounded-full border border-line px-4 py-3 text-sm font-medium text-ink"
            }
          >
            {t.languages[option]}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
