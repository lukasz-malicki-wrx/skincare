import type { NextConfig } from "next";

/**
 * The app used to live under Polish paths. Installed PWAs and old links still open them, so
 * each old path moves permanently to its English one. Specific paths first, the catch-all last.
 */
const LEGACY_APP_PATHS: Array<[from: string, to: string]> = [
  ["/aplikacja/dzis", "/app/today"],
  ["/aplikacja/profil/skora", "/app/profile/skin"],
  ["/aplikacja/profil", "/app/profile"],
  ["/aplikacja/start/zdjecie", "/app/start/photo"],
  ["/aplikacja/start/raport", "/app/start/report"],
  ["/aplikacja/start/profil", "/app/start/profile"],
  ["/aplikacja", "/app"],
  ["/aplikacja/:path*", "/app/:path*"],
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["@libsql/client"],
  redirects() {
    return LEGACY_APP_PATHS.map(([source, destination]) => ({ source, destination, permanent: true }));
  },
};

export default nextConfig;
