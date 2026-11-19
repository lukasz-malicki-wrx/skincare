import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { signIn } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth-form";
import { getTranslations } from "@/i18n/locale";
import { routes } from "@/config/routes";
import { getSessionUser } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t.auth.signIn };
}

export default async function SignInPage() {
  const user = await getSessionUser();
  if (user) redirect(routes.app.today);

  const t = await getTranslations();

  return (
    <main className="flex min-h-0 flex-1 flex-col justify-center gap-6 overflow-y-auto px-6 py-10">
      <h1 className="heading-md">{t.auth.signIn}</h1>
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
    </main>
  );
}
