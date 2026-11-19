export const routes = {
  home: "/",
  app: {
    home: "/app",
    signIn: "/app/sign-in",
    signUp: "/app/sign-up",
    /** Onboarding: a separate flow without the bottom bar. */
    onboarding: {
      photo: "/app/start/photo",
      report: "/app/start/report",
      profile: "/app/start/profile",
      plan: "/app/start/plan",
      paywall: "/app/start/paywall",
    },
    today: "/app/today",
    plan: "/app/plan",
    profile: "/app/profile",
    skinProfile: "/app/profile/skin",
  },
} as const;
