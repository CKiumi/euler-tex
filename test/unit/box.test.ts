import { expect, test } from "vitest";
import { charAtom } from "../../src/atom";
import { buildCharBox } from "/src/builder";

test("symbol box", () => {
  expect(charAtom("j", "Math-I")).toMatchObject({
    char: "j",
    font: "Math-I",
    italic: 0.05724,
    box: { depth: 0.19444, height: 0.65952, width: 0.41181 },
  });
  expect(buildCharBox(charAtom("j", "Math-I"))).matchSnapshot();
});
