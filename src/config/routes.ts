export const routes = {
  home: "/",
  app: {
    home: "/aplikacja",
    signIn: "/aplikacja/sign-in",
    signUp: "/aplikacja/sign-up",
    /** Onboarding: a separate flow without the bottom bar. Screen numbers follow scope-mvp.md. */
    onboarding: {
      photo: "/aplikacja/start/zdjecie", // screen 4
      report: "/aplikacja/start/raport", // screen 7
      profile: "/aplikacja/start/profil", // screens 8 and 9
      plan: "/aplikacja/start/plan", // care plan with products, built after the form
      paywall: "/aplikacja/start/paywall", // screen 10
    },
    /** Tabs after onboarding. */
    today: "/aplikacja/dzis",
    plan: "/aplikacja/plan",
    profile: "/aplikacja/profil",
    skinProfile: "/aplikacja/profil/skora", // screens 8 and 9 as one edit form
  },
} as const;
