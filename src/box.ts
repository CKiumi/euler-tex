import { Atom, SymAtom } from "./atom";
import { getCharMetrics } from "/font";
import { Font } from "/font/src/spec";

export interface Box {
  height: number;
  depth: number;
  width: number;
}

export interface SymBox extends Box {
  char: string;
  font: Font;
  height: number;
  depth: number;
  width: number;
  italic: number;
}

export interface HBox extends Box {
  children: Box[];
  height: number;
  depth: number;
  width: number;
}

export const toHBox = (atoms: Atom[]): HBox => {
  const children = atoms.map(toSymBox);
  const width = children.reduce((acc, a) => acc + a.width, 0);
  const depth = Math.max(...children.map((child) => child.depth));
  const height = Math.max(...children.map((child) => child.height));
  return { children, width, height, depth };
};

export const toSymBox = ({ char, font }: SymAtom): SymBox => {
  const { depth, height, italic, width } = getCharMetrics(char, font);
  return { char, font, depth, height, width: width + italic, italic };
};
