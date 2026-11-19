import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { routes } from "@/config/routes";
import { getSessionUser } from "@/lib/auth";
import { getTranslations } from "@/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t.welcome.eyebrow };
}

export default async function WelcomePage() {
  const user = await getSessionUser();
  if (user) redirect(routes.app.today);

  const t = await getTranslations();

  return (
    <main className="flex min-h-0 flex-1 flex-col items-center justify-center gap-10 overflow-y-auto px-6 py-12">
      <div className="flex flex-col items-center gap-4 text-center">
        <BrandMark size={96} />
        <p className="caption text-accent">
          {t.welcome.eyebrow}
        </p>
        <h1 className="heading-lg">{t.appName}</h1>
      </div>
      <div className="flex w-full flex-col gap-3">
        <Link
          href={routes.app.signUp}
          className="rounded-full bg-accent px-5 py-3 text-center text-sm font-medium text-paper"
        >
          {t.welcome.signUp}
        </Link>
        <Link
          href={routes.app.signIn}
          className="rounded-full border border-accent px-5 py-3 text-center text-sm font-medium text-accent"
        >
          {t.welcome.signIn}
        </Link>
      </div>
    </main>
  );
}
