import { test, expect } from "@playwright/test";

test("main", async ({ page }) => {
  await page.goto("http://localhost:3000");
  expect(await page.locator("#" + "mathfont").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });
  expect(await page.locator("#" + "lr").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });
  expect(await page.locator("#" + "frac").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });
  expect(await page.locator("#" + "sqrt").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });
  expect(await page.locator("#" + "supsub").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });
  expect(await page.locator("#" + "supsub2").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });
  expect(await page.locator("#" + "supsub3").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });
});

test("mat", async ({ page }) => {
  await page.goto("http://localhost:3000/matrix");
  expect(await page.locator("#" + "mat1").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });
  expect(await page.locator("#" + "mat2").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });
});
