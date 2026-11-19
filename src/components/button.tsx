import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const VARIANTS = {
  primary: "bg-ink font-semibold text-paper",
  accent: "bg-accent font-semibold text-paper",
  outline: "border border-line text-ink",
  "outline-accent": "border border-accent font-medium text-accent",
  danger: "bg-red-800 font-semibold text-paper",
  "outline-danger": "border border-red-800/40 text-red-800",
  ghost: "text-ink/70",
  /** Translucent, for controls laid over a photo or the camera. */
  overlay: "bg-paper/20 font-medium text-paper backdrop-blur",
} as const;

const SIZES = {
  xs: "px-3 py-2 text-xs",
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-3 text-sm",
  lg: "px-6 py-4 text-base",
} as const;

export type ButtonVariant = keyof typeof VARIANTS;
export type ButtonSize = keyof typeof SIZES;

type Appearance = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

function appearance({ variant = "primary", size = "md", fullWidth = false }: Appearance, className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full text-center disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    fullWidth && "w-full",
    className,
  );
}

/**
 * The app's pill button. `type` defaults to "button", so a button inside a form never submits by
 * accident; pass `type="submit"` for the one that should. `className` is for layout only
 * (`flex-1`, margins), not for restyling.
 */
export function Button({
  variant,
  size,
  fullWidth,
  className,
  type = "button",
  ...props
}: Appearance & ComponentProps<"button">) {
  return <button type={type} className={appearance({ variant, size, fullWidth }, className)} {...props} />;
}

/** A Next.js `Link` that looks like a `Button`: navigation stays a link for semantics and prefetch. */
export function ButtonLink({ variant, size, fullWidth, className, ...props }: Appearance & ComponentProps<typeof Link>) {
  return <Link className={appearance({ variant, size, fullWidth }, className)} {...props} />;
}

/** A link to another site that looks like a `Button`. Opens in a new tab without leaking the opener. */
export function ExternalButtonLink({
  variant,
  size,
  fullWidth,
  className,
  ...props
}: Appearance & Omit<ComponentProps<"a">, "target" | "rel">) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className={appearance({ variant, size, fullWidth }, className)}
      {...props}
    />
  );
}
