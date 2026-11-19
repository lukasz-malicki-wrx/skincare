import { isLocale, type Locale } from "./translations.ts";

export const LOCALE_COOKIE = "locale";

const DEFAULT_LOCALE: Locale = "en";

/** Reads the locale cookie. Anything else, including a missing cookie, stays English. */
export function localeFromCookieHeader(header: string | null | undefined): Locale {
  if (!header) return DEFAULT_LOCALE;
  const match = header.match(/(?:^|; )locale=(pl|en)(?:;|$)/);
  const value = match?.[1];
  return value && isLocale(value) ? value : DEFAULT_LOCALE;
}
