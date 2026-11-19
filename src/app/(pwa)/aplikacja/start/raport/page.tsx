import type { Metadata } from "next";
import { AnalysisReport } from "@/components/analysis-report";
import { getTranslations } from "@/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t.result.title };
}

/** Screen 7: the skin report right after the photo. Diagnosis only; the plan comes after the preferences form. */
export default async function ReportPage() {
  const t = await getTranslations();

  return (
    <section className="flex flex-1 flex-col gap-3">
      <h1 className="body-sm text-ink/60">{t.result.title}</h1>
      <AnalysisReport part="skin" />
    </section>
  );
}
