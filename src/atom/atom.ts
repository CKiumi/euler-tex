import { Box, FirstBox, HBox, RectBox } from "../box/box";
import { AtomKind, getSigma, getSpacing } from "../lib";
export * from "./accent";
export * from "./frac";
export * from "./leftright";
export * from "./matrix";
export * from "./sqrt";
export * from "./supsub";
export * from "./sym";

export interface Atom {
  parent: Atom | null;
  elem: HTMLSpanElement | null;
  kind: AtomKind | null;
  toBox(): Box;
}

export class FirstAtom implements Atom {
  kind = null;
  parent = null;
  elem: HTMLSpanElement | null = null;
  toBox(): RectBox {
    return new FirstBox(this);
  }
}

export class GroupAtom implements Atom {
  kind: AtomKind = "ord";
  elem: HTMLSpanElement | null = null;
  parent: Atom | null = null;
  constructor(public body: Atom[]) {
    this.body = [new FirstAtom(), ...body];
  }
  toBox(): Box {
    let prevKind: AtomKind | null;
    const children = this.body.map((atom) => {
      const box = atom.toBox();
      atom.parent = this;
      if (prevKind && atom.kind) {
        box.space.left = getSpacing(prevKind, atom.kind);
      }
      prevKind = atom.kind;
      return box;
    });
    return new HBox(children, this);
  }
}

export const parseLine = (): RectBox => {
  return new RectBox({
    width: 0,
    height: getSigma("defaultRuleThickness"),
    depth: 0,
  });
};
