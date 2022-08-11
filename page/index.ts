/* eslint-disable @typescript-eslint/no-non-null-assertion */
import katex from "katex";
import "katex/dist/katex.min.css";
import "../css/eulertex.css";
import "../css/font.css";
import { loadFont } from "../src/font";
import { MathLatexToHtml } from "../src/lib";
import {
  ACC,
  AMS_ARROW,
  AMS_BIN,
  AMS_MISC,
  AMS_NBIN,
  AMS_REL,
  ARROW,
  BIN,
  LETTER1,
  LETTER2,
  MISC,
  OP,
  REL,
} from "../src/parser/command";
import fontDir from "../woff/Math-I.woff2";

const main = () => {
  loadFont(fontDir.split("/").slice(0, -1).join("/"));
  const mathfont =
    "\\mathbb{aABCZ\\mathcal{Z}\\mathcal{HZ}}\\mathfrak{RI}\\Re\\Im";
  render("mathfont", "Font command", mathfont);
  const lr =
    "[\\{(|x|)\\}]\\left(\\sum^{\\sum}_{\\sum}\\right) \\left\\{\\sum^{\\sum}_{\\sum}\\right\\} \\left[\\sum^{\\sum}_{\\sum}\\right] \\left|\\sum^{\\sum}_{\\sum}\\right| \\left\\|\\sum^{\\sum}_{\\sum}\\right\\|\\left<\\sum^{\\sum}_{\\sum}\\right>";
  render("lr", "Left Right Parentheses", lr);
  const frac = "\\frac{a+f}{K+j} \\frac{\\sqrt{a}}{\\sqrt{a}}";
  render("frac", "Frac", frac);
  const sqr =
    "\\sqrt{ } a \\sqrt{ \\hat{a}}\\sqrt{a} \\sqrt{K+a} \\sqrt{\\int} \\sqrt{\\sqrt{a}}";
  render("sqrt", "Square Root", sqr);
  const supsub1 =
    "a^{aj} f^K K_a a_f a_f^a f^a_a f^{j^{j^{j}}} f_{j_{j_{j}}} f^{j^{j^{j}}}_{j_{j_{j}}}";
  render("supsub", "SupSub1", supsub1);
  const supsub2 = "\\left(a\\right)^a \\left(a\\right)_a \\left(a\\right)^a_a";
  render("supsub2", "SupSub2", supsub2);
  const supsub3 = "\\sum_a^a \\int_a^a \\sum^a \\int^a \\int_a ";
  render("supsub3", "SupSub3", supsub3);
  const env = String.raw`\begin{aligned}x&=a+b\\&=c+d\end{aligned}, k=\begin{cases}x&a+b\\y&c+d\end{cases}`;
  render("env", "Environment", env);
};

const render = (id: string, title: string, latex: string) => {
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
  line2.append(MathLatexToHtml(latex));
};

const renderTable = (command: string[], title: string) => {
  const h1 = document.createElement("h1");
  h1.innerText = title;
  const main = document.getElementById("main");
  const tbl = document.createElement("table");
  const r = 5;
  for (let i = 0; i < Math.ceil(command.length / r); i++) {
    const tr = tbl.insertRow();
    for (let j = 0; j < r; j++) {
      const latex = command[i * r + j];
      if (!latex) break;
      const td = tr.insertCell();
      const kat = document.createElement("span");
      const html = MathLatexToHtml(latex);
      html.style.fontSize = "1.2em";
      td.append(
        kat,
        document.createTextNode(" "),
        html,
        document.createTextNode(" " + latex)
      );
      katex.render(latex, kat, { output: "html" });
    }
  }
  main?.append(h1, tbl);
};

const handleLocation = async () => {
  loadFont(fontDir.split("/").slice(0, -1).join("/"));
  // document.getElementById("main").innerHTML = "";
  const path = window.location.pathname;
  if (path === "/") {
    main();
  } else if (path === "/matrix") {
    const matrix1 = String.raw`\begin{bmatrix}a&a\\a&a\end{bmatrix}\begin{Bmatrix}a&a\\a&a\end{Bmatrix}\begin{vmatrix}a&a\\a&a\end{vmatrix}\begin{Vmatrix}a&a\\a&a\end{Vmatrix}`;
    render("mat1", "Matrix", matrix1);
    const matrix2 = String.raw`\begin{pmatrix}a\\a&a\end{pmatrix} \begin{pmatrix}&\\&a\end{pmatrix} \begin{pmatrix}a&&a\\&a\\a&&a\end{pmatrix}`;
    render("mat2", "Matrix", matrix2);
  } else {
    renderTable(Object.keys(LETTER1), "Letter 1");
    renderTable(Object.keys(LETTER2), "Letter 2");
    renderTable(OP, "Op");
    renderTable(
      Object.keys(ACC).map((a) => a + "{a}"),
      "Accent"
    );
    renderTable(Object.keys(MISC), "Ord");
    renderTable(Object.keys(REL), "Rel");
    renderTable(Object.keys(BIN), "Bin");
    renderTable(Object.keys(ARROW), "Bin");
    renderTable(Object.keys(AMS_MISC), "AMS MISC");
    renderTable(Object.keys(AMS_BIN), "AMS BIN");
    renderTable(Object.keys(AMS_NBIN), "AMS NBIN");
    renderTable(Object.keys(AMS_REL), "AMS REL");
    renderTable(Object.keys(AMS_ARROW), "AMS ARROW");
  }
};

window.onpopstate = handleLocation;

handleLocation();
