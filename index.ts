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

const main = () => {
  const a = new SymAtom("ord", "a", "Math-I");
  const f = new SymAtom("ord", "f", "Math-I");
  const j = new SymAtom("ord", "j", "Math-I");
  const K = new SymAtom("ord", "K", "Math-I");
  const plus = new SymAtom("bin", "+", "Main-R");
  const plusOrd = new SymAtom("ord", "+", "Main-R");
  const eq = new SymAtom("rel", "=", "Main-R");
  const int = new SymAtom("op", "∫", "Size2");
  const sigma = new SymAtom("op", "∑", "Size2");
  const left = new SymAtom("open", "(", "Main-R");
  const right = new SymAtom("open", ")", "Main-R");
  const hat = new SymAtom("ord", "^", "Main-R");
  const tilde = new SymAtom("ord", "~", "Main-R");
  const aHat = new AccentAtom("ord", a, hat);
  const kTilde = new AccentAtom("ord", K, tilde);
  const intHat = new AccentAtom("ord", int, hat);
  const fOverline = new OverlineAtom("ord", f);
  const lr = new LRAtom("inner", left, right, [a, plus, f]);
  const lr2 = new LRAtom("inner", left, right, [int, plusOrd, f]);
  const sqrt = new SqrtAtom("ord", [a]);
  const sqrtK = new SqrtAtom("ord", [K, plus, a]);
  const sqrtInt = new SqrtAtom("ord", [int]);
  const frac = new FracAtom("ord", [a, plus, f], [K, plus, j]);
  const sup = new SupSubAtom("ord", a, [a, j], undefined);
  const sup2 = new SupSubAtom("ord", f, [K], undefined);
  const sub = new SupSubAtom("ord", K, undefined, [a]);
  const sub2 = new SupSubAtom("ord", a, undefined, [f]);
  const supsub = new SupSubAtom("ord", a, [a], [f]);
  const supsub2 = new SupSubAtom("ord", f, [a], [a]);
  const opSupsub = new SupSubAtom("op", sigma, [a], [a]);
  const intSupsub = new SupSubAtom("op", int, [a], [a]);
  const lra = new LRAtom("inner", left, right, [a]);
  const lrsup = new SupSubAtom("inner", lra, [a], undefined);
  const lrsub = new SupSubAtom("inner", lra, undefined, [a]);
  const lrsupsub = new SupSubAtom("inner", lra, [a], [a]);
  const matrix = new MatrixAtom("ord", [
    [a, a],
    [a, a],
  ]);
  const matrix2 = new MatrixAtom("ord", [[a], [a, a]]);
  const pMatrix = new LRAtom("inner", left, right, [matrix]);
  const pMatrix2 = new LRAtom("inner", left, right, [matrix2]);

  render(
    "sym",
    "Symbols",
    "a+f=\\int",
    parseAtoms([a, plus, f, eq, int]).toHtml()
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
