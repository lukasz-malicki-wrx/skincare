import type { Metadata } from "next";
import { AnalysisReport } from "@/features/analysis/report/analysis-report";
import { getTranslations } from "@/i18n/locale";
import { Heading } from "@/components/heading";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t.result.title };
}

/** Screen 7: the skin report right after the photo. Diagnosis only; the plan comes after the preferences form. */
export default async function ReportPage() {
  const t = await getTranslations();

  return (
    <section className="flex flex-1 flex-col gap-3">
      <Heading level={1} variant="body-sm" tone="muted">{t.result.title}</Heading>
      <AnalysisReport part="skin" />
    </section>
  );
}
