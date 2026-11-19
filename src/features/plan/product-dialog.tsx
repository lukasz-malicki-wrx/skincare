"use client";

import { useEffect, useRef, type MouseEvent } from "react";
import { Button, ExternalButtonLink } from "@/components/button";
import { DialogBlock } from "@/features/plan/dialog-block";
import { fill, formatPln } from "@/i18n/format";
import { useMessages } from "@/i18n/locale-provider";
import { nextCandidate, type PlanStep } from "@/lib/plan";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";

/**
 * Screen 16: product details in a native modal dialog (focus trap, Escape and inert background
 * for free). Mounted only while open; a backdrop tap closes it too. Loaded lazily by PlanView.
 */
export function ProductDialog({
  step,
  onSwap,
  onClose,
}: Readonly<{
  step: PlanStep;
  onSwap: (step: PlanStep) => void;
  onClose: () => void;
}>) {
  const copy = useMessages().plan;
  const ref = useRef<HTMLDialogElement>(null);
  const product = step.product;

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  function closeOnBackdrop(e: MouseEvent<HTMLDialogElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  if (!product) return null;
  const stepLabel = fill(copy.product.step, {
    period: copy[step.ref.period],
    n: step.ref.index + 1,
    name: step.ref.step,
  });

  return (
    <dialog
      ref={ref}
      aria-labelledby="product-dialog-title"
      onClose={onClose}
      onClick={closeOnBackdrop}
      className="m-auto w-[min(100vw-2rem,28rem)] rounded-3xl bg-paper p-0 text-ink backdrop:bg-ink/50"
    >
      <div className="flex flex-col gap-5 p-6">
        <header className="flex flex-col gap-1">
          <Text variant="body-sm" tone="muted">{stepLabel}</Text>
          <Heading id="product-dialog-title" level={2} variant="title-lg">
            {product.name}
          </Heading>
          <Text variant="body-sm" tone="muted">
            {product.brand}
            {product.pricePln !== null && ` · ${formatPln(product.pricePln)}`}
          </Text>
        </header>

        <DialogBlock title={copy.product.why}>{product.why}</DialogBlock>
        <DialogBlock title={copy.product.ingredients}>{product.ingredients.join(", ")}</DialogBlock>
        {product.watchOut && <DialogBlock title={copy.product.watchOut}>{product.watchOut}</DialogBlock>}
        <DialogBlock title={copy.product.howTo}>{product.howTo}</DialogBlock>

        <div className="flex flex-col gap-2">
          {nextCandidate(step) !== null && (
            <Button onClick={() => onSwap(step)}>
              {copy.product.swapAnother}
            </Button>
          )}
          <ExternalButtonLink href={product.url} variant="outline-accent">
            {fill(copy.product.buyAt, { shop: product.shop })}
          </ExternalButtonLink>
          <Button onClick={onClose} variant="ghost">
            {copy.product.close}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
