/** Joins class names, skipping falsy parts: `cn("chip", active && "chip--on")`. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
