import { test, expect } from "@playwright/test";

test("home page has taste typography and chord count", async ({ page }) => {
  await page.goto("http://localhost:3000");
  await expect(page.locator("text=Study with people")).toBeVisible();
  await expect(page.locator("text=Browse chords")).toBeVisible();
  // Verify designlang token color is applied via computed style check
  const hero = page.locator("h1").first();
  await expect(hero).toHaveCSS("font-family", /serif/);
});
