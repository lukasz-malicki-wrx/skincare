"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { routes } from "@/config/routes";
import { readLocalJson } from "@/hooks/use-local-json";
import { saveStoredAnalysis } from "@/hooks/use-stored-analysis";
import { useLocale } from "@/i18n/locale-provider";
import { isAbortError, postJson } from "@/lib/api-client";
import { splitDataUrl } from "@/lib/image";
import { pendingAnalysis, type SkinAssessment } from "@/lib/skin-analysis";
import { PROFILE_KEY, parseSavedProfile } from "@/lib/skin-profile";

export type AssessmentState = { status: "idle" } | { status: "analyzing" } | { status: "error"; error: unknown };

/**
 * Stage 1 of the analysis: sends the photo, saves the assessment and opens the skin report.
 * Leaving the screen (or retaking) aborts the request, so a late answer never navigates away.
 */
export function useSkinAssessment() {
  const locale = useLocale();
  const router = useRouter();
  const controllerRef = useRef<AbortController | null>(null);
  const [state, setState] = useState<AssessmentState>({ status: "idle" });

  useEffect(() => () => controllerRef.current?.abort(), []);

  const analyze = useCallback(
    async (dataUrl: string) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      setState({ status: "analyzing" });

      const { mediaType, data } = splitDataUrl(dataUrl);
      const body = { imageBase64: data, mediaType, profile: readLocalJson(PROFILE_KEY, parseSavedProfile), locale };
      try {
        const assessment = await postJson<SkinAssessment>("/api/analyze", body, controller.signal);
        saveStoredAnalysis({
          createdAt: new Date().toISOString(),
          imageDataUrl: dataUrl,
          result: pendingAnalysis(assessment),
          routineReady: false,
        });
        // Next: the skin report. The routine is built later, after the budget and preferences form.
        router.push(routes.app.onboarding.report);
      } catch (error) {
        if (!isAbortError(error)) setState({ status: "error", error });
      }
    },
    [locale, router],
  );

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    setState({ status: "idle" });
  }, []);

  return { state, analyze, reset };
}
