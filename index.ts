/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { loadFont } from "./src/font";
import katex from "katex";
import "katex/dist/katex.min.css";
import {
  FirstBox,
  HBox,
  latexToEditableAtom,
  LatexToHtml,
  MathLatexToHtml,
  SymBox,
  VBox,
} from "./src/lib";
import { LETTER1, LETTER2 } from "./src/parser/command";

const main = () => {
  loadFont("/woff");
  const letter1 = Object.keys(LETTER1).join("");
  render("letter1", "Letter 1", letter1, MathLatexToHtml(letter1));
  const letter2 = Object.keys(LETTER2).join("");
  render("letter2", "Letter 2", letter2, MathLatexToHtml(letter2));
  const mathfont =
    "\\mathbb{aABCZ\\mathcal{Z}\\mathcal{HZ}}\\mathfrak{RI}\\Re\\Im";
  render("mathfont", "Font command", mathfont, MathLatexToHtml(mathfont));
  const sym = "a+f=\\int";
  render("sym", "Symbols", sym, MathLatexToHtml(sym));
  const op = String.raw`\sin\left(x+y\right)\cos\tan\exp\log`;
  render("op", "Operators", op, MathLatexToHtml(op));
  const accent = "\\hat{a} \\overline{f} \\tilde{K} \\hat{\\int}";
  render("acc", "Accent", accent, MathLatexToHtml(accent));
  const lr = "\\left(a+f\\right) \\left(\\int+f\\right)";
  render("lr", "Left Right Parentheses", lr, MathLatexToHtml(lr));
  const frac = "\\frac{a+f}{K+j} \\frac{\\sqrt{a}}{\\sqrt{a}}";
  render("frac", "Frac", frac, MathLatexToHtml(frac));
  const sqr =
    "\\sqrt{ } a \\sqrt{ \\hat{a}}\\sqrt{a} \\sqrt{K+a} \\sqrt{\\int} \\sqrt{\\sqrt{a}}";
  render("sqrt", "Square Root", sqr, MathLatexToHtml(sqr));
  const supsub1 =
    "a^{aj} f^K K_a a_f a_f^a f^a_a f^{j^{j^{j}}} f_{j_{j_{j}}} f^{j^{j^{j}}}_{j_{j_{j}}}";
  render("supsub", "SupSub1", supsub1, MathLatexToHtml(supsub1));
  const supsub2 = "\\left(a\\right)^a \\left(a\\right)_a \\left(a\\right)^a_a";
  render("supsub2", "SupSub2", supsub2, MathLatexToHtml(supsub2));
  const supsub3 = "\\sum_a^a \\int_a^a \\sum^a \\int^a \\int_a";
  render("supsub3", "SupSub3", supsub3, MathLatexToHtml(supsub3));
  const matrix = String.raw`\begin{pmatrix}a&a\\a&a\end{pmatrix} \begin{pmatrix}a\\a&a\end{pmatrix} \begin{pmatrix}&\\&a\end{pmatrix} \begin{pmatrix}a&&a\\&a\\a&&a\end{pmatrix}`;
  render("mat", "Matrix", matrix, MathLatexToHtml(matrix));
  const editable = String.raw`\sqrt{} a \begin{pmatrix}a&a&a\\&\\a&a&a\end{pmatrix}`;
  render("editable", "Editable", editable, latexToEditableAtom(editable).elem!);
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
  const wrapper = document.createElement("div");
  wrapper.id = id;
  const line1 = document.createElement("div");
  const line2 = document.createElement("div");
  line1.classList.add("ruler");
  line2.classList.add("ruler");
  wrapper.append(line1, line2);
  main && main.append(h1, wrapper);
  katex.render(latex, line1, { displayMode: true });
  if (result) {
    line2.append(result);
  }
};

const blockTest = () => {
  const main = document.getElementById("main");
  const line = document.createElement("span");
  line.classList.add("ruler");
  line.style.lineHeight = "normal";
  line.contentEditable = "true";
  line.append(
    ...LatexToHtml(
      "頂点集合$V$,無向辺の集合を$E$とする\\[\\int \\left(x+y\\right) dx\\]dd\\begin{equation*}bb\\end{equation*}"
    )
  );
  main && main.append(line);
};

const boxTest = () => {
  const main = document.getElementById("main");
  const line = document.createElement("span");
  line.classList.add("ruler");
  line.append(
    new VBox([
      { box: new SymBox("b", ["Math-I"]), shift: 0 },
      { box: new HBox([new FirstBox()]), shift: 0 },
    ]).toHtml(),
    new SymBox("a", ["Math-I"]).toHtml()
  );

  main && main.append(line);
};

main();
boxTest();
blockTest();
