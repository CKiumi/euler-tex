import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000");
});

test("main", async ({ page }) => {
  expect(await page.locator("#" + "sym").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });
  expect(await page.locator("#" + "acc").screenshot()).toMatchSnapshot({
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

  expect(await page.locator("#" + "mat").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });
});
