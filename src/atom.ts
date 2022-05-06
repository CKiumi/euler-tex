import { toBox, toSymBox, toVBox, VStackBox } from "/src/box";
import { getSigma } from "/font";
import { AtomKind } from "/font/src/sigma";
import { Font } from "/font/src/spec";

export interface Atom {
  kind: AtomKind;
}

export interface SymAtom extends Atom {
  char: string;
  font: Font;
}

export interface AccentAtom extends Atom {
  body: Atom;
  accent: Accent;
}

export type Accent = {
  char: "^";
  font: "Main-R";
  kind: "ord";
};

export interface OverlineAtom extends Atom {
  body: Atom;
}

export const parseAccentAtom = (body: AccentAtom): VStackBox => {
  const box = toSymBox(body.body as SymAtom);
  const accBox = toSymBox(body.accent);
  const clearance = Math.min(box.height, getSigma("xHeight"));
  accBox.spacingBelow = -clearance;
  return toVBox([accBox, box], 0);
};

export const parseOverline = (body: OverlineAtom): VStackBox => {
  const accBox = toBox({ char: "line", font: "Main-R", kind: "ord" });
  const box = toSymBox(body.body as SymAtom);
  const defaultRuleThickness = getSigma("defaultRuleThickness");
  accBox.spacingTop = defaultRuleThickness;
  accBox.spacingBelow = 3 * defaultRuleThickness;
  return toVBox([accBox, box], box.depth);
};
