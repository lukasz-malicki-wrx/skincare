import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { seedReport, signUp, subscribe } from "./fixtures";

test("REQ-AUTH-01 sign-up creates an account and opens the photo step", async ({ page }) => {
  await signUp(page);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("REQ-AUTH-02 wrong credentials are rejected without saying which one was wrong", async ({ page }) => {
  await page.goto("/app/sign-in");
  await page.getByLabel("Email").fill("nobody@example.com");
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("Incorrect email or password.")).toBeVisible();
  await expect(page).toHaveURL(/\/app\/sign-in$/);
});

test("REQ-DI-01 account events reach the user's audit trail in order", async ({ page }) => {
  await signUp(page);
  await seedReport(page);
  await subscribe(page);
  await page.goto("/app/profile");
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download my data" }).click(),
  ]);
  const exported = JSON.parse(await readFile(await download.path(), "utf8")) as {
    auditTrail: { action: string; occurredAt: string; details: Record<string, unknown> }[];
  };
  const actions = exported.auditTrail.map((event) => event.action);
  expect(actions).toEqual(["auth.sign_up", "subscription.changed"]);
  expect(exported.auditTrail[1].details).toMatchObject({ fromStatus: "none", toStatus: "active", reason: "checkout" });
  for (const event of exported.auditTrail) expect(Number.isNaN(Date.parse(event.occurredAt))).toBe(false);
});

test("REQ-DI-05 a user can delete their account, after which it no longer signs in", async ({ page }) => {
  await page.goto("/app/sign-up");
  const email = await page.getByLabel("Email").inputValue();
  const password = await page.getByLabel("Password").inputValue();
  await page.getByRole("button", { name: "Sign up" }).click();
  await expect(page).toHaveURL(/\/app\/start\/photo$/);

  await page.goto("/app/profile");
  await page.getByRole("button", { name: "Delete my account" }).click();
  await page.getByRole("button", { name: /Yes, delete/ }).click();
  await expect(page).toHaveURL(/\/$/);

  await page.goto("/app/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("Incorrect email or password.")).toBeVisible();
});

test("REQ-ERR-01 an unknown address shows a not-found page with a way back", async ({ page }) => {
  const response = await page.goto("/app/does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to the app" })).toBeVisible();
});

test("REQ-MIG-01 old Polish addresses redirect permanently to the English ones", async ({ request }) => {
  const cases: Array<[string, string]> = [
    ["/aplikacja", "/app"],
    ["/aplikacja/dzis", "/app/today"],
    ["/aplikacja/profil/skora", "/app/profile/skin"],
    ["/aplikacja/start/zdjecie", "/app/start/photo"],
  ];
  for (const [from, to] of cases) {
    const response = await request.get(from, { maxRedirects: 0 });
    expect(response.status(), from).toBe(308);
    expect(new URL(response.headers().location, "http://x").pathname, from).toBe(to);
  }
});
