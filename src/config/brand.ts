/**
 * Brand values for code that cannot read CSS (PWA manifest, viewport theme colour). Source: the
 * Figma "Colour palette", "Typography" and "Logo" frames. Must match `@theme` in globals.css.
 */
export const brand = {
  colors: {
    white: "#ffffff",
    cream: "#fff8f1",
    peachLight: "#fde0c5",
    peach: "#f2b48c",
    terracotta: "#c96f4a",
    /** Accent for text and filled buttons: meets WCAG AA on cream and with white text. */
    terracottaDeep: "#a65434",
    apricot: "#ffd4ac",
    clay: "#de8965",
    ink: "#1f1a17",
  },
  /** Logo tile gradient, top to bottom. */
  logoGradient: ["#ffd4ac", "#de8965"] as const,
  fonts: {
    display: "Prata",
    sans: "Inter",
  },
  /** Pixel sizes from Figma, desktop / mobile. */
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
