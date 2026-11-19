import type { Locale } from "@/i18n/translations";

export function fill(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

type CountForms = { one: string; few: string; many: string };

/** Cardinal plural for English (few and many can share a string) and Polish. */
export function countLabel(count: number, forms: CountForms): string {
  return fill(forms[pluralCategory(count)], { count });
}

function pluralCategory(count: number): keyof CountForms {
  const abs = Math.abs(count);
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  if (abs === 1) return "one";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "few";
  return "many";
}

const PLN_FORMATS = {
  0: new Intl.NumberFormat("pl-PL", { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
  2: new Intl.NumberFormat("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
} as const;

/**
 * Prices are in PLN for every user, so they keep the Polish notation in both languages:
 * "17,49 zł", or "84 zł" for whole-zloty totals.
 */
export function formatPln(value: number, decimals: 0 | 2 = 2): string {
  return `${PLN_FORMATS[decimals].format(value)} zł`;
}

const DATE_LOCALES: Record<Locale, string> = { pl: "pl-PL", en: "en-GB" };

/**
 * A date in the app language and the device's time zone: "19.11.2026" / "19/11/2026" by default,
 * or "19 listopada" / "19 November" with `style: "dayMonth"`. Empty for a missing date.
 */
export function formatDate(iso: string | null, locale: Locale, style: "short" | "dayMonth" = "short"): string {
  if (!iso) return "";
  const options: Intl.DateTimeFormatOptions = style === "dayMonth" ? { day: "numeric", month: "long" } : {};
  return new Date(iso).toLocaleDateString(DATE_LOCALES[locale], options);
}
