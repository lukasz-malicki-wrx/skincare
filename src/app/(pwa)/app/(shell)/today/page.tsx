import type { Metadata } from "next";
import { Screen } from "@/components/screen";
import { TodayStart } from "@/features/today/today-start";
import { getTranslations } from "@/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t.today.title };
}

/** Screen 12: Today, the dashboard and the home screen after onboarding. */
export default async function TodayPage() {
  const t = await getTranslations();

  return (
    <div className="flex flex-col gap-6">
      <Screen title={t.today.title} text={t.today.body} />
      <TodayStart />
    </div>
  );
}
