import { isLocale, type Locale } from "./translations.ts";

const LANGUAGE_NAME: Record<Locale, string> = { pl: "Polish", en: "English" };

/** The locale sent with the request wins. The cookie is only the fallback. */
export function chosenLocale(value: unknown, fallback: Locale): Locale {
  return typeof value === "string" && isLocale(value) ? value : fallback;
}

/**
 * The request we send is English. This line tells the model to answer in the language
 * the user has selected in the app.
 */
export function modelLanguageInstruction(locale: Locale): string {
  const language = LANGUAGE_NAME[locale];
  return `Write every sentence and label the user will read in ${language} only. Do not use the other language. Plainly, with no jargon. Report confidence honestly. Keep enum values exactly as the English tokens in the schema.`;
}
