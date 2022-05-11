import katex from "katex";
import "katex/dist/katex.min.css";
import {
  AccentAtom,
  LRAtom,
  OverlineAtom,
  parseAtoms,
  SqrtAtom,
  SymAtom,
} from "./src/atom/atom";
import { FracAtom } from "./src/atom/frac";
import { MatrixAtom } from "./src/atom/matrix";
import { SupSubAtom } from "./src/atom/supsub";
import { parse } from "./src/parser";

const main = () => {
  const a = new SymAtom("ord", "a", "Math-I");
  const f = new SymAtom("ord", "f", "Math-I");
  const j = new SymAtom("ord", "j", "Math-I");
  const K = new SymAtom("ord", "K", "Math-I");
  const plus = new SymAtom("bin", "+", "Main-R");
  const plusOrd = new SymAtom("ord", "+", "Main-R");
  const int = new SymAtom("op", "∫", "Size2");
  const sigma = new SymAtom("op", "∑", "Size2");
  const hat = new SymAtom("ord", "^", "Main-R");
  const tilde = new SymAtom("ord", "~", "Main-R");
  const aHat = new AccentAtom(a, hat);
  const kTilde = new AccentAtom(K, tilde);
  const intHat = new AccentAtom(int, hat);
  const fOverline = new OverlineAtom(f);
  const lr = new LRAtom("(", ")", [a, plus, f]);
  const lr2 = new LRAtom("(", ")", [int, plusOrd, f]);
  const sqrt = new SqrtAtom([a]);
  const sqrtK = new SqrtAtom([K, plus, a]);
  const sqrtInt = new SqrtAtom([int]);
  const frac = new FracAtom([a, plus, f], [K, plus, j]);
  const sup = new SupSubAtom(a, [a, j], undefined);
  const sup2 = new SupSubAtom(f, [K], undefined);
  const sub = new SupSubAtom(K, undefined, [a]);
  const sub2 = new SupSubAtom(a, undefined, [f]);
  const supsub = new SupSubAtom(a, [a], [f]);
  const supsub2 = new SupSubAtom(f, [a], [a]);
  const opSupsub = new SupSubAtom(sigma, [a], [a]);
  const intSupsub = new SupSubAtom(int, [a], [a]);
  const lra = new LRAtom("(", ")", [a]);
  const lrsup = new SupSubAtom(lra, [a], undefined);
  const lrsub = new SupSubAtom(lra, undefined, [a]);
  const lrsupsub = new SupSubAtom(lra, [a], [a]);
  const matrix = new MatrixAtom([
    [a, a],
    [a, a],
  ]);
  const matrix2 = new MatrixAtom([[a], [a, a]]);
  const pMatrix = new LRAtom("(", ")", [matrix]);
  const pMatrix2 = new LRAtom("(", ")", [matrix2]);

  render(
    "sym",
    "Symbols",
    "a+f=\\int",
    parseAtoms(parse("a+f=\\int")).toHtml()
  );
  render(
    "acc",
    "Accent",
    "\\hat{a} \\overline{f} \\tilde{K} \\hat{\\int}",
    parseAtoms([aHat, fOverline, kTilde, intHat]).toHtml()
  );
  render(
    "lr",
    "Left Right Parentheses",
    "\\left(a+f\\right) \\left(\\int+f\\right)",
    parseAtoms([lr, lr2]).toHtml()
  );
  render("frac", "Frac", "\\frac{a+f}{K+j}", parseAtoms([frac]).toHtml());
  render(
    "sqrt",
    "Square Root",
    "\\sqrt{a} \\sqrt{K+a} \\sqrt{\\int} ",
    parseAtoms([sqrt, sqrtK, sqrtInt]).toHtml()
  );
  render(
    "supsub",
    "Superscript Subscript",
    "a^{aj} f^K K_a a_f a_f^a f^a_a",
    parseAtoms([sup, sup2, sub, sub2, supsub, supsub2]).toHtml()
  );

  render(
    "supsub2",
    "Superscript Subscript special",
    "\\left(a\\right)^a \\left(a\\right)_a \\left(a\\right)^a_a \\sum_a^a \\int_a^a",
    parseAtoms([lrsup, lrsub, lrsupsub, opSupsub, intSupsub]).toHtml()
  );
  render(
    "mat",
    "Matrix",
    String.raw`\begin{pmatrix}a&a\\a&a\end{pmatrix} \begin{pmatrix}a\\a&a\end{pmatrix}`,
    parseAtoms([pMatrix, pMatrix2]).toHtml()
  );
};
const render = (
  id: string,
  title: string,
  latex: string,
  result?: HTMLElement
) => {
  const main = document.getElementById("main");
  const h1 = document.createElement("h1");
  h1.innerText = title;
  const line = document.createElement("span");
  line.classList.add("ruler");
  line.id = id;
  main && main.append(h1, line);
  katex.render(latex, line, { displayMode: true });
  if (result) {
    line.append(result);
  }
};

main();
