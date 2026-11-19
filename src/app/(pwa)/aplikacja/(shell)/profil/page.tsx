import type { Metadata } from "next";
import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { LanguageSwitch } from "@/components/language-switch";
import { PrivacyControls } from "@/components/privacy-controls";
import { ReminderSettingsPanel } from "@/components/reminder-settings";
import { DemoAdvanceButton, SubscriptionControls } from "@/components/subscription-controls";
import { routes } from "@/config/routes";
import { getTranslations } from "@/i18n/locale";
import { requireSessionContext } from "@/lib/auth";
import pkg from "../../../../../../package.json";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t.profile.title };
}

/** Screen 20: account, subscription, skin profile, reminders, privacy. */
export default async function ProfilePage() {
  const [t, { user, subscription }] = await Promise.all([getTranslations(), requireSessionContext()]);
  const clauses = [
    t.profile.privacy.stay,
    t.profile.privacy.purpose,
    t.profile.privacy.noShare,
    t.profile.privacy.deleteHint,
  ];

  return (
    <div className="flex flex-col gap-8">
      <h1 className="heading-md">{t.profile.title}</h1>

      <Section title={t.profile.account}>
        <p className="body-md">{user.email}</p>
        <LanguageSwitch />
        <form action={signOut}>
          <button type="submit" className="w-full rounded-full border border-accent px-5 py-3 text-sm font-medium text-accent">
            {t.auth.signOut}
          </button>
        </form>
      </Section>

      <Section title={t.profile.subscription.title}>
        <SubscriptionControls subscription={subscription} />
      </Section>

      <Section title={t.profile.myPlan}>
        <Link href={routes.app.skinProfile} className="rounded-full border border-line px-5 py-3 text-center text-sm">
          {t.profile.editSkin}
        </Link>
        <Link href={routes.app.onboarding.photo} className="rounded-full bg-accent px-5 py-3 text-center text-sm font-medium text-paper">
          {t.profile.newAnalysis}
        </Link>
      </Section>

      <Section title={t.profile.reminders.title}>
        <ReminderSettingsPanel />
      </Section>

      <Section title={t.profile.privacy.title}>
        <ul className="flex flex-col gap-1 body-sm text-ink/70">
          {clauses.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <PrivacyControls email={user.email} />
      </Section>

      <footer className="flex flex-col items-center gap-1 pt-2 text-center">
        <p className="body-sm text-ink/50">{t.profile.disclaimer}</p>
        <p className="text-xs text-ink/40">
          {t.appName} {pkg.version}
        </p>
        <DemoAdvanceButton />
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="title-md">{title}</h2>
      {children}
    </section>
  );
}
