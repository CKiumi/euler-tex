import { expect, test } from "vitest";
import {
  Accent,
  AccentAtom,
  OverlineAtom,
  parseAtom,
  parseAtoms,
  SymAtom,
} from "/src/atom";
import { SymBox } from "/src/box";
import { buildHBox, buildSymBox } from "/src/builder";

test("symbol box", () => {
  const j: SymAtom = { char: "j", font: "Math-I", kind: "ord", type: "sym" };
  expect(parseAtom(j)).toMatchObject({
    char: "j",
    font: "Math-I",
    depth: 0.19444,
    height: 0.65952,
    width: 0.41181 + 0.05724,
  });
  expect(buildSymBox(parseAtom(j) as SymBox)).matchSnapshot();
  const a: SymAtom = { char: "a", font: "Math-I", kind: "ord", type: "sym" };
  const f: SymAtom = { char: "f", font: "Math-I", kind: "ord", type: "sym" };
  const plus: SymAtom = { char: "+", font: "Main-R", kind: "bin", type: "sym" };
  const eq: SymAtom = { char: "=", font: "Main-R", kind: "rel", type: "sym" };
  const int: SymAtom = { char: "∫", font: "Size2", kind: "op", type: "sym" };
  expect(buildHBox(parseAtoms([a, plus, f, eq, int]))).matchSnapshot();
});

test("accent box", () => {
  const a: SymAtom = { char: "a", font: "Math-I", kind: "ord", type: "sym" };
  const int: SymAtom = { char: "∫", font: "Size2", kind: "op", type: "sym" };
  const hat: Accent = {
    char: "^",
    font: "Main-R",
    kind: "ord",
    type: "sym",
  };
  const tilde: Accent = {
    char: "~",
    font: "Main-R",
    kind: "ord",
    type: "sym",
  };
  const aHat: AccentAtom = {
    accent: tilde,
    body: a,
    kind: "ord",
    type: "accent",
  };
  const intHat: AccentAtom = {
    accent: hat,
    body: int,
    kind: "ord",
    type: "accent",
  };
  const aOverline: OverlineAtom = { body: a, kind: "ord", type: "overline" };
  expect(parseAtoms([aHat, aOverline, intHat])).matchSnapshot();
});
