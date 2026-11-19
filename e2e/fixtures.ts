import { expect, type Page } from "@playwright/test";

const step = (name: string, ingredient: string, why: string) => ({ step: name, ingredient, why });

/** A finished report as the app stores it after both model stages. */
export const STORED_REPORT = {
  createdAt: "2026-11-19T10:00:00.000Z",
  imageDataUrl:
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  routineReady: true,
  result: {
    photo_quality: { ok: true, issue: null },
    body_part: "face",
    skin_type: "combination",
    summary: "Combination skin with a slightly oily T-zone.",
    findings: [
      { name: "blackheads", area: "nose", severity: "low", confidence: 0.8 },
      { name: "enlarged pores", area: "T-zone", severity: "medium", confidence: 0.7 },
    ],
    see_a_doctor: false,
    see_a_doctor_reason: null,
    avoid_ingredients: ["alcohol"],
    routine: {
      morning: [step("Cleanser", "gel cleanser", "Removes sebum."), step("Serum", "niacinamide", "Refines pores.")],
      evening: [step("Cleanser", "gel cleanser", "Washes off SPF."), step("Night cream", "ceramides", "Barrier.")],
    },
    product_queries: [],
    followup_days: 14,
  },
};

export const PROFILE = { skinType: "combination", allergies: ["alcohol"], budgetPln: 200, diet: [] };

export const DIET = {
  plan: {
    eat_more: [
      { item: "Salmon", why: "Omega-3 fats." },
      { item: "Spinach", why: "Antioxidants." },
      { item: "Green tea", why: "Polyphenols." },
    ],
    limit: [
      { item: "Sugary drinks", why: "Spikes." },
      { item: "Skimmed milk", why: "Blackheads." },
      { item: "Fried snacks", why: "Inflammation." },
    ],
  },
};

/** Model routes never reach Anthropic in tests. */
export async function mockModelRoutes(page: Page) {
  await page.route("**/api/diet", (route) => route.fulfill({ json: DIET }));
  await page.route("**/api/products", (route) => route.fulfill({ json: { products: {} } }));
}

/** A fresh account, signed in, sitting on the photo step. */
export async function signUp(page: Page) {
  await page.goto("/app/sign-up");
  await page.getByRole("button", { name: "Sign up" }).click();
  await expect(page).toHaveURL(/\/app\/start\/photo$/);
}

export async function seedReport(page: Page) {
  await page.evaluate(
    ([report, profile]) => {
      localStorage.setItem("pielegnacja:last-analysis", report);
      localStorage.setItem("pielegnacja:profile", profile);
    },
    [JSON.stringify(STORED_REPORT), JSON.stringify(PROFILE)],
  );
}

/** Completes the mocked checkout, which unlocks the plan. */
export async function subscribe(page: Page) {
  await page.goto("/app/start/paywall");
  await page.getByRole("button", { name: /Continue/ }).click();
  await expect(page).not.toHaveURL(/paywall/, { timeout: 15_000 });
}
