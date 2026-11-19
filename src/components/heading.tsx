import { Text, type TextProps, type TextVariant } from "@/components/text";

const TAGS = { 1: "h1", 2: "h2", 3: "h3", 4: "h4" } as const;

const DEFAULT_VARIANT: Record<keyof typeof TAGS, TextVariant> = {
  1: "heading-lg",
  2: "heading-md",
  3: "title-lg",
  4: "title-md",
};

/**
 * A section heading: `Text` with a required `level`. The level follows the document outline (one
 * h1 per screen, then h2, h3); `variant` follows the design. They are separate on purpose: a small
 * h1 label above a large h2 title is valid.
 */
export function Heading({ level, variant, ...props }: Readonly<{ level: keyof typeof TAGS } & Omit<TextProps, "as">>) {
  return <Text as={TAGS[level]} variant={variant ?? DEFAULT_VARIANT[level]} {...props} />;
}
