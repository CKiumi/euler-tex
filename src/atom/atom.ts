import { Box, HBox, RectBox, SymBox, VBox } from "../box/box";
import { Options, TEXT } from "../box/style";
import { AtomKind, getSigma, getSpacing } from "../lib";
import { ThmData } from "../parser/command";
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
  toBox(): SymBox {
    return new SymBox("&#8203;", ["Math-I"]).bind(this);
  }
}

export class GroupAtom implements Atom {
  kind: AtomKind = "ord";
  elem: HTMLSpanElement | null = null;
  parent: Atom | null = null;
  constructor(public body: Atom[]) {
    this.body = [new FirstAtom(), ...body];
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
    return new HBox(children).bind(this);
  }
}

export class ArticleAtom extends GroupAtom {
  kind: AtomKind = "ord";
  elem: HTMLSpanElement | null = null;
  parent: Atom | null = null;

  constructor(
    public body: Atom[],
    public mode: "theorem" | "text" = "text",
    public thmName: ThmData | null = null,
    public label: string | null = null
  ) {
    super(body);
    this.body = [new FirstAtom(), ...body];
  }

  toBox(options?: Options): HBox {
    const children = this.body.map((atom) => {
      const box = atom.toBox(options ?? new Options());
      atom.parent = this;
      return box;
    });
    return new HBox(children, this.mode, 1, this.thmName, this.label).bind(
      this
    );
  }
}

export class MathBlockAtom {
  kind: AtomKind = "ord";
  elem: HTMLSpanElement | null = null;
  parent: Atom | null = null;
  label: string | null = null;
  constructor(
    public body: GroupAtom,
    public mode:
      | "display"
      | "inline"
      | "section"
      | "subsection"
      | "subsubsection",
    public tag: string | null | undefined = undefined
  ) {}

  toBox(options?: Options): HBox {
    const body = this.body.toBox(
      this.mode === "inline" ? new Options(6, TEXT) : options ?? new Options()
    );
    if (this.mode === "display" && (this.tag || this.tag === null)) {
      const box = new SymBox(`(${this.tag ?? "?"})`, ["Main-R"]);
      [box.rect.depth, box.rect.height] = [body.rect.depth, body.rect.height];
      const tagBox = new VBox([{ box, shift: 0 }]);
      tagBox.tag = true;
      return new HBox([body, tagBox], this.mode, 1, null, this.tag).bind(this);
    }
    return new HBox([body], this.mode, 1, null, this.tag).bind(this);
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
