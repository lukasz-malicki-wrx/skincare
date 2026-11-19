import type { Metadata } from "next";
import { OnboardingProgress } from "@/components/onboarding-progress";
import { SkinProfileForm } from "@/components/skin-profile-form";
import { routes } from "@/config/routes";
import { getTranslations } from "@/i18n/locale";

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
        <h1 className="heading-md">{t.profile.skin.checkTitle}</h1>
        <p className="body-sm text-ink/70">{t.profile.skin.checkBody}</p>
      </div>
      <SkinProfileForm
        submitLabel={t.profile.skin.buildPlan}
        nextHref={routes.app.onboarding.paywall}
        rebuildRoutine
      />
    </section>
  );
}
