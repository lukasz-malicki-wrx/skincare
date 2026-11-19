import Link from "next/link";
import type { AppNavItem } from "@/components/app-nav";
import { NavLabel } from "@/components/nav-label";

export function NavLink({ item, active }: { item: AppNavItem; active: boolean }) {
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
