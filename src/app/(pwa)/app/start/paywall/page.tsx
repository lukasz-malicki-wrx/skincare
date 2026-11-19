import type { Metadata } from "next";
import { Paywall } from "@/features/paywall/paywall";
import { getTranslations } from "@/i18n/locale";
import { requireSessionUser } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t.paywall.proTitle };
}

/** Screen 10. Always the mocked checkout, even when a subscription is already active. */
export default async function PaywallPage() {
  await requireSessionUser();

  return (
    <section className="flex flex-1 flex-col">
      <Paywall />
    </section>
  );
}
