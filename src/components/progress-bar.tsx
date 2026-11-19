import { cn } from "@/lib/cn";

const TONES = {
  accent: "bg-accent",
  brand: "bg-gradient-to-r from-brand-peach to-brand-terracotta",
  danger: "bg-red-700",
} as const;

const SIZES = { sm: "h-1 bg-line", md: "h-2 bg-line/60" } as const;

/**
 * A horizontal bar for `value` out of `max` (clamped). With a `label` it is a `progressbar` for
 * assistive tech; without one it is decorative and hidden from it. The fill width is the one
 * runtime value that has to be an inline style.
 */
export function ProgressBar({
  value,
  max,
  min = 0,
  label,
  tone = "accent",
  size = "sm",
  className,
}: Readonly<{
  value: number;
  max: number;
  min?: number;
  label?: string;
  tone?: keyof typeof TONES;
  size?: keyof typeof SIZES;
  className?: string;
}>) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const a11y = label
    ? { role: "progressbar", "aria-label": label, "aria-valuemin": min, "aria-valuemax": max, "aria-valuenow": value }
    : { "aria-hidden": true };

  return (
    <div {...a11y} className={cn("overflow-hidden rounded-full", SIZES[size], className)}>
      <div
        className={cn("h-full rounded-full motion-safe:transition-[width] motion-safe:duration-300", TONES[tone])}
        style={{ width: `${ratio * 100}%` }}
      />
    </div>
  );
}
