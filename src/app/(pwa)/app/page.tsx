import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { routes } from "@/config/routes";
import { getSessionUser } from "@/lib/auth";
import { getTranslations } from "@/i18n/locale";
import { ButtonLink } from "@/components/button";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";

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
        <Text variant="caption" tone="accent">
          {t.welcome.eyebrow}
        </Text>
        <Heading level={1}>{t.appName}</Heading>
      </div>
      <div className="flex w-full flex-col gap-3">
        <ButtonLink href={routes.app.signUp} variant="accent">
          {t.welcome.signUp}
        </ButtonLink>
        <ButtonLink href={routes.app.signIn} variant="outline-accent">
          {t.welcome.signIn}
        </ButtonLink>
      </div>
    </main>
  );
}
