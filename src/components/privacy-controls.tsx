"use client";

import { useState, useTransition } from "react";
import { deleteAccountAction } from "@/app/actions/account";
import { useMessages } from "@/components/locale-provider";
import { removeLocalJson } from "@/components/use-local-json";
import { PROFILE_KEY } from "@/lib/skin-profile";
import { STORAGE_KEY } from "@/lib/skin-analysis";

const LOCAL_KEYS = [STORAGE_KEY, PROFILE_KEY, "pielegnacja:plan", "pielegnacja:diet", "pielegnacja:reminders"];

/** Photos and analyses live only in this browser, so "delete" clears them here. The account row is deleted on the server. */
export function PrivacyControls({ email }: { email: string }) {
  const copy = useMessages().profile.privacy;
  const [photosCleared, setPhotosCleared] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  function deletePhotos() {
    removeLocalJson(STORAGE_KEY);
    removeLocalJson("pielegnacja:plan");
    setPhotosCleared(true);
  }

  function downloadData() {
    const data: Record<string, unknown> = { email, exportedAt: new Date().toISOString() };
    for (const key of LOCAL_KEYS) {
      const raw = localStorage.getItem(key);
      data[key] = raw ? JSON.parse(raw) : null;
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "skincare-data.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function deleteAccount() {
    for (const key of LOCAL_KEYS) localStorage.removeItem(key);
    startTransition(() => deleteAccountAction());
  }

  return (
    <div className="flex flex-col gap-2">
      <button type="button" onClick={deletePhotos} className="rounded-full border border-line px-5 py-3 text-sm">
        {photosCleared ? copy.photosDeleted : copy.deletePhotos}
      </button>
      <button type="button" onClick={downloadData} className="rounded-full border border-line px-5 py-3 text-sm">
        {copy.download}
      </button>
      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="rounded-full border border-red-800/40 px-5 py-3 text-sm text-red-800"
        >
          {copy.deleteAccount}
        </button>
      ) : (
        <div className="flex flex-col gap-2 rounded-2xl border border-red-800/30 p-4">
          <p className="body-sm text-ink/70">{copy.deleteWarning}</p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={deleteAccount}
              className="flex-1 rounded-full bg-red-800 px-4 py-3 text-sm font-semibold text-paper disabled:opacity-60"
            >
              {copy.confirmDelete}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="flex-1 rounded-full border border-line px-4 py-3 text-sm"
            >
              {copy.keepAccount}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
