import { Atom, SymAtom } from "./atom";
import { getCharMetrics, getSigma, getSpacing } from "/font";
import { AtomKind } from "/font/src/sigma";
import { Font } from "/font/src/spec";
export interface Box {
  height: number;
  depth: number;
  width: number;
  spacing?: number;
  spacingBelow?: number;
  spacingTop?: number;
}

export interface SymBox extends Box {
  char: string;
  font: Font;
  italic: number;
}

export interface HBox extends Box {
  children: Box[];
}
export interface VBox extends Box {
  children: { box: Box; shift: number }[];
}
export interface VStackBox extends Box {
  children: Box[];
  shift: number;
}

export const toVBox = (children: Box[], newDepth: number): VStackBox => {
  const height =
    children
      .map((box) => box.height + box.depth)
      .reduce((partialSum, a) => partialSum + a, 0) - newDepth;
  const width = Math.max(...children.map((box) => box.width));
  const revChildren = children.slice().reverse();
  const oldDepth = revChildren[0].depth;
  return {
    children,
    depth: newDepth,
    height,
    width,
    shift: -(newDepth - oldDepth),
  };
};

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

export const toBox = ({ char }: SymAtom): Box => {
  if (char === "line")
    return {
      depth: 0,
      height: getSigma("defaultRuleThickness"),
      width: 0,
    };
  else
    return {
      depth: 0,
      height: getSigma("defaultRuleThickness"),
      width: 0,
    };
};
