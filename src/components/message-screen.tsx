import type { ReactNode } from "react";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { cn } from "@/lib/cn";

/**
 * A full-screen message with its actions: errors, not found. Presentational only, so it also
 * works in `global-error`, where no provider is mounted. `fullPage` centres it on its own page.
 */
export function MessageScreen({
  title,
  body,
  actions,
  alert = false,
  fullPage = false,
}: {
  title: string;
  body: string;
  actions: ReactNode;
  /** Announce as an error (`role="alert"`). */
  alert?: boolean;
  fullPage?: boolean;
}) {
  return (
    <div
      role={alert ? "alert" : undefined}
      className={cn("flex flex-col justify-center gap-5 px-5", fullPage ? "mx-auto min-h-dvh max-w-md" : "flex-1 py-8")}
    >
      <Heading level={1}>{title}</Heading>
      <Text tone="muted">{body}</Text>
      {actions}
    </div>
  );
}
