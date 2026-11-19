import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** The type scale from globals.css (Figma "Typography" frame); each key is a Tailwind utility. */
const VARIANTS = {
  "heading-lg": "heading-lg",
  "heading-md": "heading-md",
  "heading-sm": "heading-sm",
  "title-lg": "title-lg",
  "title-md": "title-md",
  "title-sm": "title-sm",
  "body-lg": "body-lg",
  "body-md": "body-md",
  "body-sm": "body-sm",
  caption: "caption",
} as const;

/** Text colours that meet WCAG AA on the app's cream background. */
const TONES = {
  default: "",
  muted: "text-ink/70",
  accent: "text-accent",
  danger: "text-red-800",
  /** On the dark camera view and photo overlays. */
  inverse: "text-paper",
} as const;

const WEIGHTS = { regular: "", medium: "font-medium", semibold: "font-semibold" } as const;

export type TextVariant = keyof typeof VARIANTS;

/** `legend` and `label` keep their form semantics; headings come through `Heading`. */
type TextTag = "p" | "span" | "div" | "legend" | "label" | "h1" | "h2" | "h3" | "h4";

export type TextProps = {
  as?: TextTag;
  variant?: TextVariant;
  /** `muted` is the secondary colour that still meets AA; use it instead of an opacity class. */
  tone?: keyof typeof TONES;
  weight?: keyof typeof WEIGHTS;
} & HTMLAttributes<HTMLElement>;

/**
 * Any copy on the app's type scale. The only owner of the typography classes: `Heading` renders
 * through it, and nothing else builds these classes. `className` is for layout only.
 */
export function Text({
  as: Tag = "p",
  variant = "body-md",
  tone = "default",
  weight = "regular",
  className,
  ...props
}: TextProps) {
  return <Tag className={cn(VARIANTS[variant], TONES[tone], WEIGHTS[weight], className)} {...props} />;
}
