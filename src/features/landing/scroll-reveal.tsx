"use client";

import { useEffect } from "react";

/**
 * Scroll reveal for `[data-reveal]` groups: landing.css hides `.reveal` children (and the
 * progress bars) under `.js-anim` until the group gets `.is-in`. Without IntersectionObserver or
 * with reduced motion nothing is hidden. Renders nothing.
 */
export function ScrollReveal() {
  useEffect(() => {
    const groups = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!groups.length || !("IntersectionObserver" in window) || reduce) return;

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

    return () => {
      io.disconnect();
      document.documentElement.classList.remove("js-anim");
    };
  }, []);

  return null;
}
