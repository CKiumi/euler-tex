import katex from "katex";
import "katex/dist/katex.min.css";
import {
  Accent,
  AccentAtom,
  OverlineAtom,
  parseAtoms,
  SymAtom,
} from "./src/atom";
import { buildBox } from "./src/builder";
const main = () => {
  const a: SymAtom = { char: "a", font: "Math-I", kind: "ord", type: "sym" };
  const f: SymAtom = { char: "f", font: "Math-I", kind: "ord", type: "sym" };
  const K: SymAtom = { char: "K", font: "Math-I", kind: "ord", type: "sym" };
  const plus: SymAtom = { char: "+", font: "Main-R", kind: "bin", type: "sym" };
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
  const fOverline: OverlineAtom = { body: f, kind: "ord", type: "overline" };
  render("Symbols", "a+f=\\int", buildBox(parseAtoms([a, plus, f, eq, int])));
  render(
    "Accent",
    "\\hat{a} \\overline{f} \\tilde{K} \\hat{\\int}",
    // buildVBox(parseAccentAtom(aHat)),
    buildBox(parseAtoms([aHat, fOverline, kTilde, intHat]))
  );
  render("Square Root", "\\sqrt{a} \\sqrt{K} \\sqrt{\\int} ");
  render("Left Right Parentheses", "\\left(x+y\\right) \\left(\\int+y\\right)");
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
