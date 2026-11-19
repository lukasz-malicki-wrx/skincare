"use client";

import { InlineLoading } from "@/components/spinner";
import { ProductLink } from "@/features/analysis/report/product-link";
import type { RoutineProductsState } from "@/features/analysis/report/use-routine-products";
import { useMessages } from "@/i18n/locale-provider";
import { Text } from "@/components/text";

export function StepProduct({ state, stepKey }: Readonly<{ state: RoutineProductsState; stepKey: string }>) {
  const t = useMessages().result;
  if (state.status === "skipped") return null;

  if (state.status === "loading") {
    return <InlineLoading label={t.findingProduct} />;
  }

  if (state.status === "error") {
    return <Text variant="body-sm" tone="danger">{t.productSearchFailed}</Text>;
  }

  const product = state.products[stepKey];
  if (!product) return <Text variant="body-sm" tone="muted">{t.noProduct}</Text>;
  return <ProductLink product={product} />;
}
