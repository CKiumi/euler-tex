import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3001");
});

test("letter1", async ({ page }) => {
  expect(await page.locator("#" + "letter1").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });
});

test("letter2", async ({ page }) => {
  expect(await page.locator("#" + "letter2").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });
});

test("sym", async ({ page }) => {
  expect(await page.locator("#" + "sym").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });
});

test("accent", async ({ page }) => {
  expect(await page.locator("#" + "acc").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });
});

test("laftright", async ({ page }) => {
  expect(await page.locator("#" + "lr").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });
});

test("frac", async ({ page }) => {
  expect(await page.locator("#" + "frac").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });
});

test("acc", async ({ page }) => {
  expect(await page.locator("#" + "acc").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });
});

test("sqrt", async ({ page }) => {
  expect(await page.locator("#" + "sqrt").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });
});

test("supsub", async ({ page }) => {
  expect(await page.locator("#" + "supsub").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });
});

test("supsub2", async ({ page }) => {
  expect(await page.locator("#" + "supsub2").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });
});

test("supsub3", async ({ page }) => {
  expect(await page.locator("#" + "supsub3").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });
});

test("matrix", async ({ page }) => {
  expect(await page.locator("#" + "mat").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });
});
