import { formatPln } from "@/i18n/format";
import type { Product } from "@/lib/products";
import { Text } from "@/components/text";

export function ProductLink({ product }: { product: Product }) {
  return (
    <a
      href={product.url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-1 flex flex-col gap-0.5 rounded-2xl bg-surface px-3 py-2"
    >
      <Text as="span" variant="body-sm" tone="accent" weight="medium">{product.name}</Text>
      <Text as="span" variant="body-sm" tone="muted">
        {product.shop}
        {product.price_pln !== null && `, ${formatPln(product.price_pln)}`}
      </Text>
    </a>
  );
}
