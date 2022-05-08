import { Box, HBox, SymBox, toVBox, VStackBox } from "../box/box";
import { getCharMetrics, getSigma, getSpacing } from "/font";
import { AtomKind } from "/font/src/sigma";
import { Font } from "/font/src/spec";
import { makeLeftRightDelim } from "./leftright";
import { parseSqrt, SqrtAtom } from "./sqrt";
import { FracAtom, parseFrac } from "./frac";
import { parseSub, parseSup, parseSupSub, SupSubAtom } from "./supsub";
import { MatrixAtom, parseMatrix } from "./matrix";

export interface Atom {
  type:
    | "sym"
    | "accent"
    | "overline"
    | "line"
    | "lr"
    | "sqrt"
    | "frac"
    | "supsub"
    | "matrix";
  kind: AtomKind;
}

export interface SymAtom extends Atom {
  type: "sym";
  char: string;
  font: Font;
}

export interface AccentAtom extends Atom {
  type: "accent";
  body: Atom;
  accent: Accent;
}

export interface Accent extends SymAtom {
  char: "^" | "~";
  font: "Main-R";
  kind: "ord";
}

export interface OverlineAtom extends Atom {
  type: "overline";
  body: Atom;
}
export interface LineAtom extends Atom {
  type: "line";
}

export interface LRAtom extends Atom {
  type: "lr";
  left: SymAtom;
  right: SymAtom;
  body: Atom[];
}

export const parseAtoms = (atoms: Atom[]): HBox => {
  let prevKind: AtomKind | undefined;
  const children = atoms.map((atom) => {
    const box = parseAtom(atom);
    if (prevKind && atom.kind) {
      box.spaceL = getSpacing(prevKind, atom.kind);
    }
    prevKind = atom.kind;
    return box;
  });
  const width = children.reduce((acc, a) => acc + a.width + (a.spaceL ?? 0), 0);
  const depth = Math.max(...children.map((child) => child.depth));
  const height = Math.max(...children.map((child) => child.height));
  return { children, width, height, depth };
};

export const parseAtom = (atom: Atom): Box => {
  if (atom.type === "sym") return parseSymAtom(atom as SymAtom);
  if (atom.type === "lr") return parseLRAtom(atom as LRAtom);
  if (atom.type === "overline") return parseOverline(atom as OverlineAtom);
  if (atom.type === "line") return parseLine();
  if (atom.type === "accent") return parseAccentAtom(atom as AccentAtom);
  if (atom.type === "sqrt") return parseSqrt(atom as SqrtAtom);
  if (atom.type === "frac") return parseFrac(atom as FracAtom);
  if (atom.type === "supsub") {
    if ((atom as SupSubAtom).sup && (atom as SupSubAtom).sub) {
      return parseSupSub(atom as SupSubAtom, 0.7);
    } else if ((atom as SupSubAtom).sup) {
      return parseSup(atom as SupSubAtom, 0.7);
    } else {
      return parseSub(atom as SupSubAtom, 0.7);
    }
  }
  if (atom.type === "matrix") {
    return parseMatrix(atom as MatrixAtom);
  }
  throw new Error("No Atom Type Specified");
};

export const parseSymAtom = ({ char, font }: SymAtom): SymBox => {
  const { depth, height, italic, width } = getCharMetrics(char, font);
  return { char, font, depth, height, width: width + italic, italic };
};

export const parseAccentAtom = (atom: AccentAtom): VStackBox => {
  const box = parseSymAtom(atom.body as SymAtom);
  const accBox = parseSymAtom(atom.accent);
  const clearance = Math.min(box.height, getSigma("xHeight"));
  accBox.spaceB = -clearance;
  return toVBox([accBox, box], box.depth);
};

export const parseOverline = (body: OverlineAtom): VStackBox => {
  const accBox = parseAtom({ type: "line", kind: "ord" });
  const box = parseSymAtom(body.body as SymAtom);
  const defaultRuleThickness = getSigma("defaultRuleThickness");
  accBox.spaceT = defaultRuleThickness;
  accBox.spaceB = 3 * defaultRuleThickness;
  return toVBox([accBox, box], box.depth);
};

export const parseLine = (): Box => {
  return { width: 0, height: getSigma("defaultRuleThickness"), depth: 0 };
};

export const parseLRAtom = (atom: LRAtom): HBox => {
  const innerBox = parseAtoms(atom.body);
  const leftBox = makeLeftRightDelim(
    atom.left.char,
    innerBox.height,
    innerBox.depth
  );
  const rightBox = makeLeftRightDelim(
    atom.right.char,
    innerBox.height,
    innerBox.depth
  );
  const width = leftBox.width + innerBox.width + rightBox.width;
  return {
    children: [leftBox, innerBox, rightBox],
    width,
    height: leftBox.height,
    depth: leftBox.depth,
  };
};
