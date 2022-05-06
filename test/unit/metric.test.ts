import { getCharMetrics } from "/font/index";
import { expect, test } from "vitest";

test("getCharMetrics", () => {
  expect(() => {
    getCharMetrics("∫", "Math-I");
  }).toThrow("Font metrics not found for font: Math-I.");

  expect(getCharMetrics("a", "Math-I")).toMatchObject({
    depth: 0,
    height: 0.43056,
    italic: 0,
    skew: 0,
    width: 0.52859,
  });
});
