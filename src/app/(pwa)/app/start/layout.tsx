import { requireSessionUser } from "@/lib/auth";

/** Onboarding: no bottom navigation, so the user cannot wander off (docs/scope-mvp.md, section 4). */
export default async function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireSessionUser();

  return <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pt-3 pb-6">{children}</main>;
}
