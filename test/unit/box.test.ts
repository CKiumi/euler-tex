import { expect, test } from "vitest";
import { OverlineAtom, parseOverline, SymAtom } from "/src/atom";
import { toHBox, toSymBox } from "/src/box";
import { buildHBox, buildSymBox, buildVBox } from "/src/builder";

test("symbol box", () => {
  const j: SymAtom = { char: "j", font: "Math-I", kind: "ord" };
  expect(toSymBox(j)).toMatchObject({
    char: "j",
    font: "Math-I",
    depth: 0.19444,
    height: 0.65952,
    width: 0.41181 + 0.05724,
  });
  expect(buildSymBox(toSymBox(j))).matchSnapshot();
  const a: SymAtom = { char: "a", font: "Math-I", kind: "ord" };
  const f: SymAtom = { char: "f", font: "Math-I", kind: "ord" };
  const plus: SymAtom = { char: "+", font: "Main-R", kind: "bin" };
  const eq: SymAtom = { char: "=", font: "Main-R", kind: "rel" };
  const int: SymAtom = { char: "∫", font: "Size2", kind: "op" };
  expect(buildHBox(toHBox([a, plus, f, eq, int]))).matchSnapshot();
});

test("accent box", () => {
  const a: SymAtom = { char: "a", font: "Math-I", kind: "ord" };
  // const accent: Accent = { char: "^", font: "Main-R", kind: "ord" };
  // const aHat: AccentAtom = { accent, body: a, kind: "ord" };
  const aOverline: OverlineAtom = { body: a, kind: "ord" };
  expect(buildVBox(parseOverline(aOverline))).matchSnapshot();
});
