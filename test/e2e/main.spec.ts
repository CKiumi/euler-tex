import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000");
});

test("main", async ({ page }) => {
  expect(await page.locator("#Symbols").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });
});
