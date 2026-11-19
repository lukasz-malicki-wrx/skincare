"use client";

import { usePathname } from "next/navigation";
import { NavLink } from "@/components/nav-link";

export type AppNavItem = { href: string; label: string };

export function AppNav({ items }: Readonly<{ items: readonly AppNavItem[] }>) {
  const pathname = usePathname();

  return (
    <nav className="grid shrink-0 grid-cols-3 border-t border-line bg-paper px-1 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2">
      {items.map((item) => (
        <NavLink
          key={item.href}
          item={item}
          active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
        />
      ))}
    </nav>
  );
}
