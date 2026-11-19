import pkg from "../../../../../../package.json";
import type { Metadata } from "next";
import { signOut } from "@/app/actions/auth";
import { Button, ButtonLink } from "@/components/button";
import { ProfileSection } from "@/features/account/profile-section";
import { routes } from "@/config/routes";
import { LanguageSwitch } from "@/features/account/language-switch";
import { PrivacyControls } from "@/features/account/privacy-controls";
import { ReminderSettingsPanel } from "@/features/account/reminder-settings";
import { DemoAdvanceButton } from "@/features/account/demo-advance-button";
import { SubscriptionControls } from "@/features/account/subscription-controls";
import { getTranslations } from "@/i18n/locale";
import { requireSessionContext } from "@/lib/auth";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";

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
      <Heading level={1} variant="heading-md">{t.profile.title}</Heading>

      <ProfileSection title={t.profile.account}>
        <Text >{user.email}</Text>
        <LanguageSwitch />
        <form action={signOut}>
          <Button type="submit" variant="outline-accent" className="w-full">
            {t.auth.signOut}
          </Button>
        </form>
      </ProfileSection>

      <ProfileSection title={t.profile.subscription.title}>
        <SubscriptionControls subscription={subscription} />
      </ProfileSection>

      <ProfileSection title={t.profile.myPlan}>
        <ButtonLink href={routes.app.skinProfile} variant="outline">
          {t.profile.editSkin}
        </ButtonLink>
        <ButtonLink href={routes.app.onboarding.photo} variant="accent">
          {t.profile.newAnalysis}
        </ButtonLink>
      </ProfileSection>

      <ProfileSection title={t.profile.reminders.title}>
        <ReminderSettingsPanel />
      </ProfileSection>

      <ProfileSection title={t.profile.privacy.title}>
        <ul className="flex flex-col gap-1 body-sm text-ink/70">
          {clauses.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <PrivacyControls email={user.email} />
      </ProfileSection>

      <footer className="flex flex-col items-center gap-1 pt-2 text-center">
        <Text variant="body-sm" tone="muted">{t.profile.disclaimer}</Text>
        <Text variant="body-sm" tone="muted">
          {t.appName} {pkg.version}
        </Text>
        <DemoAdvanceButton />
      </footer>
    </div>
  );
}
