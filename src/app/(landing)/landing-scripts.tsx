"use client";

import { useEffect } from "react";
import { useMessages } from "@/components/locale-provider";

/**
 * Port of the landing's `js/main.js`: scroll reveal for [data-reveal] groups and the mobile menu.
 * Runs after the static markup mounts and removes its listeners on unmount.
 */
export function LandingScripts() {
  const landing = useMessages().landing;

  useEffect(() => {
    const cleanups: Array<() => void> = [];

    const groups = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (groups.length && "IntersectionObserver" in window && !reduce) {
      document.documentElement.classList.add("js-anim");
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.add("is-in");
            entry.target.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-in"));
            io.unobserve(entry.target);
          }
        },
        { threshold: 0.25 },
      );
      groups.forEach((g) => io.observe(g));
      cleanups.push(() => {
        io.disconnect();
        document.documentElement.classList.remove("js-anim");
      });
    }

    const toggle = document.querySelector<HTMLButtonElement>(".menu-toggle");
    const menu = document.getElementById("mobile-menu");
    if (toggle && menu) {
      const setOpen = (open: boolean) => {
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? landing.closeMenu : landing.openMenu);
        menu.hidden = !open;
      };
      const onToggle = () => setOpen(toggle.getAttribute("aria-expanded") !== "true");
      const onMenuClick = (e: MouseEvent) => {
        if ((e.target as Element).closest("a")) setOpen(false);
      };
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape" && !menu.hidden) {
          setOpen(false);
          toggle.focus();
        }
      };
      const onDocClick = (e: MouseEvent) => {
        const target = e.target as Node;
        if (!menu.hidden && !menu.contains(target) && !toggle.contains(target)) setOpen(false);
      };

      toggle.addEventListener("click", onToggle);
      menu.addEventListener("click", onMenuClick);
      document.addEventListener("keydown", onKey);
      document.addEventListener("click", onDocClick);
      cleanups.push(() => {
        toggle.removeEventListener("click", onToggle);
        menu.removeEventListener("click", onMenuClick);
        document.removeEventListener("keydown", onKey);
        document.removeEventListener("click", onDocClick);
      });
    }

    return () => cleanups.forEach((fn) => fn());
  }, [landing]);

  return null;
}
