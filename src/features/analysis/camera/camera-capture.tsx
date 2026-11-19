"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Button, ButtonLink } from "@/components/button";
import { routes } from "@/config/routes";
import { AnalyzingOverlay } from "@/features/analysis/camera/analyzing-overlay";
import { useCamera } from "@/features/analysis/camera/use-camera";
import { useSkinAssessment } from "@/features/analysis/camera/use-skin-assessment";
import { useMessages } from "@/i18n/locale-provider";
import { requestErrorMessage } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { toCompressedJpeg } from "@/lib/image";
import { Alert } from "@/components/alert";
import { Text } from "@/components/text";

/**
 * Screen 4: live camera or a photo from the library, then the analysis. The camera lives in
 * `useCamera`, the request in `useSkinAssessment`; this component only arranges the screen.
 */
export function CameraCapture() {
  const t = useMessages();
  const fileInputRef = useRef<HTMLInputElement>(null);
  // The captured or picked photo. null = the live camera is showing.
  const [still, setStill] = useState<string | null>(null);
  const { videoRef, status: cameraStatus, facing, flip, restart, stop } = useCamera(still === null);
  const assessment = useSkinAssessment();

  const live = still === null;
  const analyzing = assessment.state.status === "analyzing";
  const unavailable = live && cameraStatus.kind === "unavailable" ? cameraStatus.issue : null;

  async function capture() {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;
    const dataUrl = await toCompressedJpeg(video);
    stop();
    setStill(dataUrl);
  }

  async function onFilePicked(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const dataUrl = await toCompressedJpeg(file);
    stop();
    setStill(dataUrl);
  }

  function retake() {
    assessment.reset();
    setStill(null);
    restart();
  }

  function pickFromLibrary() {
    fileInputRef.current?.click();
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      {/* Height is capped so the shutter and the buttons below stay visible without scrolling on a phone. */}
      <div className="relative aspect-[3/4] max-h-[58dvh] w-full overflow-hidden rounded-3xl bg-ink">
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={cn("h-full w-full object-cover", facing === "user" && "scale-x-[-1]", !live && "hidden")}
        />
        {still && (
          // A data URL from this device: next/image would add nothing.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={still} alt={t.photo.yourPhoto} className="h-full w-full object-cover" />
        )}

        {live && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-[16%] top-[8%] bottom-[22%] rounded-[50%] border-2 border-paper/70"
          />
        )}

        {live && cameraStatus.kind === "starting" && (
          <Text role="status" variant="body-sm" tone="inverse" className="absolute inset-x-0 top-4 text-center">
            {t.photo.starting}
          </Text>
        )}

        {unavailable && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-paper">
            <Text role="alert" >
              {t.photo[unavailable]}
            </Text>
          </div>
        )}

        {analyzing && <AnalyzingOverlay />}

        {live && (
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-6 pb-5">
            <Button variant="overlay" size="xs" onClick={pickFromLibrary}>
              {t.photo.library}
            </Button>
            <button
              type="button"
              onClick={capture}
              disabled={cameraStatus.kind !== "live"}
              aria-label={t.photo.takePhoto}
              className="h-16 w-16 rounded-full border-4 border-paper bg-paper/90 shadow-md disabled:opacity-40"
            />
            <Button variant="overlay" size="xs" onClick={flip}>
              {t.photo.flip}
            </Button>
          </div>
        )}
      </div>

      {assessment.state.status === "error" && (
        <Alert>
          {requestErrorMessage(assessment.state.error, t.errors)}
        </Alert>
      )}

      <div className="flex flex-col gap-2">
        {still && !analyzing && (
          <>
            <Button onClick={() => assessment.analyze(still)} variant="accent" size="lg">
              {t.photo.analyze}
            </Button>
            <Button onClick={retake} variant="outline">
              {t.photo.retake}
            </Button>
          </>
        )}

        {unavailable && (
          <Button onClick={pickFromLibrary} variant="accent" size="lg">
            {t.photo.chooseLibrary}
          </Button>
        )}

        {/* Leaving unmounts the screen, which stops the camera and aborts a running analysis. */}
        <ButtonLink href={routes.app.today} variant="outline">
          {t.photo.cancel}
        </ButtonLink>

        {/* No `capture` attribute: on iOS it would force the camera instead of the photo library. */}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={onFilePicked} className="hidden" />
      </div>
    </div>
  );
}
