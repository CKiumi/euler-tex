import { tests } from "./../src/main";
import { expect, test } from "vitest";

test("first", () => {
  expect(tests()).matchSnapshot();
});
