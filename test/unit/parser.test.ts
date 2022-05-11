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
import { parse } from "/src/parser/parser";

const j = new SymAtom("ord", "j", "Math-I");

test("parse symbol", () => {
  expect(parse("j")[0]).toMatchObject(j);
});

test("parse accent", () => {
  const accent = new SymAtom("ord", "^", "Main-R");
  const accAtom = new AccentAtom([j], accent);
  expect(parse("\\hat{j}")[0]).toMatchObject(accAtom);
});

test("parse overline", () => {
  expect(parse("\\overline {j}")[0]).toMatchObject(new OverlineAtom([j]));
});

test("leftright atom", () => {
  expect(parse("\\left(j \\right)")[0]).toMatchObject(
    new LRAtom("(", ")", [j])
  );
});

test("sqrt atom", () => {
  expect(parse("\\sqrt {  j}")[0]).toMatchObject(new SqrtAtom([j]));
});

test("frac atom", () => {
  expect(parse("\\frac {  j}{j}")[0]).toMatchObject(new FracAtom([j], [j]));
});

test("supsub atom", () => {
  expect(parse("j_j^j")[0]).toMatchObject(new SupSubAtom(j, [j], [j]));
});

test("matrix atom", () => {
  expect(parse("\\begin{pmatrix}j&j\\\\j \\end{pmatrix}")[0]).toMatchObject(
    new LRAtom("(", ")", [new MatrixAtom([[[j], [j]], [[j]]])])
  );
});
