import { expect, test } from "vitest";
import {
  AccentAtom,
  ThmAtom,
  Atom,
  CharAtom,
  FirstAtom,
  MathGroup,
  LRAtom,
  InlineAtom,
  OverlineAtom,
  SqrtAtom,
  SymAtom,
  DisplayAtom,
  SectionAtom,
} from "../../src/atom/atom";
import { FracAtom } from "../../src/atom/frac";
import { MatrixAtom } from "../../src/atom/matrix";
import { SupSubAtom } from "../../src/atom/supsub";
import { parse, prarseMath } from "../../src/parser/parser";
import { THM_ENV } from "../../src/parser/command";

export const prs = (latex: string, editable = false): Atom =>
  prarseMath(latex, editable)[0];

const a = new CharAtom("a", null);
const j = new SymAtom("ord", "j", "j", ["Math-I"]);
const group = new MathGroup([j]);
test("parse symbol", () => {
  expect(prs("j")).toEqual(j);
});

test("parse accent", () => {
  const accent = new SymAtom("ord", "^", "\\hat", ["Main-R"], {}, false);
  const accAtom = new AccentAtom(group, accent);
  expect(prs("\\hat{j}")).toEqual(accAtom);
  const atom = prs("\\hat{j}", true) as AccentAtom;
  expect(atom.body.body[0]).instanceOf(FirstAtom);
});

test("parse overline", () => {
  expect(prs("\\overline {j}")).toEqual(new OverlineAtom(new MathGroup([j])));
  const atom = prs("\\overline{j}", true) as OverlineAtom;
  expect(atom.body.body[0]).instanceOf(FirstAtom);
});

test("leftright atom", () => {
  expect(prs("\\left(j \\right)")).toEqual(new LRAtom("(", ")", group));
  expect(prs("\\left\\{j\\right\\}")).toEqual(new LRAtom("\\{", "\\}", group));
  expect(prs("\\left|j \\right|")).toEqual(new LRAtom("|", "|", group));
  expect(prs("\\left\\|j \\right\\|")).toEqual(new LRAtom("\\|", "\\|", group));
  expect(prs("\\left<j\\right>")).toEqual(new LRAtom("<", ">", group));

  const atom = prs("\\left(j \\right)", true) as LRAtom;
  expect(atom.body.body[0]).instanceOf(FirstAtom);
});

test("sqrt atom", () => {
  expect(prs("\\sqrt {  j}")).toEqual(new SqrtAtom(group));
  expect(prs("\\sqrt {  }")).toEqual(new SqrtAtom(new MathGroup([])));

  const atom = prs("\\sqrt {  j}", true) as SqrtAtom;
  expect(atom.body.body[0]).instanceOf(FirstAtom);
});

test("frac atom", () => {
  expect(prs("\\frac {  j}{j}")).toEqual(new FracAtom(group, group));
  const atom = prs("\\frac {  j}{j}", true) as FracAtom;
  expect(atom.numer.body[0]).instanceOf(FirstAtom);
  expect(atom.denom.body[0]).instanceOf(FirstAtom);
});

test("supsub atom", () => {
  expect(prs("j_j^j")).toEqual(new SupSubAtom(j, group, group));
  const atom = prs("j_j^j", true) as SupSubAtom;
  expect(atom.sup?.body[0]).instanceOf(FirstAtom);
  expect(atom.sub?.body[0]).instanceOf(FirstAtom);
});

test("matrix atom", () => {
  expect(prs("\\begin{pmatrix}j&j\\\\j \\end{pmatrix}")).toEqual(
    new MatrixAtom([[group, group], [group]], "pmatrix", [])
  );
  const atom = prs(
    "\\begin{pmatrix}j&j\\\\j \\end{pmatrix}",
    true
  ) as MatrixAtom;
  expect(atom.rows[0][0].body[0]).instanceOf(FirstAtom);
});

test("parse inline", () => {
  expect(parse("a$j$a")).toEqual([a, new InlineAtom([j]), a]);
});

test("parse display", () => {
  expect(parse("a\\[j\\]a")).toEqual([
    a,
    new DisplayAtom(new MathGroup([j]), null),
    a,
  ]);
});

test("parse align", () => {
  expect(parse("a\\begin{align}\\label{lab}j\\end{align}a", false)).toEqual([
    a,
    new MatrixAtom([[new MathGroup([j])]], "align", ["lab"]),
    a,
  ]);
});

test("parse theorem", () => {
  expect(parse("a\\begin{theorem}a\\end{theorem}a", false)).toEqual([
    a,
    new ThmAtom([a], THM_ENV["theorem"]),
    a,
  ]);
});

test("parse section", () => {
  expect(parse("a\\section{a}a", false)).toEqual([
    a,
    new SectionAtom([new CharAtom("a", null)], "section"),
    a,
  ]);
});

test("parse text font", () => {
  expect(parse("a\\textbf{a}", false)).toEqual([
    a,
    new CharAtom("a", "Main-B"),
  ]);
});
