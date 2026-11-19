"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";

export type AppNavItem = { href: string; label: string };

export function AppNav({ items }: { items: readonly AppNavItem[] }) {
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

function NavLink({ item, active }: { item: AppNavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      prefetch={true}
      aria-current={active ? "page" : undefined}
      className="px-1 py-3 text-center text-sm"
    >
      <NavLabel active={active}>{item.label}</NavLabel>
    </Link>
  );
}

/** useLinkStatus only works inside a Link, so the pressed tab can highlight before the page arrives. */
function NavLabel({ active, children }: { active: boolean; children: React.ReactNode }) {
  const { pending } = useLinkStatus();
  return <span className={active || pending ? "font-semibold text-accent" : "text-ink/60"}>{children}</span>;
}
