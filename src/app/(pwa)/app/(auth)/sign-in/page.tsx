import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { signIn } from "@/app/actions/auth";
import { AuthForm } from "@/features/auth/auth-form";
import { getTranslations } from "@/i18n/locale";
import { routes } from "@/config/routes";
import { getSessionUser } from "@/lib/auth";
import { Heading } from "@/components/heading";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t.auth.signIn };
}

export default async function SignInPage() {
  const user = await getSessionUser();
  if (user) redirect(routes.app.today);

  const t = await getTranslations();

  return (
    <>
      <Heading level={1} variant="heading-md">{t.auth.signIn}</Heading>
      <AuthForm
        action={signIn}
        submitLabel={t.auth.signIn}
        fields={[
          {
            name: "email",
            label: t.auth.email,
            type: "email",
            autoComplete: "email",
          },
          {
            name: "password",
            label: t.auth.password,
            type: "password",
            autoComplete: "current-password",
          },
        ]}
        alternate={{ href: routes.app.signUp, label: t.auth.signUp }}
      />
    </>
  );
}
