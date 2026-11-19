import type { Metadata } from "next";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { routes } from "@/config/routes";
import { getTranslations } from "@/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    applicationName: t.appName,
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: t.appName,
    },
    manifest: `${routes.app.home}/manifest.webmanifest`,
  };
}

export default async function AppLayout({
  children,
}: Readonly<LayoutProps<typeof routes.app.home>>) {
  return (
    <div className="mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden border-x border-line bg-paper">
      <ServiceWorkerRegister />
      {children}
    </div>
  );
}
