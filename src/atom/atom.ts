import { Box, FirstBox, HBox, RectBox } from "../box/box";
import { Options } from "../box/style";
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
  toBox(options?: Options): Box;
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
  constructor(public body: Atom[], public editable = false) {
    this.body = editable ? [new FirstAtom(), ...body] : body;
  }

  toBox(options?: Options): HBox {
    let prevKind: AtomKind | null;
    options = options ?? new Options();
    const children = this.body.map((atom) => {
      const box = atom.toBox(options);
      atom.parent = this;
      if (prevKind && atom.kind) {
        box.space.left =
          (box.space.left ?? 0) +
          getSpacing(prevKind, atom.kind, options?.style.isTight());
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
