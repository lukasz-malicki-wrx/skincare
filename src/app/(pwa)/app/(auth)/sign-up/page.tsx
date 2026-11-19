import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { signUp } from "@/app/actions/auth";
import { AuthForm } from "@/features/auth/auth-form";
import { getTranslations } from "@/i18n/locale";
import { routes } from "@/config/routes";
import { getSessionUser } from "@/lib/auth";
import { createRegistrationDefaults } from "@/lib/registration-defaults";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t.auth.signUp };
}

export default async function SignUpPage() {
  const user = await getSessionUser();
  if (user) redirect(routes.app.today);

  const t = await getTranslations();
  const defaults = createRegistrationDefaults();

  return (
    <>
      <Heading level={1} variant="heading-md">{t.auth.signUp}</Heading>
      <Text variant="body-sm" tone="muted">{t.auth.signUpHint}</Text>
      <AuthForm
        action={signUp}
        submitLabel={t.auth.signUp}
        fields={[
          {
            name: "name",
            label: t.auth.name,
            type: "text",
            autoComplete: "name",
            defaultValue: defaults.name,
          },
          {
            name: "email",
            label: t.auth.email,
            type: "email",
            autoComplete: "email",
            defaultValue: defaults.email,
          },
          {
            name: "password",
            label: t.auth.password,
            type: "text",
            autoComplete: "new-password",
            defaultValue: defaults.password,
          },
        ]}
        alternate={{ href: routes.app.signIn, label: t.auth.signIn }}
      />
    </>
  );
}
