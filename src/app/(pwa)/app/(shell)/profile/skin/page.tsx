import type { Metadata } from "next";
import { SkinProfileForm } from "@/features/skin-profile/skin-profile-form";
import { routes } from "@/config/routes";
import { getTranslations } from "@/i18n/locale";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t.profile.skin.title };
}

/** Screens 8 and 9 as one edit form, reachable from Profile. */
export default async function SkinProfilePage() {
  const t = await getTranslations();

  return (
    <section className="flex flex-col gap-6">
      <div>
        <Heading level={1} variant="heading-md">{t.profile.skin.title}</Heading>
        <Text variant="body-sm" tone="muted">{t.profile.skin.usedFor}</Text>
      </div>
      <SkinProfileForm submitLabel={t.profile.skin.save} nextHref={routes.app.profile} />
    </section>
  );
}
