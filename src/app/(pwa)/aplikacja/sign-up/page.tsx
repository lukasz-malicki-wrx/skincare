import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { signUp } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth-form";
import { getTranslations } from "@/i18n/locale";
import { routes } from "@/config/routes";
import { getSessionUser } from "@/lib/auth";
import { createRegistrationDefaults } from "@/lib/registration-defaults";

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
    <main className="flex min-h-0 flex-1 flex-col justify-center gap-6 overflow-y-auto px-6 py-10">
      <h1 className="heading-md">{t.auth.signUp}</h1>
      <p className="text-sm leading-relaxed text-ink/70">{t.auth.signUpHint}</p>
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
    </main>
  );
}
