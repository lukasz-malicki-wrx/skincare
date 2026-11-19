import { cookies } from "next/headers";
import { LOCALE_COOKIE } from "@/i18n/locale-cookie";
import { isLocale, type Locale } from "@/i18n/translations";

const DEFAULT_LOCALE: Locale = "en";

export async function requestLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return value && isLocale(value) ? value : DEFAULT_LOCALE;
}
