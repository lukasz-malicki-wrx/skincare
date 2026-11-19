import { routes } from "@/config/routes";

const redirectIfInstalled = `(function () {
  var media = window.matchMedia;
  var installed =
    (media &&
      (media("(display-mode: standalone)").matches ||
        media("(display-mode: fullscreen)").matches)) ||
    navigator.standalone === true;
  if (installed) location.replace(${JSON.stringify(routes.app.home)});
})();`;

/**
 * In the installed PWA, opening the landing page goes straight to the app. Runs as an inline
 * script before hydration so the landing never flashes.
 */
export function StandaloneAppRedirect() {
  return <script dangerouslySetInnerHTML={{ __html: redirectIfInstalled }} />;
}
