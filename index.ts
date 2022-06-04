import { loadFont } from "./src/font";
import katex from "katex";
import "katex/dist/katex.min.css";
import { latexToHtml } from "./src/lib";
import { LETTER1, LETTER2 } from "./src/parser/command";

const main = () => {
  loadFont("/woff");
  const letter1 = Object.keys(LETTER1).join("");
  render("letter1", "Letter 1", letter1, latexToHtml(letter1));
  const letter2 = Object.keys(LETTER2).join("");
  render("letter2", "Letter 2", letter2, latexToHtml(letter2));
  const sym = "a+f=\\int";
  render("sym", "Symbols", sym, latexToHtml(sym));
  const accent = "\\hat{a} \\overline{f} \\tilde{K} \\hat{\\int}";
  render("acc", "Accent", accent, latexToHtml(accent));
  const lr = "\\left(a+f\\right) \\left(\\int+f\\right)";
  render("lr", "Left Right Parentheses", lr, latexToHtml(lr));
  const frac = "\\frac{a+f}{K+j}";
  render("frac", "Frac", frac, latexToHtml(frac));
  const sqr =
    "\\sqrt{ } a \\sqrt{ \\hat{a}}\\sqrt{a} \\sqrt{K+a} \\sqrt{\\int} ";
  render("sqrt", "Square Root", sqr, latexToHtml(sqr));
  const supsub1 = "a^{aj} f^K K_a a_f a_f^a f^a_a";
  render("supsub", "SupSub1", supsub1, latexToHtml(supsub1));
  const supsub2 = "\\left(a\\right)^a \\left(a\\right)_a \\left(a\\right)^a_a";
  render("supsub2", "SupSub2", supsub2, latexToHtml(supsub2));
  const supsub3 = "\\sum_a^a \\int_a^a \\sum^a \\int^a \\int_a";
  render("supsub3", "SupSub3", supsub3, latexToHtml(supsub3));
  const matrix = String.raw`\begin{pmatrix}a&a\\a&a\end{pmatrix} \begin{pmatrix}a\\a&a\end{pmatrix} \begin{pmatrix}&\\&a\end{pmatrix} \begin{pmatrix}a&&a\\&a\\a&&a\end{pmatrix}`;
  render("mat", "Matrix", matrix, latexToHtml(matrix));
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
