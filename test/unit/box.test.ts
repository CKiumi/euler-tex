import { tests } from "/src/lib";
import { expect, test } from "vitest";

test("first", () => {
  expect(tests()).matchSnapshot();
});
