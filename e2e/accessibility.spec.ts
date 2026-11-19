import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { mockModelRoutes, seedReport, signUp, subscribe } from "./fixtures";

/** WCAG 2.1 level A and AA rules only, which is the conformance target. */
const WCAG_21_AA = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

/**
 * Checks the page at rest: titles of client-side navigations are set, and the landing's
 * scroll-reveal is off (reduced motion), so contrast is measured on the final colours.
 */
async function expectNoViolations(page: Page) {
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveTitle(/\S/);
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_21_AA).analyze();
  expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
}

test.describe("REQ-A11Y-01 every screen meets WCAG 2.1 AA (automated rules)", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("public screens", async ({ page }) => {
    for (const path of ["/", "/app", "/app/sign-in", "/app/sign-up", "/app/does-not-exist"]) {
      await page.goto(path);
      await expectNoViolations(page);
    }
  });

  test("onboarding and app screens", async ({ page }) => {
    await mockModelRoutes(page);
    await signUp(page);
    await expectNoViolations(page);
    await seedReport(page);
    for (const path of ["/app/start/report", "/app/start/profile", "/app/start/paywall"]) {
      await page.goto(path);
      await expectNoViolations(page);
    }
    await subscribe(page);
    for (const path of ["/app/start/plan", "/app/today", "/app/plan", "/app/plan?view=diet", "/app/profile", "/app/profile/skin"]) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await expectNoViolations(page);
    }
  });
});

test("REQ-A11Y-02 tabs work from the keyboard and focus stays visible", async ({ page }) => {
  await mockModelRoutes(page);
  await signUp(page);
  await seedReport(page);
  await subscribe(page);
  await page.goto("/app/plan");

  const care = page.getByRole("tab", { name: "Skincare" });
  await care.focus();
  await expect(care).toHaveCSS("outline-style", "solid");
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Diet" })).toBeFocused();
  await expect(page.getByRole("tab", { name: "Diet" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tab", { name: "Skincare" })).toHaveAttribute("tabindex", "-1");
});

test("REQ-A11Y-03 landing has a skip link and declares its language", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await expect(page.locator(".page")).toHaveAttribute("lang", "en");
});

test("REQ-A11Y-04 a failed sign-in is announced and tied to the fields", async ({ page }) => {
  await page.goto("/app/sign-in");
  await page.getByLabel("Email").fill("nobody@example.com");
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  const error = page.getByRole("alert").filter({ hasText: "Incorrect email or password." });
  await expect(error).toBeVisible();
  const errorId = await error.getAttribute("id");
  await expect(page.getByLabel("Email")).toHaveAttribute("aria-describedby", errorId ?? "");
  await expect(page.getByLabel("Email")).toHaveAttribute("aria-invalid", "true");
});
