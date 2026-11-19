"use client";

import { InlineLoading } from "@/components/spinner";
import { useMessages } from "@/i18n/locale-provider";

export function DietLoading() {
  return <InlineLoading label={useMessages().plan.loadingDiet} />;
}
