"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { routes } from "@/config/routes";
import { requireSessionUser } from "@/lib/auth";
import { advanceSevenDays, cancelSubscription, startTrial } from "@/lib/subscription";

/** Called after the mocked checkout animation; the mock never fails. */
export async function startTrialAction() {
  const user = await requireSessionUser();
  await startTrial(user.id);
  revalidatePath(routes.app.profile);
  revalidatePath(routes.app.plan);
  revalidatePath(routes.app.onboarding.plan);
  redirect(routes.app.onboarding.plan);
}

export async function cancelSubscriptionAction() {
  const user = await requireSessionUser();
  await cancelSubscription(user.id);
  revalidatePath(routes.app.profile);
  revalidatePath(routes.app.plan);
}

/** Hidden demo control: shows the trial rolling into a paid month within one presentation. */
export async function advanceSevenDaysAction() {
  const user = await requireSessionUser();
  await advanceSevenDays(user.id);
  revalidatePath(routes.app.profile);
  revalidatePath(routes.app.plan);
}
