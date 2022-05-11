import katex from "katex";
import "katex/dist/katex.min.css";
import { parseAtoms } from "./src/atom/atom";
import { parse } from "./src/parser/parser";

const main = () => {
  const sym = "a+f=\\int";
  render("sym", "Symbols", sym, parseAtoms(parse(sym)).toHtml());
  const accent = "\\hat{a} \\overline{f} \\tilde{K} \\hat{\\int}";
  render("acc", "Accent", accent, parseAtoms(parse(accent)).toHtml());
  const lr = "\\left(a+f\\right) \\left(\\int+f\\right)";
  render("lr", "Left Right Parentheses", lr, parseAtoms(parse(lr)).toHtml());
  const frac = "\\frac{a+f}{K+j}";
  render("frac", "Frac", frac, parseAtoms(parse(frac)).toHtml());
  const sqr = "\\sqrt{a} \\sqrt{K+a} \\sqrt{\\int} ";
  render("sqrt", "Square Root", sqr, parseAtoms(parse(sqr)).toHtml());
  const supsub1 = "a^{aj} f^K K_a a_f a_f^a f^a_a";
  render("supsub", "SupSub", supsub1, parseAtoms(parse(supsub1)).toHtml());
  const supsub2 =
    "\\left(a\\right)^a \\left(a\\right)_a \\left(a\\right)^a_a \\sum_a^a \\int_a^a";
  render("supsub2", "SupSub", supsub2, parseAtoms(parse(supsub2)).toHtml());
  const matrix = String.raw`\begin{pmatrix}a&a\\a&a\end{pmatrix} \begin{pmatrix}a\\a&a\end{pmatrix}`;
  render("mat", "Matrix", matrix, parseAtoms(parse(matrix)).toHtml());
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
