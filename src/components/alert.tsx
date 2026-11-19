import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * A red message box. By default it is an error the screen reader announces at once
 * (`role="alert"`); `announce={false}` for a standing warning that is part of the content.
 */
export function Alert({
  children,
  announce = true,
  size = "sm",
  className,
}: Readonly<{
  children: ReactNode;
  announce?: boolean;
  size?: "sm" | "md";
  className?: string;
}>) {
  return (
    <p
      role={announce ? "alert" : undefined}
      className={cn("rounded-2xl bg-red-50 px-4 py-3 text-red-900", size === "md" ? "body-md" : "body-sm", className)}
    >
      {children}
    </p>
  );
}
