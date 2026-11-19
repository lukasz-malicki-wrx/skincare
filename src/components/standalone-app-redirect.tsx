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

/** W zainstalowanej PWA wejście na landing od razu otwiera aplikację. */
export function StandaloneAppRedirect() {
  return <script dangerouslySetInnerHTML={{ __html: redirectIfInstalled }} />;
}
