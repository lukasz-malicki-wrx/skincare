"use client";

import { ProgressBar } from "@/components/progress-bar";
import { routes } from "@/config/routes";
import { fill, formatPln } from "@/i18n/format";
import { useMessages } from "@/i18n/locale-provider";
import { Text } from "@/components/text";
import { TextLink } from "@/components/text-link";
import { Card } from "@/components/card";

export function BudgetBar({ total, budget }: Readonly<{ total: number; budget: number }>) {
  const copy = useMessages().plan;
  const over = total - budget;
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <Text as="span" variant="body-sm" tone="muted">{copy.cost}</Text>
        <Text as="span" variant="title-md">
          {formatPln(total, 0)}{" "}
          <Text as="span" variant="body-sm" tone="muted">{fill(copy.ofBudget, { amount: formatPln(budget, 0) })}</Text>
        </Text>
      </div>
      <ProgressBar value={total} max={budget} size="md" tone={over > 0 ? "danger" : "brand"} />
      {over > 0 ? (
        <Text variant="body-sm" tone="danger">{fill(copy.overBudget, { amount: formatPln(over, 0) })}</Text>
      ) : (
        <Text variant="body-sm" tone="muted">
          {copy.budgetFrom}{" "}
          <TextLink href={routes.app.skinProfile}>
            {copy.skinProfile}
          </TextLink>
          .
        </Text>
      )}
    </Card>
  );
}
