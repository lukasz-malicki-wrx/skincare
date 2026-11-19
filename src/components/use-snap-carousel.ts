"use client";

import { useCallback, useRef, useState } from "react";

/** Horizontal scroll-snap carousel: native swipe on mobile, buttons and dots on top. */
export function useSnapCarousel(count: number) {
  const trackRef = useRef<HTMLOListElement>(null);
  const [index, setIndex] = useState(0);

  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }, []);

  const goTo = useCallback(
    (next: number) => {
      const el = trackRef.current;
      if (!el) return;
      const clamped = Math.max(0, Math.min(count - 1, next));
      el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
    },
    [count],
  );

  return { trackRef, index, onScroll, goTo };
}
