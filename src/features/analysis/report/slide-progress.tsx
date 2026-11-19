"use client";

import { ProgressBar } from "@/components/progress-bar";
import { useMessages } from "@/i18n/locale-provider";

export function SlideProgress({ current, total }: Readonly<{ current: number; total: number }>) {
  const progressLabel = useMessages().result.progress;
  return <ProgressBar value={current + 1} min={1} max={total} label={progressLabel} className="mx-5" />;
}
