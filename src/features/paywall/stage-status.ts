export type StageStatus = "done" | "current" | "pending";

/** Where one step of the mocked payment stands while `stage` is running. */
export function stageStatus(index: number, stage: number): StageStatus {
  if (index < stage) return "done";
  return index === stage ? "current" : "pending";
}
