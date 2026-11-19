import type { Metadata } from "next";
import { CameraCapture } from "@/features/analysis/camera/camera-capture";
import { OnboardingProgress } from "@/components/onboarding-progress";
import { getTranslations } from "@/i18n/locale";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";

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
        <Heading level={1} variant="heading-md">{t.photo.title}</Heading>
        <Text variant="body-sm" tone="muted">{t.photo.body}</Text>
      </div>
      <CameraCapture />
    </section>
  );
}
