import { test, expect } from "@playwright/test";
const url = "http://localhost:5173";
test("main", async ({ page }) => {
  await page.goto(url);
  expect(await page.locator("#" + "mathfont").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });

  expect(await page.locator("#" + "acc").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });

  expect(await page.locator("#" + "sqrt").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });

  expect(await page.locator("#" + "sqrtinline").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });
});

test("frac", async ({ page }) => {
  await page.goto(url + "/frac");

  expect(await page.locator("#" + "frac").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });

  expect(await page.locator("#" + "fracinline").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });
});

test("lr", async ({ page }) => {
  await page.goto(url + "/lr");

  expect(await page.locator("#" + "lr").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });

  expect(await page.locator("#" + "lrinline").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });

  expect(await page.locator("#" + "lr2").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });

  expect(await page.locator("#" + "lr2inline").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });

  expect(await page.locator("#" + "braket").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });
});

test("mat", async ({ page }) => {
  await page.goto(url + "/matrix");
  expect(await page.locator("#" + "mat1").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });
  expect(await page.locator("#" + "mat2").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });
  expect(await page.locator("#" + "mat3").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });
});

test("supsub", async ({ page }) => {
  await page.goto(url + "/supsub");
  expect(await page.locator("#" + "supsub").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });
  expect(await page.locator("#" + "supsub2").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });
  expect(await page.locator("#" + "supsub3").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });
  expect(
    await page.locator("#" + "supsub3inline").screenshot()
  ).toMatchSnapshot({
    threshold: 0.01,
  });
});

test("env", async ({ page }) => {
  await page.goto(url + "/env");
  expect(await page.locator("#" + "env1").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });
  expect(await page.locator("#" + "env1inline").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });
  expect(await page.locator("#" + "env2").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });
});

test("article", async ({ page }) => {
  await page.goto(url + "/article");
  expect(await page.locator("#" + "article").screenshot()).toMatchSnapshot({
    threshold: 0.01,
  });
});
