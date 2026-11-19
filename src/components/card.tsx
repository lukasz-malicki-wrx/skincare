import Link from "next/link";
import type { ComponentProps, HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const TONES = {
  plain: "border-line",
  surface: "border-line bg-surface",
  danger: "border-red-800/30",
} as const;

const PADDINGS = { sm: "px-4 py-3", md: "p-4", lg: "p-5" } as const;

type CardStyle = {
  /** `surface` lifts the card off the cream background; `danger` frames a destructive step. */
  tone?: keyof typeof TONES;
  padding?: keyof typeof PADDINGS;
};

function cardClasses({ tone = "plain", padding = "md" }: CardStyle, className?: string) {
  return cn("rounded-2xl border", TONES[tone], PADDINGS[padding], className);
}

/** A bordered panel. `className` is for the layout inside it (flex, gap), not its look. */
export function Card({
  as: Tag = "div",
  tone,
  padding,
  className,
  ...props
}: CardStyle & { as?: "div" | "li" | "section" } & HTMLAttributes<HTMLElement>) {
  return <Tag className={cardClasses({ tone, padding }, className)} {...props} />;
}

/** A whole card that navigates, for a summary that opens its detail screen. */
export function CardLink({ tone, padding, className, ...props }: CardStyle & ComponentProps<typeof Link>) {
  return <Link className={cardClasses({ tone, padding }, className)} {...props} />;
}
