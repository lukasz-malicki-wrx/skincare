import { cn } from "@/lib/cn";
import { Text } from "@/components/text";

const SIZES = {
  sm: "h-3.5 w-3.5 border-2 border-accent border-t-transparent",
  lg: "h-14 w-14 border-4 border-line border-t-accent",
  xl: "h-20 w-20 border-4 border-line border-t-accent",
} as const;

/** Decorative loading ring. The surrounding text says what is loading. */
export function Spinner({ size = "sm" }: { size?: keyof typeof SIZES }) {
  return <span aria-hidden className={cn("inline-block shrink-0 animate-spin rounded-full", SIZES[size])} />;
}

/** A spinner with its label on one line, announced politely to screen readers. */
export function InlineLoading({ label }: { label: string }) {
  return (
    <Text role="status" variant="body-sm" tone="muted" className="flex items-center gap-2">
      <Spinner />
      {label}
    </Text>
  );
}
