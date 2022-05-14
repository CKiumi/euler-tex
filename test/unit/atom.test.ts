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
  GroupAtom,
} from "/src/lib";

const j = new SymAtom("ord", "j", "Math-I");
const group = new GroupAtom([j]);
test("symbol atom", () => {
  expect(j.toBox()).toMatchObject({
    char: "j",
    font: "Math-I",
    rect: { depth: 0.19444, height: 0.65952, width: 0.41181 + 0.05724 },
  });
});

test("accent atom", () => {
  const accent = new SymAtom("ord", "^", "Main-R");
  const accAtom = new AccentAtom(group, accent);
  expect(accAtom.toBox()).matchSnapshot();
});

test("overline atom", () => {
  expect(new OverlineAtom(group).toBox()).matchSnapshot();
});

test("leftright atom", () => {
  expect(new LRAtom("(", ")", group).toBox()).matchSnapshot();
});

test("sqrt atom", () => {
  expect(new SqrtAtom(group).toBox()).matchSnapshot();
});

test("frac atom", () => {
  expect(
    new FracAtom(new GroupAtom([j]), new GroupAtom([j])).toBox()
  ).matchSnapshot();
});

test("matrix atom", () => {
  expect(new MatrixAtom([[group, group], [group]]).toBox()).matchSnapshot();
});

test("supsub atom", () => {
  expect(new SupSubAtom(j, group, group).toBox()).matchSnapshot();
});
