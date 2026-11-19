import { StandaloneAppRedirect } from "@/components/standalone-app-redirect";

/**
 * The landing is a separate public page at `/`. The installed PWA never shows it:
 * the manifest starts at /aplikacja and StandaloneAppRedirect covers a direct visit to `/`.
 */
export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StandaloneAppRedirect />
      {children}
    </>
  );
}
