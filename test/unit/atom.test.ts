import { expect, test } from "vitest";
import {
  AccentAtom,
  LRAtom,
  OverlineAtom,
  SqrtAtom,
  SymAtom,
} from "/src/atom/atom";
import { FracAtom } from "/src/atom/frac";
import { MatrixAtom } from "/src/atom/matrix";
import { SupSubAtom } from "/src/atom/supsub";

const j = new SymAtom("ord", "j", "Math-I");
const left = new SymAtom("open", "(", "Main-R");
const right = new SymAtom("open", ")", "Main-R");

test("symbol atom", () => {
  expect(j.parse()).toMatchObject({
    char: "j",
    font: "Math-I",
    depth: 0.19444,
    height: 0.65952,
    width: 0.41181 + 0.05724,
  });
});

test("accent atom", () => {
  const accent = new SymAtom("ord", "^", "Main-R");
  const accAtom = new AccentAtom("ord", j, accent);
  expect(accAtom.parse()).matchSnapshot();
});

test("overline atom", () => {
  expect(new OverlineAtom("ord", j).parse()).matchSnapshot();
});

test("leftright atom", () => {
  expect(new LRAtom("inner", left, right, [j]).parse()).matchSnapshot();
});

test("sqrt atom", () => {
  expect(new SqrtAtom("ord", [j]).parse()).matchSnapshot();
});

test("frac atom", () => {
  expect(new FracAtom("ord", [j], [j]).parse()).matchSnapshot();
});

test("matrix atom", () => {
  expect(new MatrixAtom("ord", [[j, j], [j]]).parse()).matchSnapshot();
});

test("supsub atom", () => {
  expect(new SupSubAtom("ord", j, [j], [j]).parse()).matchSnapshot();
});
