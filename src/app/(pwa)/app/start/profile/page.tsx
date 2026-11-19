import type { Metadata } from "next";
import { OnboardingProgress } from "@/components/onboarding-progress";
import { SkinProfileForm } from "@/features/skin-profile/skin-profile-form";
import { routes } from "@/config/routes";
import { getTranslations } from "@/i18n/locale";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t.profile.skin.checkTitle };
}

/**
 * After the skin report: confirm what the AI guessed from the photo, set the budget and preferences.
 * Only then is the routine built and the products searched, on the plan screen.
 */
export default async function OnboardingProfilePage() {
  const t = await getTranslations();

  return (
    <section className="flex flex-1 flex-col gap-5">
      <OnboardingProgress />
      <div>
        <Heading level={1} variant="heading-md">{t.profile.skin.checkTitle}</Heading>
        <Text variant="body-sm" tone="muted">{t.profile.skin.checkBody}</Text>
      </div>
      <SkinProfileForm
        submitLabel={t.profile.skin.buildPlan}
        nextHref={routes.app.onboarding.paywall}
        rebuildRoutine
      />
    </section>
  );
}
