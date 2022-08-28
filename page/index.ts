import katex from "katex";
import "katex/dist/katex.min.css";
import "../css/eulertex.css";
import "../css/font.css";
import { html } from "../src/html";
import {
  GroupAtom,
  latexToArticle,
  LatexToHtml,
  loadFont,
  parse,
} from "../src/lib";
import {
  ACC,
  AMS_ARROW,
  AMS_BIN,
  AMS_MISC,
  AMS_NBIN,
  AMS_REL,
  ARROW,
  BIN,
  fontMap,
  LETTER1,
  LETTER2,
  LETTER3,
  MISC,
  OP,
  REL,
} from "../src/parser/command";
import { Options, TEXT } from "../src/box/style";
const main = document.getElementById("main") as HTMLElement;

const render = (
  id: string,
  title: string,
  latex: string,
  mode: "display" | "inline" = "display"
) => {
  const line1 = html("span", { cls: ["ruler"] });
  console.time("katex");
  katex.render(latex, line1, {
    displayMode: mode === "display",
    output: "html",
  });
  console.timeEnd("katex");
  console.time("euler");
  const line2 = html("span", {
    cls: ["ruler"],
    children: [latexToHtmlDev(latex, mode)],
  });
  console.timeEnd("euler");
  main.append(
    html("h1", { text: title }),
    html("div", {
      id: mode === "inline" ? id + mode : id,
      children: [line1, line2],
    })
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
          children: [latexToHtmlDev(latex)],
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
    const acc = "\\overline{x^a}\\hat{x^a}";
    render("acc", "Accent", acc);

    const sqr =
      "\\sqrt{ } a \\sqrt{ \\hat{a}}\\sqrt{a} \\sqrt{a^2} \\sqrt{K+a} \\sqrt{\\int} \\sqrt{\\sqrt{a}}";
    render("sqrt", "Square Root", sqr);
    render("sqrt", "Square Root", sqr, "inline");
  },
  "/frac": () => {
    const frac =
      "\\frac{a+f}{K+j} \\frac{\\sqrt{a}}{\\sqrt{a}}\\frac{\\sum^{a}}{\\prod_b^{a}}";
    render("frac", "Frac", frac);
    render("frac", "Frac", frac, "inline");
  },
  "/lr": () => {
    const lr =
      "\\left(\\sum^{\\sum}_{\\sum}\\right) \\left\\{\\sum^{\\sum}_{\\sum}\\right\\} \\left[\\sum^{\\sum}_{\\sum}\\right] \\left|\\sum^{\\sum}_{\\sum}\\right| \\left\\|\\sum^{\\sum}_{\\sum}\\right\\|\\left<\\sum^{\\sum}_{\\sum}\\right>";
    const braket = "\\bra{x}A \\ket{x} \\braket{x|y}";
    render("lr", "Left Right Parentheses", lr);
    render("lr", "Left Right Parentheses", lr, "inline");
    render("braket", "Bracket", braket);
  },
  "/matrix": () => {
    const matrix1 = String.raw`\begin{bmatrix}a&a\\a&a\end{bmatrix}\begin{Bmatrix}a&a\\a&a\end{Bmatrix}\begin{vmatrix}a&a\\a&a\end{vmatrix}\begin{Vmatrix}a&a\\a&a\end{Vmatrix}`;
    const matrix2 = String.raw`\begin{pmatrix}a\\a&a\end{pmatrix} \begin{pmatrix}&\\&a\end{pmatrix} \begin{pmatrix}a&&a\\&\prod_b^{a}\\a&&a\end{pmatrix}`;
    const matrix3 = String.raw`\begin{pmatrix} a\\ \hline a&a \end{pmatrix} `;
    render("mat1", "Matrix", matrix1);
    render("mat2", "Matrix", matrix2);
    render("mat3", "Matrix", matrix3);
  },
  "/supsub": () => {
    const supsub1 =
      "a^{aj} f^K K_a a_f a_f^a f^a_a f^{j^{j^{j}}} f_{j_{j_{j}}} f^{j^{j^{j}}}_{j_{j_{j}}}x^{-x^2}";
    render("supsub", "SupSub1", supsub1);

    const supsub2 =
      "\\left(a\\right)^a \\left(a\\right)_a \\left(a\\right)^a_a";
    render("supsub2", "SupSub2", supsub2);

    const supsub3 =
      "\\sum_{a+b}^{a+b} \\sum^{a+b} \\int^{a+b} \\int_{a+b} \\int_{a+b}^{a+b}\\prod^{\\prod^x}_{\\prod^x_x} ";
    render("supsub3", "SupSub3", supsub3);
    render("supsub3", "SupSub3", supsub3, "inline");
  },
  "/env": () => {
    const env = String.raw`\begin{aligned}x&=\prod_b^{a}+b\\x+y&=c+d\end{aligned}, k=\begin{cases}x&a+b\\y&\prod_b^{a}+d\end{cases}`;
    render("env", "Environment", env);
    render("env", "Environment", env, "inline");
  },
  "/article": () => {
    const env = String.raw`Ok Let's start with the following equation. You can expand and factor\[\left(x+y \right)^{2},\]The more complicated example:\[\left(\sqrt{x}-\frac{z}{k} \right)^{3}\]With trig expand, you can expand\[\sin \left(x+y \right)+\cos \left(x+y \right)\]日本語も打てるよ。 inline math-mode $x+y= z$ Multiline editing is also supported now. $\pounds \in \mathbb{C}$ aligned is also supported \[\begin{aligned}x & = a \\  & = c+d\ \text{(text mode)}\end{aligned}\]and also cases\[\begin{cases}x+y & a\lt 0 \\ c+d & a\ge 0\end{cases}\]Matrix calculations are also supported\[\begin{pmatrix}a & b \\ c & d\end{pmatrix}\begin{pmatrix}e & f \\ g & h\end{pmatrix}+\begin{pmatrix}e & f \\ g & h\end{pmatrix}\]!!!`;
    console.time("euler1");
    const line1 = html("div", {
      children: [latexToArticle(env).toBox().toHtml()],
      style: { border: "2px black solid" },
    });
    console.timeEnd("euler1");
    main.append(
      html("h1", { text: "Article Editable" }),
      html("div", { id: "article", children: [line1] })
    );
    console.time("euler2");
    const line2 = html("div", {
      children: LatexToHtml(env),
      style: { border: "2px black solid" },
    });
    console.timeEnd("euler2");
    main.append(
      html("h1", { text: "Article ReadOnly" }),
      html("div", { id: "article", children: [line2] })
    );
  },
  "/symbol": () => {
    renderTable(Object.keys(LETTER1), "Letter 1");
    renderTable(Object.keys(LETTER2), "Letter 2");
    renderTable(Object.keys(LETTER3), "Letter 3");
    renderTable(
      Object.keys(fontMap).map((font) => `\\${font}{A}`),
      "Font"
    );
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
export const latexToHtmlDev = (
  latex: string,
  mode: "inline" | "display" = "display"
) => {
  const options = mode === "inline" ? new Options(6, TEXT) : new Options();
  return new GroupAtom(parse(latex)).toBox(options).toHtml();
};
loadFont();
route[window.location.pathname]?.();
