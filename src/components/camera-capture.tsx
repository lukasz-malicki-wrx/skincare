"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import { useLocale, useMessages } from "@/components/locale-provider";
import { fill } from "@/i18n/format";
import { localeFromCookieHeader } from "@/i18n/locale-cookie";
import { messagesFor } from "@/i18n/messages";
import { splitDataUrl, toCompressedJpeg } from "@/lib/image";
import { STORAGE_KEY, pendingAnalysis, type SkinAssessment, type StoredAnalysis } from "@/lib/skin-analysis";

type Facing = "user" | "environment";

type Phase =
  | { kind: "starting" }
  | { kind: "live" }
  | { kind: "no-camera"; reason: string }
  | { kind: "captured"; dataUrl: string }
  | { kind: "analyzing"; dataUrl: string }
  | { kind: "error"; dataUrl: string; message: string };

/** Fake progress segments shown while the model works; the real call takes 10-30 s. */
const LOADER_SEGMENTS = [0, 1, 2, 3];
const LOADER_SEGMENT_SECONDS = 5;

export function CameraCapture() {
  const locale = useLocale();
  const t = useMessages();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abandoned = useRef(false);
  const [phase, setPhase] = useState<Phase>({ kind: "starting" });
  const [facing, setFacing] = useState<Facing>("user");
  // Bumping this restarts the camera (after "Retake" or when the tab comes back).
  const [cameraRun, setCameraRun] = useState(0);

  const wantsCamera = phase.kind === "starting" || phase.kind === "live";

  // Start the camera on mount and after every restart.
  useEffect(() => {
    if (!wantsCamera) return;
    let cancelled = false;

    openCamera(facing)
      .then(async (stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play().catch(() => {});
        }
        setPhase({ kind: "live" });
      })
      .catch((err: unknown) => {
        if (!cancelled) setPhase({ kind: "no-camera", reason: describeCameraError(err) });
      });

    return () => {
      cancelled = true;
      stopStream(streamRef);
    };
  }, [facing, cameraRun, wantsCamera]);

  // Release the camera when the tab is hidden; restart it when it comes back.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        stopStream(streamRef);
      } else if (wantsCamera) {
        setCameraRun((n) => n + 1);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [wantsCamera]);

  async function capture() {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;
    const dataUrl = await toCompressedJpeg(video);
    stopStream(streamRef);
    setPhase({ kind: "captured", dataUrl });
  }

  async function onFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const dataUrl = await toCompressedJpeg(file);
    stopStream(streamRef);
    setPhase({ kind: "captured", dataUrl });
  }

  function retake() {
    setPhase({ kind: "starting" });
    setCameraRun((n) => n + 1);
  }

  function abandon() {
    abandoned.current = true;
    stopStream(streamRef);
  }

  async function analyze(dataUrl: string) {
    setPhase({ kind: "analyzing", dataUrl });
    const { mediaType, data } = splitDataUrl(dataUrl);
    const profile = readProfile();

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: data, mediaType, profile, locale }),
      });
      const json = (await res.json()) as SkinAssessment | { error: string };
      if (abandoned.current) return;
      if (!res.ok || "error" in json) {
        const message = "error" in json ? json.error : fill(t.errors.request, { status: res.status });
        setPhase({ kind: "error", dataUrl, message });
        return;
      }
      const stored: StoredAnalysis = {
        createdAt: new Date().toISOString(),
        imageDataUrl: dataUrl,
        result: pendingAnalysis(json),
        routineReady: false,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      // Next: the skin report. The routine is built later, after the budget and preferences form.
      router.push(routes.app.onboarding.report);
    } catch (err) {
      if (abandoned.current) return;
      setPhase({
        kind: "error",
        dataUrl,
        message: err instanceof Error ? err.message : t.errors.network,
      });
    }
  }

  const stillUrl = "dataUrl" in phase ? phase.dataUrl : null;

  return (
    <div className="flex flex-1 flex-col gap-3">
      {/* Height is capped so the shutter and the buttons below stay visible without scrolling on a phone. */}
      <div className="relative aspect-[3/4] max-h-[58dvh] w-full overflow-hidden rounded-3xl bg-ink">
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`h-full w-full object-cover ${facing === "user" ? "scale-x-[-1]" : ""} ${
            wantsCamera ? "" : "hidden"
          }`}
        />
        {stillUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={stillUrl} alt={t.photo.yourPhoto} className="h-full w-full object-cover" />
        )}

        {wantsCamera && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-[16%] top-[8%] bottom-[22%] rounded-[50%] border-2 border-paper/70"
          />
        )}

        {phase.kind === "starting" && (
          <p className="absolute inset-x-0 top-4 text-center text-sm text-paper/80">{t.photo.starting}</p>
        )}

        {phase.kind === "no-camera" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-paper">
            <p className="body-md">{phase.reason}</p>
          </div>
        )}

        {phase.kind === "analyzing" && <AnalyzingOverlay />}

        {wantsCamera && (
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-6 pb-5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full bg-paper/20 px-3 py-2 text-xs font-medium text-paper backdrop-blur"
            >
              {t.photo.library}
            </button>
            <button
              type="button"
              onClick={capture}
              disabled={phase.kind !== "live"}
              aria-label={t.photo.takePhoto}
              className="h-16 w-16 rounded-full border-4 border-paper bg-paper/90 shadow-md disabled:opacity-40"
            />
            <button
              type="button"
              onClick={() => setFacing((f) => (f === "user" ? "environment" : "user"))}
              className="rounded-full bg-paper/20 px-3 py-2 text-xs font-medium text-paper backdrop-blur"
            >
              {t.photo.flip}
            </button>
          </div>
        )}
      </div>

      {phase.kind === "error" && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {phase.message}
        </p>
      )}

      <div className="flex flex-col gap-2">
        {(phase.kind === "captured" || phase.kind === "error") && (
          <>
            <button
              type="button"
              onClick={() => analyze(phase.dataUrl)}
              className="rounded-full bg-accent px-6 py-4 text-base font-semibold text-paper"
            >
              {t.photo.analyze}
            </button>
            <button
              type="button"
              onClick={retake}
              className="rounded-full border border-line px-6 py-3 text-sm text-ink"
            >
              {t.photo.retake}
            </button>
          </>
        )}

        {phase.kind === "no-camera" && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-full bg-accent px-6 py-4 text-base font-semibold text-paper"
          >
            {t.photo.chooseLibrary}
          </button>
        )}

        <Link
          href={routes.app.today}
          onClick={abandon}
          className="rounded-full border border-line px-6 py-3 text-center text-sm text-ink"
        >
          {t.photo.cancel}
        </Link>

        {/* No `capture` attribute: on iOS it would force the camera instead of the photo library. */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onFilePicked}
          className="hidden"
        />
      </div>
    </div>
  );
}

