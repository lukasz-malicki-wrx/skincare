import { AppNav } from "@/components/app-nav";
import { appTabs } from "@/config/navigation";
import { getTranslations } from "@/i18n/locale";
import { requireSessionUser } from "@/lib/auth";

export default async function ShellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireSessionUser();

  const t = await getTranslations();
  const items = appTabs.map((tab) => ({ href: tab.href, label: t.nav[tab.key] }));

  return (
    <>
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-6">{children}</main>
      <AppNav items={items} />
    </>
  );
}
