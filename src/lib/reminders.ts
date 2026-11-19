/** Local reminder settings (screen 20). Browser-only; nothing is sent from the server. */
export const REMINDERS_KEY = "pielegnacja:reminders";

export type ReminderSettings = {
  morning: boolean;
  morningTime: string;
  evening: boolean;
  eveningTime: string;
  weeklyPhoto: boolean;
  trialEnd: boolean;
};

export const DEFAULT_REMINDERS: ReminderSettings = {
  morning: true,
  morningTime: "08:00",
  evening: true,
  eveningTime: "22:00",
  weeklyPhoto: true,
  trialEnd: true,
};

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export function parseReminders(raw: string | null): ReminderSettings {
  if (!raw) return DEFAULT_REMINDERS;
  try {
    const v = JSON.parse(raw) as Partial<ReminderSettings>;
    return {
      morning: typeof v.morning === "boolean" ? v.morning : DEFAULT_REMINDERS.morning,
      morningTime: TIME.test(v.morningTime ?? "") ? (v.morningTime as string) : DEFAULT_REMINDERS.morningTime,
      evening: typeof v.evening === "boolean" ? v.evening : DEFAULT_REMINDERS.evening,
      eveningTime: TIME.test(v.eveningTime ?? "") ? (v.eveningTime as string) : DEFAULT_REMINDERS.eveningTime,
      weeklyPhoto: typeof v.weeklyPhoto === "boolean" ? v.weeklyPhoto : DEFAULT_REMINDERS.weeklyPhoto,
      trialEnd: typeof v.trialEnd === "boolean" ? v.trialEnd : DEFAULT_REMINDERS.trialEnd,
    };
  } catch {
    return DEFAULT_REMINDERS;
  }
}
