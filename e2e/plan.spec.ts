import { expect, test } from "@playwright/test";
import { mockModelRoutes, seedReport, signUp, subscribe } from "./fixtures";

test.beforeEach(async ({ page }) => {
  await mockModelRoutes(page);
  await signUp(page);
  await seedReport(page);
});

test("REQ-SUB-01 the plan stays locked until the checkout, which unlocks it", async ({ page }) => {
  await page.goto("/app/plan");
  await expect(page.getByRole("link", { name: "Unlock the plan" })).toBeVisible();
  await subscribe(page);
  await page.goto("/app/plan");
  await expect(page.getByRole("tab", { name: "Skincare" })).toBeVisible();
});

test("REQ-PLAN-01 the selected view and period survive a reload", async ({ page }) => {
  await subscribe(page);
  await page.goto("/app/plan?period=evening");
  await expect(page.getByRole("tab", { name: "Evening" })).toHaveAttribute("aria-selected", "true");
  await page.getByRole("tab", { name: "Diet" }).click();
  await expect(page).toHaveURL(/view=diet/);
  await page.reload();
  await expect(page.getByRole("tab", { name: "Diet" })).toHaveAttribute("aria-selected", "true");
});

test("REQ-PLAN-02 a product can be swapped and the swap undone", async ({ page }) => {
  await subscribe(page);
  await page.goto("/app/plan");
  const firstStep = page.getByRole("tabpanel").getByRole("listitem").first();
  const before = await firstStep.textContent();
  await firstStep.getByRole("button", { name: "Swap" }).click();
  await expect(firstStep).not.toHaveText(before ?? "");
  await firstStep.getByRole("button", { name: "Undo" }).click();
  await expect(firstStep).toHaveText(before ?? "");
});

test("REQ-PLAN-03 product details open in a dialog that Escape closes", async ({ page }) => {
  await subscribe(page);
  await page.goto("/app/plan");
  await page.locator('button[aria-haspopup="dialog"]').first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});

test("REQ-PERF-01 the diet tab and the product dialog load on demand", async ({ page }) => {
  await subscribe(page);
  const chunks: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/_next/static/chunks/")) chunks.push(request.url());
  });
  await page.goto("/app/plan");
  await page.waitForLoadState("networkidle");
  const initial = chunks.length;
  await page.locator('button[aria-haspopup="dialog"]').first().hover();
  await expect.poll(() => chunks.length).toBeGreaterThan(initial);
  const afterDialog = chunks.length;
  await page.getByRole("tab", { name: "Diet" }).click();
  await expect(page.getByText("Salmon")).toBeVisible();
  expect(chunks.length).toBeGreaterThan(afterDialog);
});
