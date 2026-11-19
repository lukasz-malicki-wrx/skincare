"use client";

import { Button } from "@/components/button";
import { Spinner } from "@/components/spinner";
import { useRoutineBuild } from "@/features/analysis/report/use-routine-build";
import { useMessages } from "@/i18n/locale-provider";
import { requestErrorMessage } from "@/lib/api-client";
import type { StoredAnalysis } from "@/lib/skin-analysis";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";

export function RoutineBuilder({ stored, onRetry }: { stored: StoredAnalysis; onRetry: () => void }) {
  const messages = useMessages();
  const t = messages.result;
  const state = useRoutineBuild(stored);

  if (state.status === "error") {
    return (
      <div className="flex flex-1 flex-col justify-center gap-6">
        <Heading level={2} variant="heading-lg">{t.routineFailed}</Heading>
        <Text role="alert" tone="muted">
          {requestErrorMessage(state.error, messages.errors)}
        </Text>
        <Button onClick={onRetry} size="lg">
          {t.tryAgain}
        </Button>
      </div>
    );
  }

  return (
    <div role="status" className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <Spinner size="lg" />
      <Heading level={2}>{t.buildingRoutine}</Heading>
      <Text tone="muted">{t.buildingRoutineBody}</Text>
    </div>
  );
}
