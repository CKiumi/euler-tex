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
} from "../../src/lib";
import { Options } from "../../src/box/style";
const ops = new Options();
const j = new SymAtom("ord", "j", ["Math-I"]);
const group = new GroupAtom([j]);
test("symbol atom", () => {
  expect(j.toBox()).toMatchObject({
    char: "j",
    font: "Math-I",
    rect: { depth: 0.19444, height: 0.65952, width: 0.41181 + 0.05724 },
  });
});

test("accent atom", () => {
  const accent = new SymAtom("ord", "^", ["Main-R"]);
  const accAtom = new AccentAtom(group, accent);
  expect(accAtom.toBox(ops)).matchSnapshot();
});

test("overline atom", () => {
  expect(new OverlineAtom(group).toBox(ops)).matchSnapshot();
});

test("leftright atom", () => {
  expect(new LRAtom("(", ")", group).toBox(ops)).matchSnapshot();
});

test("sqrt atom", () => {
  expect(new SqrtAtom(group).toBox(ops)).matchSnapshot();
  expect(new SqrtAtom(new GroupAtom([])).toBox(ops)).matchSnapshot();
});

test("frac atom", () => {
  expect(
    new FracAtom(new GroupAtom([j]), new GroupAtom([j])).toBox(ops)
  ).matchSnapshot();
});

test("matrix atom", () => {
  expect(
    new MatrixAtom([[group, group], [group]], "pmatrix").toBox(ops)
  ).matchSnapshot();
});

test("supsub atom", () => {
  expect(new SupSubAtom(j, group, group).toBox()).matchSnapshot();
});
