"use client";

import type { ReactNode } from "react";
import { useMessages } from "@/i18n/locale-provider";
import { Text } from "@/components/text";

/** Field label with an "AI" tag while the value is still the one the analysis suggested. */
export function AiLegend({ ai, children }: Readonly<{ ai: boolean; children: ReactNode }>) {
  const aiFilled = useMessages().profile.skin.aiFilled;
  return (
    <Text as="legend" variant="body-sm" tone="muted" className="flex items-center gap-2">
      {children}
      {ai && (
        <span className="rounded-full bg-brand-peach-light px-2 py-0.5 text-[11px] font-medium text-ink" title={aiFilled}>
          <span aria-hidden>AI</span>
          <span className="sr-only">{aiFilled}</span>
        </span>
      )}
    </Text>
  );
}
