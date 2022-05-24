import { expect, test } from "vitest";
import {
  AccentAtom,
  GroupAtom,
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
const group = new GroupAtom([j]);
test("parse symbol", () => {
  expect(parse("j")[0]).toMatchObject(j);
});

test("parse accent", () => {
  const accent = new SymAtom("ord", "^", "Main-R", false);
  const accAtom = new AccentAtom(group, accent);
  expect(parse("\\hat{j}")[0]).toMatchObject(accAtom);
});

test("parse overline", () => {
  expect(parse("\\overline {j}")[0]).toMatchObject(
    new OverlineAtom(new GroupAtom([j]))
  );
});

test("leftright atom", () => {
  expect(parse("\\left(j \\right)")[0]).toMatchObject(
    new LRAtom("(", ")", group)
  );
});

test("sqrt atom", () => {
  expect(parse("\\sqrt {  j}")[0]).toMatchObject(new SqrtAtom(group));
  expect(parse("\\sqrt {  }")[0]).toMatchObject(
    new SqrtAtom(new GroupAtom([]))
  );
});

test("frac atom", () => {
  expect(parse("\\frac {  j}{j}")[0]).toMatchObject(new FracAtom(group, group));
});

test("supsub atom", () => {
  expect(parse("j_j^j")[0]).toMatchObject(new SupSubAtom(j, group, group));
});

test("matrix atom", () => {
  expect(parse("\\begin{pmatrix}j&j\\\\j \\end{pmatrix}")[0]).toMatchObject(
    new MatrixAtom([[group, group], [group]], "pmatrix")
  );
});
