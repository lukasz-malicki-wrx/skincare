import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const SIZES = {
  /** A form field on its own row. */
  md: "rounded-xl px-3 py-3 text-base",
  /** Inline next to a small pill button (add item, time of day). */
  sm: "rounded-full px-4 py-2 text-sm",
} as const;

/** A text-like input. Always give it a `<label>` or an `aria-label`; `className` is for layout only. */
export function Input({ size = "md", className, ...props }: Readonly<{ size?: keyof typeof SIZES } & Omit<ComponentProps<"input">, "size">>) {
  return (
    <input
      className={cn("border border-line bg-surface text-ink disabled:opacity-50", SIZES[size], className)}
      {...props}
    />
  );
}
