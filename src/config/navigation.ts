import { routes } from "@/config/routes";

/** Bottom bar. Scan and Assistant were cut from the MVP on 2026-10-03. */
export const appTabs = [
  { href: routes.app.today, key: "today" },
  { href: routes.app.plan, key: "plan" },
  { href: routes.app.profile, key: "profile" },
] as const;

export type AppTabKey = (typeof appTabs)[number]["key"];
