import type { Metadata } from "next";
import { CameraCapture } from "@/components/camera-capture";
import { OnboardingProgress } from "@/components/onboarding-progress";
import { getTranslations } from "@/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t.photo.title };
}

/** Screen 4: camera with shooting hints. */
export default async function PhotoPage() {
  const t = await getTranslations();

  return (
    <section className="flex flex-1 flex-col gap-3">
      <OnboardingProgress />
      <div>
        <h1 className="heading-md">{t.photo.title}</h1>
        <p className="body-sm text-ink/70">{t.photo.body}</p>
      </div>
      <CameraCapture />
    </section>
  );
}
