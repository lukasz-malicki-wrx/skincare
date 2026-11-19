/** Why the live camera is not available, as a key into the `photo` messages. */
export type CameraIssue = "cameraDenied" | "cameraMissing" | "cameraUnsupported" | "cameraFailed";

export function cameraIssueOf(err: unknown): CameraIssue {
  const name = err instanceof DOMException ? err.name : "";
  if (name === "NotAllowedError") return "cameraDenied";
  if (name === "NotFoundError") return "cameraMissing";
  if (name === "NotSupportedError") return "cameraUnsupported";
  return "cameraFailed";
}
