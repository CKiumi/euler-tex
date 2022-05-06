import { Atom, SymAtom } from "./atom";
import { getCharMetrics, getSpacing } from "/font";
import { AtomKind } from "/font/src/sigma";
import { Font } from "/font/src/spec";
export interface Box {
  height: number;
  depth: number;
  width: number;
  spacing?: number;
}

export interface SymBox extends Box {
  char: string;
  font: Font;
  height: number;
  depth: number;
  width: number;
  italic: number;
  spacing?: number;
}

export interface HBox extends Box {
  children: Box[];
  height: number;
  depth: number;
  width: number;
  spacing?: number;
}

export const toHBox = (atoms: Atom[]): HBox => {
  let prevKind: AtomKind | undefined;
  const children = atoms.map((atom) => {
    const box = toSymBox(atom as SymAtom);
    if (prevKind && atom.kind) {
      box.spacing = getSpacing(prevKind, atom.kind);
    }
    prevKind = atom.kind;
    return box;
  });
  const width = children.reduce((acc, a) => acc + a.width, 0);
  const depth = Math.max(...children.map((child) => child.depth));
  const height = Math.max(...children.map((child) => child.height));
  return { children, width, height, depth };
};

export const toSymBox = ({ char, font }: SymAtom): SymBox => {
  const { depth, height, italic, width } = getCharMetrics(char, font);
  return { char, font, depth, height, width: width + italic, italic };
};
