import type { Metadata, Viewport } from "next";
import { Inter, Prata } from "next/font/google";
import { brand } from "@/config/brand";
import { routes } from "@/config/routes";
import { LocaleProvider } from "@/components/locale-provider";
import { getLocale, getTranslations } from "@/i18n/locale";
import "./globals.css";

/* Fonty brandu. Zmienne CSS czyta `@theme` w globals.css (--font-sans, --font-display). */
const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const prata = Prata({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-prata",
  display: "swap",
});

/** Absolute origin for og:image. Slack drops a preview image when the URL is relative. */
function metadataBaseUrl(): URL {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return new URL(configured);
  if (process.env.VERCEL_ENV === "preview") {
    const preview = process.env.VERCEL_BRANCH_URL || process.env.VERCEL_URL;
    if (preview) return new URL(`https://${preview}`);
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return new URL(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  return new URL("http://localhost:3000");
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    metadataBase: metadataBaseUrl(),
    title: {
      default: t.appName,
      template: `%s · ${t.appName}`,
    },
    description: t.meta.description,
    openGraph: {
      type: "website",
      siteName: t.appName,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: t.appName }],
    },
    twitter: {
      card: "summary_large_image",
      images: ["/og.png"],
    },
    icons: {
      icon: [
        { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: "/icons/apple-touch-icon.png",
    },
  };
}

export const viewport: Viewport = {
  themeColor: brand.colors.cream,
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: LayoutProps<typeof routes.home>) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={`${inter.variable} ${prata.variable}`}>
      <body className="bg-paper text-ink antialiased">
        <LocaleProvider locale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
