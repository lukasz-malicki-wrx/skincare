import { localeFromCookieHeader } from "@/i18n/locale-cookie";
import { messagesFor } from "@/i18n/messages";

const MAX_EDGE = 1568;
const QUALITY = 0.82;

/**
 * A JPEG data URL of a camera frame (`<video>`) or a picked file (`Blob`), scaled down so its
 * longer edge is at most MAX_EDGE px: the size the vision model reads best, and small enough for
 * the request body limit.
 */
export async function toCompressedJpeg(source: HTMLVideoElement | Blob): Promise<string> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error(messagesFor(localeFromCookieHeader(document.cookie)).errors.canvas);

  if (source instanceof Blob) {
    const bitmap = await createImageBitmap(source);
    const { width, height } = fit(bitmap.width, bitmap.height);
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
  } else {
    const { width, height } = fit(source.videoWidth, source.videoHeight);
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(source, 0, 0, width, height);
  }

  return canvas.toDataURL("image/jpeg", QUALITY);
}

function fit(w: number, h: number) {
  const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
  return { width: Math.round(w * scale), height: Math.round(h * scale) };
}

export function splitDataUrl(dataUrl: string) {
  const [header, data] = dataUrl.split(",");
  const mediaType = header.match(/data:(.*?);/)?.[1] ?? "image/jpeg";
  return { mediaType, data };
}
