import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { getTranslations } from "@/i18n/locale";
import { LandingScripts } from "./landing-scripts";
import "./styles.css";

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

/*
 * The landing was delivered as a static HTML page ported 1:1 from the design canvas.
 * Its body markup lives in landing.html next to this file and is rendered as-is: it is a
 * checked-in file we own, not user data, so SafeHtml/DOMPurify would only strip the inline SVG
 * symbol sprite the page relies on. Images are served from public/landing/img.
 */
const markup = fs.readFileSync(path.join(process.cwd(), "src/app/(landing)/landing.html"), "utf8");

export default function LandingPage() {
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
      <div dangerouslySetInnerHTML={{ __html: markup }} />
      <LandingScripts />
    </>
  );
}
