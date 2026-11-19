import type { Metadata } from "next";
import { getTranslations } from "@/i18n/locale";
import { LandingPage } from "@/features/landing/landing-page";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: { absolute: t.landing.metaTitle },
    description: t.landing.metaDescription,
    openGraph: {
      title: t.landing.metaTitle,
      description: t.landing.metaDescription,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: t.landing.metaTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: t.landing.metaTitle,
      description: t.landing.metaDescription,
      images: ["/og.png"],
    },
  };
}

export default function Page() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* Figtree is used only by the landing stylesheet, so the page-level font link is deliberate. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Prata&family=Figtree:wght@400;500;600&display=swap"
      />
      <LandingPage />
    </>
  );
}
