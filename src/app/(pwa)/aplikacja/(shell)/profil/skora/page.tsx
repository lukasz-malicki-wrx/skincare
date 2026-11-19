import type { Metadata } from "next";
import { SkinProfileForm } from "@/components/skin-profile-form";
import { routes } from "@/config/routes";
import { getTranslations } from "@/i18n/locale";

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
        <h1 className="heading-md">{t.profile.skin.title}</h1>
        <p className="body-sm text-ink/70">{t.profile.skin.usedFor}</p>
      </div>
      <SkinProfileForm submitLabel={t.profile.skin.save} nextHref={routes.app.profile} />
    </section>
  );
}
