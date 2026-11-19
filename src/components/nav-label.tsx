"use client";

import { useLinkStatus } from "next/link";

/** useLinkStatus only works inside a Link, so the pressed tab can highlight before the page arrives. */
export function NavLabel({ active, children }: Readonly<{ active: boolean; children: React.ReactNode }>) {
  const { pending } = useLinkStatus();
  return <span className={active || pending ? "font-semibold text-accent" : "text-ink/70"}>{children}</span>;
}
