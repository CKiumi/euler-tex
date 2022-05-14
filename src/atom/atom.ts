import { Box, HBox, RectBox } from "../box/box";
import { AtomKind, getSigma, getSpacing } from "../lib";
export * from "./sym";
export * from "./frac";
export * from "./leftright";
export * from "./matrix";
export * from "./sqrt";
export * from "./supsub";
export * from "./accent";

export interface Atom {
  kind: AtomKind;
  toBox(): Box;
}

export class GroupAtom implements Atom {
  kind: AtomKind = "ord";
  constructor(public body: Atom[]) {}
  toBox(): Box {
    let prevKind: AtomKind | undefined;
    const children = this.body.map((atom) => {
      const box = atom.toBox();
      if (prevKind && atom.kind) {
        box.space.left = getSpacing(prevKind, atom.kind);
      }
      prevKind = atom.kind;
      return box;
    });
    return new HBox(children);
  }
}

export const parseAtoms = (atoms: Atom[]): HBox => {
  let prevKind: AtomKind | undefined;
  const children = atoms.map((atom) => {
    const box = atom.toBox();
    if (prevKind && atom.kind) {
      box.space.left = getSpacing(prevKind, atom.kind);
    }
    prevKind = atom.kind;
    return box;
  });
  return new HBox(children);
};

export const parseLine = (): RectBox => {
  return new RectBox({
    width: 0,
    height: getSigma("defaultRuleThickness"),
    depth: 0,
  });
};
