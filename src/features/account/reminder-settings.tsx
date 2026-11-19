"use client";

import { useState } from "react";
import { fill } from "@/i18n/format";
import { useMessages } from "@/i18n/locale-provider";
import { useLocalJson } from "@/hooks/use-local-json";
import { REMINDERS_KEY, parseReminders, type ReminderSettings } from "@/lib/reminders";
import { Button } from "@/components/button";
import { Text } from "@/components/text";
import { Card } from "@/components/card";
import { Input } from "@/components/input";

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
          <Card as="li" key={t.key} padding="sm" className="flex items-center justify-between gap-3">
            <Text as="label" variant="body-sm" className="flex flex-1 items-center gap-3">
              <input
                type="checkbox"
                checked={settings[t.key]}
                onChange={(e) => update({ [t.key]: e.target.checked })}
                className="h-4 w-4 accent-[var(--color-accent)]"
              />
              {t.label}
            </Text>
            {t.time && (
              <Input
                size="sm"
                type="time"
                aria-label={fill(copy.timeFor, { label: t.label })}
                value={settings[t.time]}
                disabled={!settings[t.key]}
                onChange={(e) => update({ [t.time as "morningTime"]: e.target.value })}
              />
            )}
          </Card>
        ))}
      </ul>
      <Button onClick={sendTest} variant="outline">
        {copy.sendTest}
      </Button>
      {testResult && <Text variant="body-sm" tone="muted">{copy[testResult]}</Text>}
      <Text variant="body-sm" tone="muted">{copy.localNote}</Text>
    </div>
  );
}
