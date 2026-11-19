import type { ReactNode } from "react";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";

export function DialogBlock({ title, children }: Readonly<{ title: string; children: ReactNode }>) {
  return (
    <section className="flex flex-col gap-1">
      <Heading level={3} variant="body-sm" tone="muted">{title}</Heading>
      <Text >{children}</Text>
    </section>
  );
}
