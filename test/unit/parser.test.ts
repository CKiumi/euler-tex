import { expect, test } from "vitest";
import {
  AccentAtom,
  FirstAtom,
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
  expect(parse("j")[0]).toEqual(j);
});

test("parse accent", () => {
  const accent = new SymAtom("ord", "^", "Main-R", false);
  const accAtom = new AccentAtom(group, accent);
  expect(parse("\\hat{j}")[0]).toEqual(accAtom);

  const atom = parse("\\hat{j}", true)[0] as AccentAtom;
  expect(atom.body.body[0]).instanceOf(FirstAtom);
});

test("parse overline", () => {
  expect(parse("\\overline {j}")[0]).toEqual(
    new OverlineAtom(new GroupAtom([j]))
  );
  const atom = parse("\\overline{j}", true)[0] as OverlineAtom;
  expect(atom.body.body[0]).instanceOf(FirstAtom);
});

test("leftright atom", () => {
  expect(parse("\\left(j \\right)")[0]).toEqual(new LRAtom("(", ")", group));

  const atom = parse("\\left(j \\right)", true)[0] as LRAtom;
  expect(atom.body.body[0]).instanceOf(FirstAtom);
});

test("sqrt atom", () => {
  expect(parse("\\sqrt {  j}")[0]).toEqual(new SqrtAtom(group));
  expect(parse("\\sqrt {  }")[0]).toEqual(new SqrtAtom(new GroupAtom([])));

  const atom = parse("\\sqrt {  j}", true)[0] as SqrtAtom;
  expect(atom.body.body[0]).instanceOf(FirstAtom);
});

test("frac atom", () => {
  expect(parse("\\frac {  j}{j}")[0]).toEqual(new FracAtom(group, group));

  const atom = parse("\\frac {  j}{j}", true)[0] as FracAtom;
  expect(atom.numer.body[0]).instanceOf(FirstAtom);
  expect(atom.denom.body[0]).instanceOf(FirstAtom);
});

test("supsub atom", () => {
  expect(parse("j_j^j")[0]).toEqual(new SupSubAtom(j, group, group));

  const atom = parse("j_j^j", true)[0] as SupSubAtom;
  expect(atom.sup?.body[0]).instanceOf(FirstAtom);
  expect(atom.sub?.body[0]).instanceOf(FirstAtom);
});

test("matrix atom", () => {
  expect(parse("\\begin{pmatrix}j&j\\\\j \\end{pmatrix}")[0]).toEqual(
    new MatrixAtom([[group, group], [group]], "pmatrix")
  );
  const atom = parse(
    "\\begin{pmatrix}j&j\\\\j \\end{pmatrix}",
    true
  )[0] as MatrixAtom;
  expect(atom.children[0][0].body[0]).instanceOf(FirstAtom);
});
