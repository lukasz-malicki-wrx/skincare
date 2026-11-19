"use client";

import { useState, useTransition } from "react";
import { deleteAccountAction, exportAuditTrailAction } from "@/app/actions/account";
import { Button } from "@/components/button";
import { removeLocalJson } from "@/hooks/use-local-json";
import { useMessages } from "@/i18n/locale-provider";
import { DIET_KEY } from "@/lib/diet";
import { PLAN_KEY } from "@/lib/plan";
import { REMINDERS_KEY } from "@/lib/reminders";
import { STORAGE_KEY } from "@/lib/skin-analysis";
import { PROFILE_KEY } from "@/lib/skin-profile";
import { Text } from "@/components/text";
import { Card } from "@/components/card";

/** Everything the app keeps in this browser. */
const LOCAL_KEYS = [STORAGE_KEY, PROFILE_KEY, PLAN_KEY, DIET_KEY, REMINDERS_KEY];

/** Photos and analyses live only in this browser, so "delete" clears them here. The account row is deleted on the server. */
export function PrivacyControls({ email }: Readonly<{ email: string }>) {
  const copy = useMessages().profile.privacy;
  const [photosCleared, setPhotosCleared] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  function deletePhotos() {
    removeLocalJson(STORAGE_KEY);
    removeLocalJson(PLAN_KEY);
    setPhotosCleared(true);
  }

  async function downloadData() {
    const data: Record<string, unknown> = { email, exportedAt: new Date().toISOString() };
    for (const key of LOCAL_KEYS) data[key] = readJson(localStorage.getItem(key));
    data.auditTrail = await exportAuditTrailAction();
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "skincare-data.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function deleteAccount() {
    for (const key of LOCAL_KEYS) removeLocalJson(key);
    startTransition(() => deleteAccountAction());
  }

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={deletePhotos} variant="outline">
        {photosCleared ? copy.photosDeleted : copy.deletePhotos}
      </Button>
      <Button onClick={downloadData} variant="outline">
        {copy.download}
      </Button>
      {!confirming ? (
        <Button onClick={() => setConfirming(true)} variant="outline-danger">
          {copy.deleteAccount}
        </Button>
      ) : (
        <Card role="alertdialog" aria-label={copy.deleteAccount} tone="danger" className="flex flex-col gap-2">
          <Text variant="body-sm" tone="muted">{copy.deleteWarning}</Text>
          <div className="flex gap-2">
            <Button disabled={pending} onClick={deleteAccount} variant="danger" className="flex-1">
              {copy.confirmDelete}
            </Button>
            <Button onClick={() => setConfirming(false)} variant="outline" className="flex-1">
              {copy.keepAccount}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

/** A stored value for the export; a corrupted entry is exported as its raw text instead of failing. */
function readJson(raw: string | null): unknown {
  if (raw === null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}
