"use client";

/* eslint-disable @next/next/no-img-element -- static brand image sized by landing.css */
import Link from "next/link";
import { routes } from "@/config/routes";
import { useMessages } from "@/i18n/locale-provider";
import { SECTION_LINKS } from "@/features/landing/sections";
import { useMobileMenu } from "@/features/landing/use-mobile-menu";

export function SiteHeader() {
  const landing = useMessages().landing;
  const { open, toggle, close, toggleRef, menuRef } = useMobileMenu();

  return (
    <header className="site-header container">
      <a className="brand" href="#top">
        <img src="/landing/img/logo.png" alt="" width="36" height="36" />
        <span>SkinCode</span>
      </a>
      <nav className="site-nav" aria-label="Main">
        {SECTION_LINKS.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
      <Link className="btn btn--outline site-header__cta" href={routes.app.home}>
        Scan my skin
      </Link>
      <button
        ref={toggleRef}
        className="menu-toggle"
        type="button"
        aria-label={open ? landing.closeMenu : landing.openMenu}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={toggle}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path className="menu-toggle__top" d="M4 8h16" />
          <path className="menu-toggle__bottom" d="M4 16h16" />
        </svg>
      </button>
      <nav ref={menuRef} className="mobile-menu" id="mobile-menu" aria-label="Mobile" hidden={!open}>
        {SECTION_LINKS.map((link) => (
          <a key={link.href} href={link.href} onClick={close}>
            {link.label}
          </a>
        ))}
        <Link className="btn btn--primary" href={routes.app.home} onClick={close}>
          Scan my skin
        </Link>
      </nav>
    </header>
  );
}
