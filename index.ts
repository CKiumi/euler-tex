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
const main = () => {
  const a: SymAtom = { char: "a", font: "Math-I", kind: "ord", type: "sym" };
  const f: SymAtom = { char: "f", font: "Math-I", kind: "ord", type: "sym" };
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
  const sqrtK: SqrtAtom = { body: [K], type: "sqrt", kind: "ord" };
  const fOverline: OverlineAtom = { body: f, kind: "ord", type: "overline" };
  render("Symbols", "a+f=\\int", buildBox(parseAtoms([a, plus, f, eq, int])));
  render(
    "Accent",
    "\\hat{a} \\overline{f} \\tilde{K} \\hat{\\int}",
    // buildVBox(parseAccentAtom(aHat)),
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
  render(
    "Left Right Parentheses",
    "\\left(a+f\\right) \\left(\\int+f\\right)",
    buildBox(parseAtoms([lr, lr2]))
  );
  render(
    "Square Root",
    "\\sqrt{a} \\sqrt{K} \\sqrt{\\int} ",
    buildBox(parseAtoms([a, sqrt, sqrtK]))
  );
  render("Superscript Subscript", "x^a f^G K_s s_f x_a^b \\sum_x^y \\int_x^y");
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
