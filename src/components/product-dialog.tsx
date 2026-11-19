"use client";

import { useEffect, useRef } from "react";
import { useMessages } from "@/components/locale-provider";
import { fill } from "@/i18n/format";
import type { PlanProduct } from "@/lib/plan";

function formatPln(value: number) {
  return `${value.toFixed(2).replace(".", ",")} zł`;
}

/** Screen 16: product details. Native dialog, closes on Escape and backdrop tap. */
export function ProductDialog({
  product,
  stepLabel,
  canSwap,
  onSwap,
  onClose,
}: {
  product: PlanProduct | null;
  stepLabel: string;
  canSwap: boolean;
  onSwap: () => void;
  onClose: () => void;
}) {
  const copy = useMessages().plan.product;
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (product && !dialog.open) dialog.showModal();
    if (!product && dialog.open) dialog.close();
  }, [product]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-auto w-[min(100vw-2rem,28rem)] rounded-3xl bg-paper p-0 text-ink backdrop:bg-ink/50"
    >
      {product && (
        <div className="flex flex-col gap-5 p-6">
          <header className="flex flex-col gap-1">
            <p className="body-sm text-ink/60">{stepLabel}</p>
            <h2 className="title-lg">{product.name}</h2>
            <p className="body-sm text-ink/60">
              {product.brand}
              {product.pricePln !== null && ` · ${formatPln(product.pricePln)}`}
            </p>
          </header>

          <Block title={copy.why}>{product.why}</Block>
          <Block title={copy.ingredients}>{product.ingredients.join(", ")}</Block>
          {product.watchOut && <Block title={copy.watchOut}>{product.watchOut}</Block>}
          <Block title={copy.howTo}>{product.howTo}</Block>

          <div className="flex flex-col gap-2">
            {canSwap && (
              <button type="button" onClick={onSwap} className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-paper">
                {copy.swapAnother}
              </button>
            )}
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-accent px-5 py-3 text-center text-sm font-medium text-accent"
            >
              {fill(copy.buyAt, { shop: product.shop })}
            </a>
            <button type="button" onClick={onClose} className="rounded-full px-5 py-3 text-sm text-ink/60">
              {copy.close}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-1">
      <h3 className="body-sm text-ink/60">{title}</h3>
      <p className="body-md">{children}</p>
    </section>
  );
}
