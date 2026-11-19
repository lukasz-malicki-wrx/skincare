"use client";

import { Heading } from "@/components/heading";
import { Spinner } from "@/components/spinner";
import { Text, type TextProps } from "@/components/text";
import { stageStatus, type StageStatus } from "@/features/paywall/stage-status";
import { useMessages } from "@/i18n/locale-provider";

/** Done steps are solid, the running one bold, later ones muted (still AA contrast). */
const STAGE_TEXT: Record<StageStatus, Pick<TextProps, "tone" | "weight">> = {
  done: {},
  current: { weight: "semibold" },
  pending: { tone: "muted" },
};

/** The mocked payment: three steps tick off one by one, then the plan opens. */
export function Processing({ stage, stages }: { stage: number; stages: string[] }) {
  const copy = useMessages().paywall;
  const done = stage >= stages.length;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
      <Heading level={1} className="sr-only">
        {copy.proTitle}
      </Heading>
      <div aria-hidden className="relative flex h-24 w-24 items-center justify-center">
        {done ? (
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-4xl text-white">✓</span>
        ) : (
          <Spinner size="xl" />
        )}
      </div>
      {/* The live region wraps the list so the list keeps its semantics. */}
      <div role="status">
        <ul className="flex flex-col gap-2">
          {stages.map((label, i) => {
            const status = stageStatus(i, stage);
            return (
              <li key={label} aria-current={status === "current" ? "step" : undefined}>
                <Text as="span" {...STAGE_TEXT[status]}>
                  {status === "done" && <span aria-hidden>✓ </span>}
                  {label}
                </Text>
              </li>
            );
          })}
        </ul>
      </div>
      {done && (
        <div className="flex flex-col gap-1">
          <Text variant="title-lg">{copy.acceptedTitle}</Text>
          <Text variant="body-sm" tone="muted">
            {copy.opening}
          </Text>
        </div>
      )}
    </div>
  );
}
