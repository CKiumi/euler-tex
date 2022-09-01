import { BlockBox, Box, FirstBox, HBox, RectBox } from "../box/box";
import { Options, TEXT } from "../box/style";
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
  toBox(): FirstBox {
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

  toBox(options: Options): HBox {
    let prevKind: AtomKind | null;
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

export class ArticleAtom extends GroupAtom {
  kind: AtomKind = "ord";
  elem: HTMLSpanElement | null = null;
  parent: Atom | null = null;

  constructor(public body: Atom[]) {
    super(body);
    this.body = [new FirstAtom(), ...body];
  }

  toBox(options?: Options): HBox {
    const children = this.body.map((atom) => {
      const box = atom.toBox(options);
      atom.parent = this;
      return box;
    });
    return new BlockBox("text", children, this);
  }
}

export class MathBlockAtom extends GroupAtom {
  kind: AtomKind = "ord";
  elem: HTMLSpanElement | null = null;
  parent: Atom | null = null;

  constructor(public body: Atom[], public mode: "display" | "inline") {
    super(body);
    this.body = [new FirstAtom(), ...body];
  }

  toBox(options?: Options): HBox {
    let prevKind: AtomKind | null;
    const children = this.body.map((atom) => {
      const box = atom.toBox(
        this.mode === "inline" ? new Options(6, TEXT) : options ?? new Options()
      );
      atom.parent = this;
      if (prevKind && atom.kind) {
        box.space.left =
          (box.space.left ?? 0) + getSpacing(prevKind, atom.kind);
      }
      prevKind = atom.kind;
      return box;
    });
    return new BlockBox(this.mode, children, this);
  }
}

export class SectionAtom extends GroupAtom {
  kind: AtomKind = "ord";
  elem: HTMLSpanElement | null = null;
  parent: Atom | null = null;

  constructor(
    public body: Atom[],
    public mode: "section" | "subsection" | "subsubsection" = "section",
    public editable = false
  ) {
    super(body, editable);
  }

  toBox(): HBox {
    const children = this.body.map((atom) => {
      const box = atom.toBox();
      atom.parent = this;
      return box;
    });
    return new BlockBox(this.mode, children, this);
  }
}

export const parseLine = (width?: number): RectBox => {
  return new RectBox(
    {
      width: width ?? 0,
      height: getSigma("defaultRuleThickness"),
      depth: 0,
    },
    ["line"]
  );
};
