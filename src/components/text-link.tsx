import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const VARIANTS = {
  /** Inside a sentence: underlined, so it is not told apart by colour alone (WCAG 1.4.1). */
  inline: "text-accent underline underline-offset-2",
  /** On its own line, where position already marks it as a link. */
  standalone: "font-medium text-accent",
} as const;

/** An in-app text link. It takes the size of the text around it; `className` is for layout only. */
export function TextLink({
  variant = "inline",
  className,
  ...props
}: Readonly<{ variant?: keyof typeof VARIANTS } & ComponentProps<typeof Link>>) {
  return <Link className={cn(VARIANTS[variant], className)} {...props} />;
}
