"use client";

import { memo } from "react";
import { ADDED_BY_YOU, type DietList as DietListName } from "@/features/plan/use-diet-plan";
import { fill } from "@/i18n/format";
import { useMessages } from "@/i18n/locale-provider";
import type { DietItem } from "@/lib/diet";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { Card } from "@/components/card";

export const DietList = memo(function DietList({
  list,
  title,
  items,
  onRemove,
}: Readonly<{
  list: DietListName;
  title: string;
  items: DietItem[];
  onRemove: (list: DietListName, item: DietItem) => void;
}>) {
  const copy = useMessages().plan.dietList;
  return (
    <section className="flex flex-col gap-2">
      <Heading level={2} variant="title-md">{title}</Heading>
      {items.length === 0 ? (
        <Text variant="body-sm" tone="muted">{copy.nothing}</Text>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((i) => (
            <Card as="li" key={i.item} tone="surface" padding="sm" className="flex items-start gap-3">
              <div className="flex min-w-0 flex-1 flex-col">
                <Text as="span" weight="medium" className="capitalize">{i.item}</Text>
                <Text as="span" variant="body-sm" tone="muted">{i.why === ADDED_BY_YOU ? copy.addedByYou : i.why}</Text>
              </div>
              <button
                type="button"
                onClick={() => onRemove(list, i)}
                aria-label={fill(copy.remove, { item: i.item })}
                className="text-ink/70"
              >
                ×
              </button>
            </Card>
          ))}
        </ul>
      )}
    </section>
  );
});
