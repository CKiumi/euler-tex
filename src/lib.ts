import {
  Atom,
  CharAtom,
  GroupAtom,
  MathBlockAtom,
  ArticleAtom,
} from "./atom/atom";
import { Options, TEXT } from "./box/style";
import { FontList } from "./font/spec";
import { parse } from "./parser/parser";
import { latexToBlocks } from "./parser/textParser";
export * from "./font";
export * from "./atom/atom";
export * from "./box/box";
export * from "./parser/parser";

export const loadFont = () => {
  FontList.forEach((name) => {
    const url = new URL(`../woff/${name}.woff2`, import.meta.url).href;
    const font = new FontFace(name, `url(${url}) format('woff2')`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (document.fonts as any).add(font);
    font.load().catch(console.log);
  });
};

export const LatexToHtml = (latex: string): (HTMLSpanElement | Text)[] => {
  return latexToBlocks(latex).map(({ mode, latex }) => {
    if (mode === "text") return document.createTextNode(latex);
    if (mode === "align") {
      return parse("\\begin{align}" + latex + "\\end{align}")[0]
        .toBox()
        .toHtml();
    }
    return MathLatexToHtml(latex, mode as "inline" | "display");
  });
};

export const MathLatexToHtml = (
  latex: string,
  mode: "inline" | "display" = "display"
) => {
  console.log(latex);
  if (mode === "inline") {
    const html = new GroupAtom(parse(latex))
      .toBox(new Options(6, TEXT))
      .toHtml();
    html.className = "inline";
    return html;
  } else {
    const html = new GroupAtom(parse(latex)).toBox(new Options()).toHtml();
    html.className = "display";
    return html;
  }
};

export const latexToArticle = (latex: string) => {
  return new ArticleAtom(latexToEditableAtoms(latex));
};

export const latexToEditableAtoms = (latex: string): Atom[] => {
  const texts: Atom[] = [];
  latexToBlocks(latex).forEach(({ mode, latex }) => {
    if (mode === "text") {
      const atoms = latex.split("").map((char) => new CharAtom(char));
      texts.push(...atoms);
    }
    if (mode === "inline")
      texts.push(new MathBlockAtom(parse(latex, true), "inline"));
    if (mode === "display")
      texts.push(new MathBlockAtom(parse(latex, true), "display"));
    if (mode === "align") {
      texts.push(parse("\\begin{align}" + latex + "\\end{align}", true)[0]);
    }
  });
  return texts;
};
