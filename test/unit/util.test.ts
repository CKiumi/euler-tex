import { expect, test } from "vitest";
import { em } from "/src/util";

test("em", () => {
  expect(em(0.43056)).toBe("0.4306em");
  expect(em(0.43054)).toBe("0.4305em");
});
