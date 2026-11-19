import { brand } from "@/config/brand";
import { routes } from "@/config/routes";
import { requestLocale } from "@/i18n/request-locale";
import { translations } from "@/i18n/translations";

export async function GET() {
  const t = translations[await requestLocale()];
  const manifest = {
    /** Kept from the old /aplikacja path so installed apps stay the same app after the move to /app. */
    id: "/aplikacja",
    name: t.appName,
    short_name: t.appName,
    description: t.manifest.description,
    start_url: routes.app.home,
    scope: routes.app.home,
    display: "standalone",
    background_color: brand.colors.cream,
    theme_color: brand.colors.cream,
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };

  return new Response(JSON.stringify(manifest), {
    headers: {
      "Content-Type": "application/manifest+json",
    },
  });
}
