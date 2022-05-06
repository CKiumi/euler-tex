import { expect, test } from "vitest";
import { SymBox, toHBox, toSymBox } from "/src/box";
import { buildHBox, buildSymBox } from "/src/builder";

test("symbol box", () => {
  expect(toSymBox({ char: "j", font: "Math-I" })).toMatchObject({
    char: "j",
    font: "Math-I",
    depth: 0.19444,
    height: 0.65952,
    width: 0.41181 + 0.05724,
  });
  expect(buildSymBox(toSymBox({ char: "j", font: "Math-I" }))).matchSnapshot();
  const atoms = "abcdefghijk"
    .split("")
    .map((char) => ({ char, font: "Math-I" } as SymBox));
  expect(buildHBox(toHBox(atoms))).matchSnapshot();
});
