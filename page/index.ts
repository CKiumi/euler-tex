import katex from "katex";
import "katex/dist/katex.min.css";
import "../css/eulertex.css";
import "../css/font.css";
import { Options, TEXT } from "../src/box/style";
import { html } from "../src/html";
import {
  MathGroup,
  latexToArticle,
  loadFont,
  prarseMath,
  setLabels,
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
  FontMap,
  INNER,
  LETTER1,
  LETTER2,
  LETTER3,
  MISC,
  OP,
  PUNCT,
  REL,
} from "../src/parser/command";
import { article } from "./data";
const main = document.getElementById("main") as HTMLElement;
loadFont();
const render = (
  id: string,
  title: string,
  latex: string,
  mode: "display" | "inline" | "align" = "display"
) => {
  const line1 = html("span", {
    cls: mode === "display" ? ["ruler", "disp"] : ["ruler"],
  });
  console.time("katex");
  katex.render(latex, line1, {
    displayMode: mode !== "inline",
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
      katex.render(latex, kat, { output: "html", throwOnError: false });
      td.append(
        kat,
        document.createTextNode(" "),
        html("span", {
          children: [latexToHtmlDev(latex, "display", false)],
          style: { fontFamily: "Main" },
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
      "\\mathbb{aABCZ\\mathcal{Z}\\mathcal{HZ}}\\mathfrak{RI}\\Re\\Im\\operatorname{CNOTf}";
    render("mathfont", "Font command", mathfont);
    const acc = "\\overline{x^a}\\hat{x^a}";
    render("acc", "Accent", acc);

    const sqr =
      "\\sqrt{ } a \\sqrt{ \\hat{a}}\\sqrt{a} \\sqrt{a^2} \\sqrt{K+a} \\sqrt{\\int} \\sqrt{\\sqrt{a}}";
    render("sqrt", "Square Root", sqr);
    render("sqrt", "Square Root", sqr, "inline");
    const misc = "\\frac{\\sqrt{日本語 }}{\\sqrt{日本語}}";
    render("misc", "Misc", misc);
  },
  "/frac": () => {
    const frac =
      "\\frac{a+f}{K+j} \\frac{\\sqrt{a}}{\\sqrt{a}}\\frac{\\sum^{a}}{\\prod_b^{a}}";
    render("frac", "Frac", frac);
    render("frac", "Frac", frac, "inline");
  },
  "/lr": () => {
    const lr =
      "\\left(\\sum^{\\sum}_{\\sum}\\right) \\left\\{\\sum^{\\sum}_{\\sum}\\right\\} \\left[\\sum^{\\sum^{\\sum}}_{\\sum}\\right] \\left|\\sum^{\\sum}_{\\sum}\\right| \\left\\|\\sum^{\\sum}_{\\sum}\\right\\|\\left<\\sum^{\\sum}_{\\sum}\\right>";
    const braket = "\\bra{x}A \\ket{x} \\braket{x|y}";
    render("lr", "Left Right Parentheses", lr);
    render("lr", "Left Right Parentheses", lr, "inline");
    const lr2 =
      "\\left(\\sum^{\\sum}_{\\sum}\\right] \\left(\\sum^{\\sum}_{\\sum}\\right.a ";
    render("lr2", "Left Right Parentheses", lr2);
    render("lr2", "Left Right Parentheses", lr2, "inline");
    render("braket", "Bracket", braket);
  },
  "/matrix": () => {
    const matrix1 = String.raw`\begin{bmatrix}a&a\\a&a\end{bmatrix}\begin{Bmatrix}a&a\\a&a\end{Bmatrix}\begin{vmatrix}a&a\\a&a\end{vmatrix}\begin{Vmatrix}a&a\\a&a\end{Vmatrix}`;
    const matrix2 = String.raw`\begin{pmatrix}a\\a&a\end{pmatrix} \begin{pmatrix}&\\&a\end{pmatrix} \begin{pmatrix}a&&a\\&\prod_b^{a}\\a&&a\end{pmatrix}`;
    const matrix3 = String.raw`\begin{matrix} a\\  a&a \end{matrix}\begin{pmatrix} a\\  a&a \end{pmatrix} \begin{array}{lcr}a&abc&a\\abc&a&add\end{array}`;
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
      "\\sum_{a+b}^{a+b} \\sum^{a+b} \\sum_{a+b} \\int^{a+b} \\int_{a+b} \\int_{a+b}^{a+b}\\prod^{\\prod^x}_{\\prod^x_x} ";
    render("supsub3", "SupSub3", supsub3);
    render("supsub3", "SupSub3", supsub3, "inline");
  },
  "/env": () => {
    const env = String.raw`\begin{aligned}x&=\prod_b^{a}+b\\x+y&=c+d\end{aligned}, k=\begin{cases}x&a+b\\y&\prod_b^{a}+d\end{cases}`;
    render("env1", "Environment", env);
    render("env1", "Environment", env, "inline");
    const align = String.raw`\begin{align}x&=\prod_b^{a}+b\\x+y&=c+d\end{align}`;
    render("env2", "Environment", align, "align");
  },
  "/article": () => {
    console.time("total");
    const atom = latexToArticle(article);
    const elem = atom.render();
    const line1 = html("div", {
      children: [elem],
      style: { border: "2px black solid" },
    });
    setLabels(line1);
    main.append(
      html("h1", { text: "Article Editable" }),
      html("div", { id: "article", children: [line1] }),
      html("div", {
        id: "serialize",
        children: [html("div", { text: atom.serialize() })],
      })
    );
    console.timeEnd("total");
  },
  "/symbol": () => {
    renderTable(Object.keys(LETTER1), "Letter 1");
    renderTable(Object.keys(LETTER2), "Letter 2");
    renderTable(Object.keys(LETTER3), "Letter 3");
    renderTable(
      Object.keys(FontMap).map((font) => `${font}{A+*}`),
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
    renderTable(Object.keys(ARROW), "Arrow");
    renderTable(Object.keys(PUNCT), "Punct");
    renderTable(Object.keys(MISC), "MISC");
    renderTable(Object.keys(INNER), "Inner");
    renderTable(Object.keys(AMS_MISC), "AMS MISC");
    renderTable(Object.keys(AMS_BIN), "AMS BIN");
    renderTable(Object.keys(AMS_NBIN), "AMS NBIN");
    renderTable(Object.keys(AMS_REL), "AMS REL");
    renderTable(Object.keys(AMS_ARROW), "AMS ARROW");
    renderTable(
      ["\\neq", "\\ne", "\\notin", "\\notni", "\\sqrt{\\dots}", "\\vdots"],
      "Macros"
    );
  },
};
export const latexToHtmlDev = (
  latex: string,
  mode: "inline" | "display" | "align" = "display",
  fullWidth = true
) => {
  if (mode === "align") return parse(latex)[0].render();
  const options = mode === "inline" ? new Options(6, TEXT) : new Options();
  const group = new MathGroup(prarseMath(latex, true));
  group.body.splice(0, 1);
  const html = group.toBox(options).toHtml();
  fullWidth && (html.style.width = "100%");
  return html;
};

route[window.location.pathname]?.();
