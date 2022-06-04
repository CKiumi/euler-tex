import { GroupAtom } from "./atom/atom";
import { parse } from "./parser/parser";
export * from "./font";
export * from "./atom/atom";
export * from "./box/box";
export * from "./parser/parser";

export const latexToHtml = (latex: string) =>
  new GroupAtom(parse(latex)).toBox().toHtml();

export const latexToEditableAtom = (latex: string) => {
  const atom = new GroupAtom(parse(latex, true), true);
  atom.toBox().toHtml();
  return atom;
};
