import { GroupAtom } from "./atom/atom";
import { Options, TEXT } from "./box/style";
import { parse } from "./parser/parser";
import { latexToBlocks } from "./parser/textParser";
export * from "./font";
export * from "./atom/atom";
export * from "./box/box";
export * from "./parser/parser";

export const LatexToHtml = (latex: string) => {
  return latexToBlocks(latex).map(({ mode, latex }) => {
    if (mode === "text") return latex;
    const inner = new GroupAtom(parse(latex), false)
      .toBox(new Options())
      .toHtml();
    inner.className = mode;
    return inner;
  });
};

export const MathLatexToHtml = (
  latex: string,
  mode: "inline" | "display" = "display"
) => {
  if (mode === "inline") {
    return new GroupAtom(parse(latex)).toBox(new Options(6, TEXT)).toHtml();
  } else {
    return new GroupAtom(parse(latex)).toBox(new Options()).toHtml();
  }
};

export const latexToEditableAtom = (
  latex: string,
  mode: "display" | "inline"
) => {
  const atom = new GroupAtom(parse(latex, true), true);
  const html = atom.toBox(new Options()).toHtml();
  html.className = mode;
  return atom;
};
