import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { Row } from "@libsql/client";
import { routes } from "@/config/routes";
import { getDb } from "@/lib/db";
import { normalizeEmail } from "@/lib/email";
import { hashPassword, verifyPassword } from "@/lib/password";
import { subscriptionFromValues, type Subscription } from "@/lib/subscription";

const SESSION_COOKIE = "skincare_session";

export type SessionUser = {
  id: number;
  name: string;
  email: string;
};

export type SessionContext = {
  user: SessionUser;
  subscription: Subscription;
};

type UserRow = SessionUser & { password_hash: string };

function textColumn(row: Row, name: string) {
  const value = row[name];
  if (typeof value !== "string") throw new Error(`Expected text in ${name}`);
  return value;
}

function idColumn(row: Row, name: string) {
  const value = row[name];
  if (typeof value !== "number") throw new Error(`Expected id in ${name}`);
  return value;
}

function userFromRow(row: Row): UserRow {
  return {
    id: idColumn(row, "id"),
    name: textColumn(row, "name"),
    email: textColumn(row, "email"),
    password_hash: textColumn(row, "password_hash"),
  };
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
}) {
  const db = await getDb();
  const result = await db.execute({
    sql: "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
    args: [
      input.name.trim(),
      normalizeEmail(input.email),
      hashPassword(input.password),
    ],
  });

  if (result.lastInsertRowid === undefined) {
    throw new Error("Insert did not return a user id");
  }

  return Number(result.lastInsertRowid);
}

export async function findUserByEmail(email: string) {
  const db = await getDb();
  const result = await db.execute({
    sql: "SELECT id, name, email, password_hash FROM users WHERE email = ?",
    args: [normalizeEmail(email)],
  });
  const row = result.rows[0];
  if (!row) return undefined;
  return userFromRow(row);
}

export async function authenticate(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user || !verifyPassword(password, user.password_hash)) return null;
  return { id: user.id, name: user.name, email: user.email };
}

export async function createSession(userId: number) {
  const id = randomBytes(32).toString("hex");
  const db = await getDb();
  await db.execute({
    sql: "INSERT INTO sessions (id, user_id) VALUES (?, ?)",
    args: [id, userId],
  });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const sessionId = jar.get(SESSION_COOKIE)?.value;
  if (sessionId) {
    const db = await getDb();
    await db.execute({
      sql: "DELETE FROM sessions WHERE id = ?",
      args: [sessionId],
    });
  }
  jar.delete(SESSION_COOKIE);
}

/** One round trip for the signed-in user and their subscription. Shared by the layout and the page. */
export const getSessionContext = cache(async (): Promise<SessionContext | null> => {
  const jar = await cookies();
  const sessionId = jar.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const db = await getDb();
  const result = await db.execute({
    sql: `SELECT users.id, users.name, users.email, subscriptions.status, subscriptions.trial_ends_at
       FROM sessions
       JOIN users ON users.id = sessions.user_id
       LEFT JOIN subscriptions ON subscriptions.user_id = users.id
       WHERE sessions.id = ?`,
    args: [sessionId],
  });
  const row = result.rows[0];
  if (!row) return null;

  return {
    user: {
      id: idColumn(row, "id"),
      name: textColumn(row, "name"),
      email: textColumn(row, "email"),
    },
    subscription: subscriptionFromValues(row.status, row.trial_ends_at),
  };
});

export async function getSessionUser() {
  const ctx = await getSessionContext();
  return ctx?.user ?? null;
}

export async function requireSessionContext(): Promise<SessionContext> {
  const ctx = await getSessionContext();
  if (!ctx) redirect(routes.app.home);
  return ctx;
}

export async function requireSessionUser(): Promise<SessionUser> {
  return (await requireSessionContext()).user;
}
