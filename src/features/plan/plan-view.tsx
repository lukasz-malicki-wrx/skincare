"use client";

import dynamic from "next/dynamic";
import { useId, useMemo } from "react";
import { TabPanel, Tabs } from "@/components/tabs";
import { CareTab } from "@/features/plan/care-tab";
import { DietLoading } from "@/features/plan/diet-loading";
import { NoPlan } from "@/features/plan/no-plan";
import { VIEWS } from "@/features/plan/plan-options";
import { ResumeRoutine } from "@/features/plan/resume-routine";
import { useLocalJson } from "@/hooks/use-local-json";
import { useSearchParamOption } from "@/hooks/use-search-param-option";
import { useStoredAnalysis } from "@/hooks/use-stored-analysis";
import { useMessages } from "@/i18n/locale-provider";
import { PROFILE_KEY, parseProfile } from "@/lib/skin-profile";

/** The diet tab is a separate chunk: most visits never open it. */
const DietView = dynamic(() => import("@/features/plan/diet-view").then((m) => m.DietView), {
  loading: DietLoading,
});

/** Screens 14 and 15: the plan with its two tabs. Needs an analysis; otherwise points to the camera. */
export function PlanView() {
  const copy = useMessages().plan;
  const stored = useStoredAnalysis();
  const [profile] = useLocalJson(PROFILE_KEY, parseProfile);
  const [view, setView] = useSearchParamOption("view", VIEWS, "care");
  const tabsId = useId();
  const viewOptions = useMemo(() => VIEWS.map((value) => ({ value, label: copy[value] })), [copy]);

  if (stored === undefined || profile === undefined) return null;
  if (!stored || !stored.result.photo_quality.ok) return <NoPlan />;
  // The photo is saved, but the routine is built on the paywall's next screen.
  if (stored.routineReady === false) return <ResumeRoutine />;

  return (
    <div className="flex flex-col gap-5">
      <Tabs id={tabsId} label={copy.views} options={viewOptions} value={view} onChange={setView} />
      <TabPanel id={tabsId} value={view}>
        {view === "care" ? <CareTab stored={stored} profile={profile} /> : <DietView stored={stored} profile={profile} />}
      </TabPanel>
    </div>
  );
}
