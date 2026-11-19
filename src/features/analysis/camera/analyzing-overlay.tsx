"use client";

import { useMessages } from "@/i18n/locale-provider";
import { cn } from "@/lib/cn";
import { Text } from "@/components/text";

/**
 * Fake progress shown while the model works (the real call takes 10-30 s): four segments of
 * 5 s each, filling one after another. Literal classes so Tailwind generates them.
 */
const LOADER_SEGMENTS = [
  "[animation-delay:0s]",
  "[animation-delay:5s]",
  "[animation-delay:10s]",
  "[animation-delay:15s]",
] as const;

/** Scan line over the photo plus four bars that fill one after another. */
export function AnalyzingOverlay() {
  const t = useMessages().photo;
  return (
    <div className="absolute inset-0 overflow-hidden bg-ink/40">
      <div
        aria-hidden
        className="motion-safe:animate-scan absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-brand-peach/70 to-transparent"
      />
      <div className="absolute inset-x-5 bottom-5 flex flex-col gap-3">
        <Text as="output" variant="body-sm" tone="inverse" className="block text-center">
          {t.reading}
        </Text>
        {/* Decorative: the real duration is unknown, so progress is announced as status text above. */}
        <div aria-hidden className="flex gap-1.5">
          {LOADER_SEGMENTS.map((delay) => (
            <span key={delay} className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper/30">
              <span className={cn("block h-full bg-paper motion-safe:animate-fill motion-safe:[animation-duration:5s]", delay)} />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
