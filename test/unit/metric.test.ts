import { getCharMetrics } from "../../src/lib";
import { expect, test } from "vitest";

test("getCharMetrics", () => {
  expect(getCharMetrics("a", ["Main-I", "Math-I"])).toEqual({
    font: "Math-I",
    depth: 0,
    height: 0.43056,
    italic: 0,
    skew: 0,
    width: 0.52859,
  });

  expect(getCharMetrics("∫", ["Size2", "Math-I"])).toEqual({
    font: "Size2",
    depth: 0.86225,
    height: 1.36,
    italic: 0.44445,
    skew: 0,
    width: 0.55556,
  });
});
