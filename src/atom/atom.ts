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
  elem: HTMLSpanElement | null;
  kind: AtomKind | null;
  toBox(): Box;
}

export class FirstAtom implements Atom {
  kind = null;
  elem: HTMLSpanElement | null = null;
  toBox(): RectBox {
    return new RectBox({ width: 0, height: 0, depth: 0 }, this);
  }
}

export class GroupAtom implements Atom {
  kind: AtomKind = "ord";
  elem: HTMLSpanElement | null = null;
  constructor(public body: Atom[]) {
    this.body = [new FirstAtom(), ...body];
  }
  toBox(): Box {
    let prevKind: AtomKind | null;
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

export const parseLine = (): RectBox => {
  return new RectBox({
    width: 0,
    height: getSigma("defaultRuleThickness"),
    depth: 0,
  });
};