/** Scan line over the photo plus four bars that fill one after another. */
function AnalyzingOverlay() {
  const t = useMessages().photo;
  return (
    <div className="absolute inset-0 overflow-hidden bg-ink/40">
      <div
        aria-hidden
        className="animate-scan absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-brand-peach/70 to-transparent"
      />
      <div className="absolute inset-x-5 bottom-5 flex flex-col gap-3">
        <p className="text-center text-sm text-paper">{t.reading}</p>
        <div className="flex gap-1.5" role="progressbar" aria-label={t.analyzing}>
          {LOADER_SEGMENTS.map((i) => (
            <span key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper/30">
              <span
                className="animate-fill block h-full bg-paper"
                style={{
                  animationDuration: `${LOADER_SEGMENT_SECONDS}s`,
                  animationDelay: `${i * LOADER_SEGMENT_SECONDS}s`,
                }}
              />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function stopStream(ref: React.RefObject<MediaStream | null>) {
  ref.current?.getTracks().forEach((t) => t.stop());
  ref.current = null;
}

async function openCamera(mode: Facing): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new DOMException("getUserMedia unavailable", "NotSupportedError");
  }
  return navigator.mediaDevices.getUserMedia({
    video: { facingMode: mode, width: { ideal: 1920 }, height: { ideal: 1920 } },
    audio: false,
  });
}

function describeCameraError(err: unknown): string {
  const t = messagesFor(localeFromCookieHeader(document.cookie)).photo;
  const name = err instanceof DOMException ? err.name : "";
  switch (name) {
    case "NotAllowedError":
      return t.cameraDenied;
    case "NotFoundError":
      return t.cameraMissing;
    case "NotSupportedError":
      return t.cameraUnsupported;
    default:
      return t.cameraFailed;
  }
}

function readProfile(): unknown {
  try {
    const raw = localStorage.getItem("pielegnacja:profile");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
