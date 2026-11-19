"use client";

import { createContext, useContext } from "react";
import { messagesFor } from "@/i18n/messages";
import type { Locale, Messages } from "@/i18n/translations";

const LocaleContext = createContext<Locale>("en");

export function LocaleProvider({
  locale,
  children,
}: Readonly<{
  locale: Locale;
  children: React.ReactNode;
}>) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

export function useMessages(): Messages {
  return messagesFor(useLocale());
}
