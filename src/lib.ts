import { GroupAtom } from "./atom/atom";
import { parse } from "./parser/parser";
import { latexToBlocks } from "./parser/textParser";
export * from "./font";
export * from "./atom/atom";
export * from "./box/box";
export * from "./parser/parser";

export const LatexToHtml = (latex: string) => {
  return latexToBlocks(latex).map(({ mode, latex }) => {
    if (mode === "text") return latex;
    const inner = new GroupAtom(parse(latex), false).toBox().toHtml();
    inner.className = mode;
    return inner;
  });
};

export const MathLatexToHtml = (latex: string) =>
  new GroupAtom(parse(latex)).toBox().toHtml();

export const latexToEditableAtom = (
  latex: string,
  mode: "display" | "inline"
) => {
  const atom = new GroupAtom(parse(latex, true), true);
  const html = atom.toBox().toHtml();
  html.className = mode;
  return atom;
};
