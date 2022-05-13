import { expect, test } from "vitest";
import {
  SupSubAtom,
  MatrixAtom,
  FracAtom,
  AccentAtom,
  LRAtom,
  OverlineAtom,
  SqrtAtom,
  SymAtom,
} from "/src/lib";

const j = new SymAtom("ord", "j", "Math-I");

test("symbol atom", () => {
  expect(j.parse()).toMatchObject({
    char: "j",
    font: "Math-I",
    rect: { depth: 0.19444, height: 0.65952, width: 0.41181 + 0.05724 },
  });
});

test("accent atom", () => {
  const accent = new SymAtom("ord", "^", "Main-R");
  const accAtom = new AccentAtom([j], accent);
  expect(accAtom.parse()).matchSnapshot();
});

test("overline atom", () => {
  expect(new OverlineAtom([j]).parse()).matchSnapshot();
});

test("leftright atom", () => {
  expect(new LRAtom("(", ")", [j]).parse()).matchSnapshot();
});

test("sqrt atom", () => {
  expect(new SqrtAtom([j]).parse()).matchSnapshot();
});

test("frac atom", () => {
  expect(new FracAtom([j], [j]).parse()).matchSnapshot();
});

test("matrix atom", () => {
  expect(new MatrixAtom([[[j], [j]], [[j]]]).parse()).matchSnapshot();
});

test("supsub atom", () => {
  expect(new SupSubAtom(j, [j], [j]).parse()).matchSnapshot();
});
