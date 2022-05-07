import { Box, HBox, SymBox, toVBox, VStackBox } from "/src/box";
import { getCharMetrics, getSigma, getSpacing } from "/font";
import { AtomKind } from "/font/src/sigma";
import { Font } from "/font/src/spec";

export interface Atom {
  type: "sym" | "accent" | "overline" | "line";
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

export const parseAtoms = (atoms: Atom[]): HBox => {
  let prevKind: AtomKind | undefined;
  const children = atoms.map((atom) => {
    const box = parseAtom(atom);
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

export const parseAtom = (atom: Atom): Box => {
  if (atom.type === "sym") return parseSymAtom(atom as SymAtom);
  if (atom.type === "overline") return parseOverline(atom as OverlineAtom);
  if (atom.type === "line") return parseLine();
  if (atom.type === "accent") return parseAccentAtom(atom as AccentAtom);
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
  accBox.spacingBelow = -clearance;
  return toVBox([accBox, box], box.depth);
};

export const parseOverline = (body: OverlineAtom): VStackBox => {
  const accBox = parseAtom({ type: "line", kind: "ord" });
  const box = parseSymAtom(body.body as SymAtom);
  const defaultRuleThickness = getSigma("defaultRuleThickness");
  accBox.spacingTop = defaultRuleThickness;
  accBox.spacingBelow = 3 * defaultRuleThickness;
  return toVBox([accBox, box], box.depth);
};

export const parseLine = (): Box => {
  return { width: 0, height: getSigma("defaultRuleThickness"), depth: 0 };
};
