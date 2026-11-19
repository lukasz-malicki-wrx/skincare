/* eslint-disable @next/next/no-img-element -- static brand image sized by landing.css */
import { SECTION_LINKS } from "@/features/landing/sections";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div className="site-footer__top">
          <a className="brand brand--light" href="#top">
            <img src="/landing/img/logo.png" alt="" width="40" height="40" loading="lazy" decoding="async" />
            <span>SkinCode</span>
          </a>
          <nav className="site-footer__nav" aria-label="Footer">
            {SECTION_LINKS.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
        </div>
        <hr className="site-footer__rule" />
        <div className="site-footer__bottom">
          <p>
            SkinCode gives cosmetic guidance, not a medical diagnosis. For moles, persistent irritation, or anything
            that worries you — see a dermatologist.
          </p>
          <span>© 2026 SkinCode</span>
        </div>
      </div>
    </footer>
  );
}
