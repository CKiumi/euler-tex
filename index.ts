import { SqrtAtom } from "./src/atom/sqrt";
import katex from "katex";
import "katex/dist/katex.min.css";
import {
  Accent,
  AccentAtom,
  Atom,
  LRAtom,
  OverlineAtom,
  parseAtoms,
  SymAtom,
} from "./src/atom/atom";
import { buildBox } from "./src/html/builder";
import { FracAtom } from "./src/atom/frac";
import { SupSubAtom } from "./src/atom/supsub";
const main = () => {
  const a: SymAtom = { char: "a", font: "Math-I", kind: "ord", type: "sym" };
  const f: SymAtom = { char: "f", font: "Math-I", kind: "ord", type: "sym" };
  const j: SymAtom = { char: "j", font: "Math-I", kind: "ord", type: "sym" };
  const K: SymAtom = { char: "K", font: "Math-I", kind: "ord", type: "sym" };
  const plus: SymAtom = { char: "+", font: "Main-R", kind: "bin", type: "sym" };
  const plusOrd: SymAtom = {
    char: "+",
    font: "Main-R",
    kind: "ord",
    type: "sym",
  };
  const eq: SymAtom = { char: "=", font: "Main-R", kind: "rel", type: "sym" };
  const int: SymAtom = { char: "∫", font: "Size2", kind: "op", type: "sym" };
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
  render("Symbols", "a+f=\\int", buildBox(parseAtoms([a, plus, f, eq, int])));
  render(
    "Accent",
    "\\hat{a} \\overline{f} \\tilde{K} \\hat{\\int}",
    buildBox(parseAtoms([aHat, fOverline, kTilde, intHat]))
  );
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
  render(
    "Left Right Parentheses",
    "\\left(a+f\\right) \\left(\\int+f\\right)",
    buildBox(parseAtoms([lr, lr2]))
  );
  render("Frac", "\\frac{a+f}{K+j}", buildBox(parseAtoms([frac])));
  render(
    "Square Root",
    "\\sqrt{a} \\sqrt{K+a} \\sqrt{\\int} ",
    buildBox(parseAtoms([sqrt, sqrtK, sqrtInt]))
  );
  render(
    "Superscript Subscript",
    "a^{aj} f^K K_a a_f a_f^a f^a_a",
    buildBox(parseAtoms([sup, sup2, sub, sub2, supsub, supsub2]))
  );
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
  render(
    "Superscript Subscript 2",
    "\\left(a\\right)^a \\left(a\\right)_a \\left(a\\right)^a_a \\sum_a^a \\int_a^a",
    buildBox(parseAtoms([lrsup, lrsub, lrsupsub, opSupsub, intSupsub]))
  );
};
const render = (title: string, latex: string, result?: HTMLElement) => {
  const main = document.getElementById("main");
  const h1 = document.createElement("h1");
  h1.innerText = title;
  const line = document.createElement("span");
  line.classList.add("ruler");
  line.id = title;
  main && main.append(h1, line);
  katex.render(latex, line, { displayMode: true });
  if (result) {
    line.append(result);
  }
};

main();
