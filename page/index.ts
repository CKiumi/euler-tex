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
import { html } from "../src/html";
const main = document.getElementById("main") as HTMLElement;

const render = (id: string, title: string, latex: string) => {
  const line1 = html("span", { cls: ["ruler"] });
  katex.render(latex, line1, { displayMode: true, output: "html" });
  const line2 = html("span", {
    cls: ["ruler"],
    children: [MathLatexToHtml(latex)],
  });
  main.append(
    html("h1", { text: title }),
    html("div", { id, children: [line1, line2] })
  );
};

const renderTable = (command: string[], title: string) => {
  const tbl = html("table", {});
  const R = 5;
  for (let i = 0; i < Math.ceil(command.length / R); i++) {
    const tr = tbl.insertRow();
    for (let j = 0; j < R; j++) {
      const latex = command[i * R + j];
      if (!latex) break;
      const td = tr.insertCell();
      const kat = html("span", {});
      katex.render(latex, kat, { output: "html" });
      td.append(
        kat,
        document.createTextNode(" "),
        html("span", {
          children: [MathLatexToHtml(latex)],
          style: { fontSize: "1.2em" },
        }),
        document.createTextNode(" " + latex)
      );
    }
  }
  main?.append(html("h1", { text: title }), tbl);
};

const route: { [key: string]: () => void } = {
  "/": () => {
    const mathfont =
      "\\mathbb{aABCZ\\mathcal{Z}\\mathcal{HZ}}\\mathfrak{RI}\\Re\\Im";
    render("mathfont", "Font command", mathfont);
    const lr =
      "\\left(\\sum^{\\sum}_{\\sum}\\right) \\left\\{\\sum^{\\sum}_{\\sum}\\right\\} \\left[\\sum^{\\sum}_{\\sum}\\right] \\left|\\sum^{\\sum}_{\\sum}\\right| \\left\\|\\sum^{\\sum}_{\\sum}\\right\\|\\left<\\sum^{\\sum}_{\\sum}\\right>";
    render("lr", "Left Right Parentheses", lr);
    const frac = "\\frac{a+f}{K+j} \\frac{\\sqrt{a}}{\\sqrt{a}}";
    render("frac", "Frac", frac);
    const sqr =
      "\\sqrt{ } a \\sqrt{ \\hat{a}}\\sqrt{a} \\sqrt{K+a} \\sqrt{\\int} \\sqrt{\\sqrt{a}}";
    render("sqrt", "Square Root", sqr);

    const env = String.raw`\begin{aligned}x&=a+b\\&=c+d\end{aligned}, k=\begin{cases}x&a+b\\y&c+d\end{cases}`;
    render("env", "Environment", env);
  },
  "/matrix": () => {
    const matrix1 = String.raw`\begin{bmatrix}a&a\\a&a\end{bmatrix}\begin{Bmatrix}a&a\\a&a\end{Bmatrix}\begin{vmatrix}a&a\\a&a\end{vmatrix}\begin{Vmatrix}a&a\\a&a\end{Vmatrix}`;
    const matrix2 = String.raw`\begin{pmatrix}a\\a&a\end{pmatrix} \begin{pmatrix}&\\&a\end{pmatrix} \begin{pmatrix}a&&a\\&a\\a&&a\end{pmatrix}`;
    render("mat1", "Matrix", matrix1);
    render("mat2", "Matrix", matrix2);
  },
  "/supsub": () => {
    const supsub1 =
      "a^{aj} f^K K_a a_f a_f^a f^a_a f^{j^{j^{j}}} f_{j_{j_{j}}} f^{j^{j^{j}}}_{j_{j_{j}}}";
    render("supsub", "SupSub1", supsub1);
    const supsub2 =
      "\\left(a\\right)^a \\left(a\\right)_a \\left(a\\right)^a_a";
    render("supsub2", "SupSub2", supsub2);
    const supsub3 = "\\sum_a^a \\int_a^a \\sum^a \\int^a \\int_a ";
    render("supsub3", "SupSub3", supsub3);
    const supsub4 =
      "\\sum_{a+b}^{a+b} \\sum^{a+b} \\int^{a+b} \\int_{a+b} \\int_{a+b}^{a+b}\\prod^{\\prod^x}_{\\prod^x_x}";
    render("supsub4", "SupSub4", supsub4);
  },
  "/symbol": () => {
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
  },
};

loadFont(fontDir.split("/").slice(0, -1).join("/"));
route[window.location.pathname]?.();
