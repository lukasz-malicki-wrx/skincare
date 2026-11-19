"use client";

import { useState } from "react";
import { useMessages } from "@/components/locale-provider";
import { useLocalJson } from "@/components/use-local-json";
import { REMINDERS_KEY, parseReminders, type ReminderSettings } from "@/lib/reminders";

type TestResult = "unsupported" | "blocked" | "sent";
type Toggle = { key: "morning" | "evening" | "weeklyPhoto" | "trialEnd"; label: string; time?: "morningTime" | "eveningTime" };

export function ReminderSettingsPanel() {
  const messages = useMessages();
  const copy = messages.profile.reminders;
  const [settings, setSettings] = useLocalJson(REMINDERS_KEY, parseReminders);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  if (settings === undefined) return null;

  const toggles: Toggle[] = [
    { key: "morning", label: copy.morning, time: "morningTime" },
    { key: "evening", label: copy.evening, time: "eveningTime" },
    { key: "weeklyPhoto", label: copy.weeklyPhoto },
    { key: "trialEnd", label: copy.trialEnd },
  ];

  const update = (patch: Partial<ReminderSettings>) => setSettings({ ...settings, ...patch });

  async function sendTest() {
    if (!("Notification" in window)) {
      setTestResult("unsupported");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setTestResult("blocked");
      return;
    }
    new Notification(messages.appName, { body: copy.notificationBody });
    setTestResult("sent");
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {toggles.map((t) => (
          <li key={t.key} className="flex items-center justify-between gap-3 rounded-2xl border border-line px-4 py-3">
            <label className="flex flex-1 items-center gap-3 body-sm">
              <input
                type="checkbox"
                checked={settings[t.key]}
                onChange={(e) => update({ [t.key]: e.target.checked })}
                className="h-4 w-4 accent-[var(--color-accent)]"
              />
              {t.label}
            </label>
            {t.time && (
              <input
                type="time"
                value={settings[t.time]}
                disabled={!settings[t.key]}
                onChange={(e) => update({ [t.time as "morningTime"]: e.target.value })}
                className="rounded-lg border border-line bg-surface px-2 py-1 text-sm disabled:opacity-40"
              />
            )}
          </li>
        ))}
      </ul>
      <button type="button" onClick={sendTest} className="rounded-full border border-line px-5 py-3 text-sm">
        {copy.sendTest}
      </button>
      {testResult && <p className="body-sm text-ink/60">{copy[testResult]}</p>}
      <p className="body-sm text-ink/50">{copy.localNote}</p>
    </div>
  );
}
