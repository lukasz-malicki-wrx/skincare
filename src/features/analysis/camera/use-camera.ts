"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { cameraIssueOf, type CameraIssue } from "@/features/analysis/camera/camera-issue";

export type Facing = "user" | "environment";
export type CameraStatus = { kind: "starting" } | { kind: "live" } | { kind: "unavailable"; issue: CameraIssue };

/**
 * A live camera stream in `videoRef` while `active`. The stream stops when the hook goes
 * inactive, the component unmounts or the tab is hidden, and restarts when the tab comes back,
 * so the camera light never stays on in the background.
 */
export function useCamera(active: boolean) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>({ kind: "starting" });
  const [facing, setFacing] = useState<Facing>("user");
  // Bumping this restarts the stream (after a retake or when the tab comes back).
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    openCamera(facing)
      .then(async (stream) => {
        if (cancelled) return stopTracks(stream);
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play().catch(() => {});
        }
        setStatus({ kind: "live" });
      })
      .catch((err: unknown) => {
        if (!cancelled) setStatus({ kind: "unavailable", issue: cameraIssueOf(err) });
      });

    return () => {
      cancelled = true;
      stopStream(streamRef);
    };
  }, [active, facing, run]);

  useEffect(() => {
    if (!active) return;
    const onVisibility = () => {
      if (document.hidden) stopStream(streamRef);
      else setRun((n) => n + 1);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [active]);

  const flip = useCallback(() => setFacing((f) => (f === "user" ? "environment" : "user")), []);
  const restart = useCallback(() => {
    setStatus({ kind: "starting" });
    setRun((n) => n + 1);
  }, []);
  const stop = useCallback(() => stopStream(streamRef), []);

  return { videoRef, status, facing, flip, restart, stop };
}

function stopTracks(stream: MediaStream) {
  stream.getTracks().forEach((track) => track.stop());
}

function stopStream(ref: RefObject<MediaStream | null>) {
  if (ref.current) stopTracks(ref.current);
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
