/**
 * The query string with `key` set to `value`, or removed when `value` is the default, so the
 * default view keeps a clean URL. Returns "" or "?..." ready to append to a pathname.
 */
export function withSearchParam(search: string, key: string, value: string, fallback: string): string {
  const params = new URLSearchParams(search);
  if (value === fallback) params.delete(key);
  else params.set(key, value);
  const query = params.toString();
  return query ? `?${query}` : "";
}

/** A query value narrowed to the allowed options, or the fallback. */
export function pickOption<T extends string>(raw: string | null, options: readonly T[], fallback: T): T {
  return options.includes(raw as T) ? (raw as T) : fallback;
}
