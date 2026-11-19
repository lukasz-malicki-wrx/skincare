"use client";

import { useCallback } from "react";
import { SkinProfileFields } from "@/features/skin-profile/skin-profile-fields";
import { useLocalJson } from "@/hooks/use-local-json";
import { saveStoredAnalysis, useStoredAnalysis } from "@/hooks/use-stored-analysis";
import { PROFILE_KEY, aiFilledFields, parseProfile, profileFromAnalysis, type SkinProfile } from "@/lib/skin-profile";

/**
 * Screens 8 and 9: skin type, allergies, monthly budget and diet restrictions.
 * In onboarding the CTA reads "Build my plan" and leads to the paywall; from Profile it saves and returns.
 */
export function SkinProfileForm({
  submitLabel,
  nextHref,
  rebuildRoutine = false,
}: {
  submitLabel: string;
  nextHref: string;
  /** Onboarding: saving the form marks the routine as not built, so the plan screen rebuilds it from these answers. */
  rebuildRoutine?: boolean;
}) {
  const [saved, setProfile] = useLocalJson(PROFILE_KEY, parseProfile);
  const stored = useStoredAnalysis();

  const save = useCallback(
    (profile: SkinProfile) => {
      setProfile(profile);
      if (rebuildRoutine && stored) {
        saveStoredAnalysis({ ...stored, routineReady: false, routineProducts: undefined, routineProductsVersion: undefined });
      }
    },
    [setProfile, rebuildRoutine, stored],
  );

  if (saved === undefined || stored === undefined) return null;
  const analysis = stored?.result ?? null;
  return (
    <SkinProfileFields
      initial={profileFromAnalysis(saved, analysis)}
      ai={aiFilledFields(saved, analysis)}
      submitLabel={submitLabel}
      nextHref={nextHref}
      onSave={save}
    />
  );
}
