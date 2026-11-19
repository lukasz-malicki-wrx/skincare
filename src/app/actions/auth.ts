"use server";

import { LibsqlError } from "@libsql/client";
import { redirect } from "next/navigation";
import {
  authenticate,
  createSession,
  createUser,
  destroySession,
  findUserByEmail,
  getSessionUser,
} from "@/lib/auth";
import { routes } from "@/config/routes";
import { getTranslations } from "@/i18n/locale";
import { auditEvent } from "@/lib/audit";
import { recordAuditEvent } from "@/lib/audit-store";
import { isValidEmail } from "@/lib/email";
import { MIN_PASSWORD_LENGTH } from "@/lib/password";

export type AuthFormState = { error: string } | null;

function isUniqueEmailError(error: unknown) {
  return (
    error instanceof LibsqlError &&
    error.code === "SQLITE_CONSTRAINT" &&
    error.message.includes("UNIQUE constraint failed: users.email")
  );
}

export async function signUp(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const t = await getTranslations();
  if (!name) return { error: t.errors.nameRequired };
  if (!isValidEmail(email)) return { error: t.errors.email };
  if (password.length < MIN_PASSWORD_LENGTH) return { error: t.errors.password };

  let userId: number;
  try {
    userId = await createUser({ name, email, password });
  } catch (error) {
    if (isUniqueEmailError(error)) return { error: t.errors.emailTaken };
    throw error;
  }

  await recordAuditEvent(auditEvent("auth.sign_up", userId));
  await createSession(userId);
  redirect(routes.app.onboarding.photo);
}

export async function signIn(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const user = await authenticate(email, password);

  const t = await getTranslations();
  if (!user) {
    const known = await findUserByEmail(email);
    await recordAuditEvent(auditEvent("auth.sign_in_failed", known?.id ?? null, { knownAccount: Boolean(known) }));
    return { error: t.errors.invalidCredentials };
  }

  await recordAuditEvent(auditEvent("auth.sign_in", user.id));
  await createSession(user.id);
  redirect(routes.app.today);
}

export async function signOut() {
  const user = await getSessionUser();
  if (user) await recordAuditEvent(auditEvent("auth.sign_out", user.id));
  await destroySession();
  redirect(routes.app.home);
}
