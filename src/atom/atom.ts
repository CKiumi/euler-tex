import {
  ArticleBox,
  Box,
  DisplayBox,
  HBox,
  InlineBox,
  RectBox,
  SectionBox,
  SymBox,
  ThmBox,
  VBox,
} from "../box/box";
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
  kind: AtomKind | null = null;
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

export class ArticleAtom {
  kind = null;
  elem: HTMLSpanElement | null = null;
  parent: Atom | null = null;

  constructor(public body: Atom[]) {
    this.body = [new FirstAtom(), ...body];
  }

  toBox(): ArticleBox {
    const children = this.body.map((atom) => {
      const box = atom.toBox(new Options());
      atom.parent = this;
      return box;
    });
    return new ArticleBox(children).bind(this);
  }
}

export class ThmAtom {
  kind = null;
  elem: HTMLSpanElement | null = null;
  parent: Atom | null = null;

  constructor(
    public body: Atom[],
    public thmName: ThmData | null = null,
    public label: string | null = null
  ) {
    this.body = [new FirstAtom(), ...body];
  }

  toBox(): ThmBox {
    const children = this.body.map((atom) => {
      const box = atom.toBox(new Options());
      atom.parent = this;
      return box;
    });
    return new ThmBox(children, this.thmName, this.label).bind(this);
  }
}

export class SectionAtom implements Atom {
  kind = null;
  elem: HTMLSpanElement | null = null;
  parent: Atom | null = null;
  label: string | null = null;
  constructor(
    public body: GroupAtom,
    public mode: "section" | "subsection" | "subsubsection",
    public tag: string | null | undefined = undefined
  ) {}

  toBox(): SectionBox {
    const body = this.body.toBox(new Options());
    return new SectionBox([body], this.mode, this.tag).bind(this);
  }
}
export class InlineAtom implements Atom {
  kind = null;
  elem = null;
  parent = null;
  constructor(public body: GroupAtom) {}
  toBox(): InlineBox {
    const body = this.body.toBox(new Options(6, TEXT));
    return new InlineBox([body]).bind(this);
  }
}

export class DisplayAtom implements Atom {
  kind = null;
  elem: HTMLSpanElement | null = null;
  parent: Atom | null = null;
  label: string | null = null;
  constructor(
    public body: GroupAtom,
    public tag: string | null | undefined = undefined
  ) {}

  toBox(): DisplayBox {
    const body = this.body.toBox(new Options());
    if (this.tag || this.tag === null) {
      const box = new SymBox(`(${this.tag ?? "?"})`, ["Main-R"]);
      [box.rect.depth, box.rect.height] = [body.rect.depth, body.rect.height];
      const tagBox = new VBox([{ box, shift: 0 }]);
      tagBox.tag = true;
      return new DisplayBox([body, tagBox], this.tag).bind(this);
    }
    return new DisplayBox([body], this.tag).bind(this);
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
