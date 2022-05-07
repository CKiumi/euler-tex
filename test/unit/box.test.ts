import { expect, test } from "vitest";
import {
  Accent,
  AccentAtom,
  OverlineAtom,
  parseAtom,
  parseAtoms,
  SymAtom,
} from "/src/atom/atom";
import { SymBox } from "../../src/box/box";
import { buildBox, buildHBox, buildSymBox } from "../../src/html/builder";
import { Atom, LRAtom } from "/src/atom/atom";
import { FracAtom } from "/src/atom/frac";
import { SqrtAtom } from "/src/atom/sqrt";
import { SupSubAtom } from "/src/atom/supsub";
import { MatrixAtom } from "/src/atom/matrix";
const a: SymAtom = { char: "a", font: "Math-I", kind: "ord", type: "sym" };
const f: SymAtom = { char: "f", font: "Math-I", kind: "ord", type: "sym" };
const plus: SymAtom = { char: "+", font: "Main-R", kind: "bin", type: "sym" };
const eq: SymAtom = { char: "=", font: "Main-R", kind: "rel", type: "sym" };
const int: SymAtom = { char: "∫", font: "Size2", kind: "op", type: "sym" };
const j: SymAtom = { char: "j", font: "Math-I", kind: "ord", type: "sym" };
const K: SymAtom = { char: "K", font: "Math-I", kind: "ord", type: "sym" };
const plusOrd: SymAtom = {
  char: "+",
  font: "Main-R",
  kind: "ord",
  type: "sym",
};

const sigma: SymAtom = { char: "∑", font: "Size2", kind: "op", type: "sym" };
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
  accent: hat,
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
const kTilde: AccentAtom = {
  accent: tilde,
  body: K,
  kind: "ord",
  type: "accent",
};
const sqrt: SqrtAtom = { body: [a], type: "sqrt", kind: "ord" };
const sqrtK: SqrtAtom = { body: [K, plus, a], type: "sqrt", kind: "ord" };
const sqrtInt: SqrtAtom = { body: [int], type: "sqrt", kind: "ord" };
const fOverline: OverlineAtom = { body: f, kind: "ord", type: "overline" };
const left: SymAtom = {
  char: "(",
  kind: "open",
  type: "sym",
  font: "Main-R",
};
const right: SymAtom = {
  char: ")",
  kind: "open",
  type: "sym",
  font: "Main-R",
};
const inner: Atom[] = [a, plus, f];
const inner2: Atom[] = [int, plusOrd, f];
const lr: LRAtom = { left, right, body: inner, kind: "inner", type: "lr" };
const lr2: LRAtom = { left, right, body: inner2, kind: "inner", type: "lr" };
const frac: FracAtom = {
  numer: [a, plus, f],
  denom: [K, plus, j],
  kind: "ord",
  type: "frac",
};
const sup: SupSubAtom = {
  sup: [a, j],
  nuc: a,
  kind: "ord",
  type: "supsub",
};
const sup2: SupSubAtom = {
  sup: [K],
  nuc: f,
  kind: "ord",
  type: "supsub",
};
const sub: SupSubAtom = {
  sub: [a],
  nuc: K,
  kind: "ord",
  type: "supsub",
};
const sub2: SupSubAtom = {
  sub: [f],
  nuc: a,
  kind: "ord",
  type: "supsub",
};
const supsub: SupSubAtom = {
  sub: [f],
  sup: [a],
  nuc: a,
  kind: "ord",
  type: "supsub",
};
const supsub2: SupSubAtom = {
  sub: [a],
  sup: [a],
  nuc: f,
  kind: "ord",
  type: "supsub",
};
const opSupsub: SupSubAtom = {
  sub: [a],
  sup: [a],
  nuc: sigma,
  kind: "ord",
  type: "supsub",
};
const intSupsub: SupSubAtom = {
  sub: [a],
  sup: [a],
  nuc: int,
  kind: "ord",
  type: "supsub",
};
const lrsup: SupSubAtom = {
  sup: [a],
  nuc: { left, right, body: [a], kind: "inner", type: "lr" } as Atom,
  kind: "inner",
  type: "supsub",
};
const lrsub: SupSubAtom = {
  sub: [a],
  nuc: { left, right, body: [a], kind: "inner", type: "lr" } as Atom,
  kind: "inner",
  type: "supsub",
};
const lrsupsub: SupSubAtom = {
  sub: [a],
  sup: [a],
  nuc: { left, right, body: [a], kind: "inner", type: "lr" } as Atom,
  kind: "inner",
  type: "supsub",
};

const matrix: MatrixAtom = {
  type: "matrix",
  children: [
    [a, a],
    [a, a],
  ],
  kind: "ord",
};
const matrix2: MatrixAtom = {
  type: "matrix",
  children: [[a], [a, a]],
  kind: "ord",
};
const pMatrix: LRAtom = {
  kind: "inner",
  type: "lr",
  body: [matrix],
  left,
  right,
};
export const pMatrix2: LRAtom = {
  kind: "inner",
  type: "lr",
  body: [matrix2],
  left,
  right,
};

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

  expect(buildHBox(parseAtoms([a, plus, f, eq, int]))).matchSnapshot();
});

test("accent box", () => {
  expect(
    buildBox(parseAtoms([aHat, fOverline, kTilde, intHat]))
  ).matchSnapshot();
});

test("hbox", () => {
  expect(buildBox(parseAtoms([a, plus, f, eq, int]))).matchSnapshot();
});

test("sqrt", () => {
  expect(buildBox(parseAtoms([sqrt, sqrtK, sqrtInt]))).matchSnapshot();
});

test("leftright", () => {
  expect(buildBox(parseAtoms([lr, lr2]))).matchSnapshot();
});

test("frac", () => {
  expect(buildBox(parseAtoms([frac]))).matchSnapshot();
});

test("supsub", () => {
  expect(
    buildBox(parseAtoms([sup, sup2, sub, sub2, supsub, supsub2]))
  ).matchSnapshot();
  expect(
    buildBox(parseAtoms([lrsup, lrsub, lrsupsub, opSupsub, intSupsub]))
  ).matchSnapshot();
});

test("matrix", () => {
  expect(buildBox(parseAtoms([pMatrix, pMatrix2]))).matchSnapshot();
});
