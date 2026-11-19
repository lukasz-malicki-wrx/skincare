"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { LOCALE_COOKIE } from "@/i18n/locale-cookie";
import { requestLocale } from "@/i18n/request-locale";
import { isLocale, translations, type Locale } from "@/i18n/translations";

export async function getLocale(): Promise<Locale> {
  return requestLocale();
}

export async function getTranslations() {
  return translations[await requestLocale()];
}

export async function setLocale(locale: Locale) {
  if (!isLocale(locale)) return;
  const jar = await cookies();
  jar.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  revalidatePath("/", "layout");
}
