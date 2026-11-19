"use client";

import { cn } from "@/lib/cn";
import { Text } from "@/components/text";

export function PlanOption({
  selected,
  badge,
  title,
  note,
  price,
  period,
  onSelect,
}: {
  selected: boolean;
  badge: string | null;
  title: string;
  note: string;
  price: string;
  period: string;
  onSelect: () => void;
}) {
  return (
    <label
      className={cn(
        "focus-ring-within relative flex min-h-[72px] cursor-pointer items-center gap-3.5 rounded-[20px] border-[1.5px] px-[18px] py-3.5 text-left",
        selected ? "border-accent bg-white" : "border-ink/10 bg-white/55",
      )}
    >
      <input type="radio" name="plan" checked={selected} onChange={onSelect} className="sr-only" />
      {badge && (
        <span className="absolute -top-2.5 right-4 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-white">
          {badge}
        </span>
      )}
      <span
        aria-hidden
        className={cn(
          "flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-[1.5px]",
          selected ? "border-accent" : "border-ink/25",
        )}
      >
        <span className={cn("h-2.5 w-2.5 rounded-full bg-accent", selected ? "opacity-100" : "opacity-0")} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[17px] font-semibold">{title}</span>
        <span className="text-sm text-ink/70">{note}</span>
      </span>
      <span className="flex flex-col items-end gap-0.5">
        <Text as="span" variant="title-lg">{price}</Text>
        <span className="text-[13px] text-ink/70">{period}</span>
      </span>
    </label>
  );
}
