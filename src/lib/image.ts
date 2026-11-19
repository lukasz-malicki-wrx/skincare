import { localeFromCookieHeader } from "@/i18n/locale-cookie";
import { messagesFor } from "@/i18n/messages";

const MAX_EDGE = 1568;
const QUALITY = 0.82;

/**
 * Skaluje obraz do max 1568 px na dłuższym boku i zwraca JPEG data URL.
 * Przyjmuje <video> (klatka z aparatu) albo Blob (plik z input capture).
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
