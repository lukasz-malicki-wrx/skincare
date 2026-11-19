import { fill } from "@/i18n/format";

/** A request the app's own API rejected. `serverMessage` is the translated `error` it sent, if any. */
export class ApiError extends Error {
  readonly status: number;
  readonly serverMessage: string | null;

  constructor(status: number, serverMessage: string | null) {
    super(serverMessage ?? `HTTP ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.serverMessage = serverMessage;
  }
}

function errorOf(body: unknown): string | null {
  if (!body || typeof body !== "object" || !("error" in body)) return null;
  return typeof body.error === "string" ? body.error : null;
}

/**
 * POSTs JSON to one of the app's routes and returns the parsed body. Throws `ApiError` when the
 * route answers with an error, and lets fetch errors (offline, abort) through unchanged.
 */
export async function postJson<T>(url: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  const json: unknown = await res.json().catch(() => null);
  const serverMessage = errorOf(json);
  if (!res.ok || serverMessage !== null) throw new ApiError(res.status, serverMessage);
  return json as T;
}

/** A request cancelled by its AbortController: the component is gone, nothing to show. */
export function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

/** The message to show for a failed request, in the app language. */
export function requestErrorMessage(err: unknown, messages: { network: string; request: string }): string {
  if (err instanceof ApiError) return err.serverMessage ?? fill(messages.request, { status: err.status });
  return messages.network;
}
