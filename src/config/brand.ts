/**
 * Brand w TS, dla miejsc, które nie czytają CSS: manifest PWA, viewport themeColor,
 * canvas, e-maile. Wartości muszą zgadzać się z `@theme` w src/app/globals.css.
 * Źródło: Figma "Untitled", ramki Colour palette, Typography, Logo.
 */
export const brand = {
  colors: {
    white: "#ffffff",
    cream: "#fff8f1",
    peachLight: "#fde0c5",
    peach: "#f2b48c",
    terracotta: "#c96f4a",
    apricot: "#ffd4ac",
    clay: "#de8965",
    ink: "#1f1a17",
  },
  /** Gradient kafelka loga, z góry na dół. */
  logoGradient: ["#ffd4ac", "#de8965"] as const,
  fonts: {
    display: "Prata",
    sans: "Inter",
  },
  /** Skala z Figmy: desktop / mobile, w px. */
  typeScale: {
    bodyLarge: { desktop: 20, mobile: 18 },
    bodyMedium: { desktop: 16, mobile: 16 },
    bodySmall: { desktop: 14, mobile: 14 },
    caption: { desktop: 12, mobile: 12 },
  },
  assets: {
    logoMark: "/brand/logo-mark.jpg",
  },
} as const;
