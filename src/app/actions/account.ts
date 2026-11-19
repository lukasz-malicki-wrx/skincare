"use server";

import { redirect } from "next/navigation";
import { routes } from "@/config/routes";
import { destroySession, requireSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { deleteSubscription } from "@/lib/subscription";

/** Really deletes the user's rows (sessions, subscription, user), then signs out. */
export async function deleteAccountAction() {
  const user = await requireSessionUser();
  const db = await getDb();
  await deleteSubscription(user.id);
  await db.execute({ sql: "DELETE FROM sessions WHERE user_id = ?", args: [user.id] });
  await db.execute({ sql: "DELETE FROM users WHERE id = ?", args: [user.id] });
  await destroySession();
  redirect(routes.home);
}
