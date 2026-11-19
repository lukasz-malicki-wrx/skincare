import { routes } from "@/config/routes";

export const appTabs = [
  { href: routes.app.today, key: "today" },
  { href: routes.app.plan, key: "plan" },
  { href: routes.app.profile, key: "profile" },
] as const;

export type AppTabKey = (typeof appTabs)[number]["key"];
