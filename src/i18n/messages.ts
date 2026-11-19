import { translations, type Locale, type Messages } from "@/i18n/translations";

export function messagesFor(locale: Locale): Messages {
  return translations[locale];
}
