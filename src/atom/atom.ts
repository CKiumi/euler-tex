import {
  ArticleBox,
  Box,
  DisplayBox,
  FirstBox,
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
import { randStr } from "../util";
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
  children(): Atom[];
  serialize(): string;
  toBox(options?: Options): Box;
}

export interface GroupAtom extends Atom {
  body: Atom[];
}

export class FirstAtom implements Atom {
  kind = null;
  parent = null;
  elem: HTMLSpanElement | null = null;

  children() {
    return [this];
  }

  serialize() {
    return "";
  }

  toBox(): FirstBox {
    return new FirstBox().bind(this);
  }
}

export class MathGroup implements GroupAtom {
  kind: AtomKind | null = null;
  elem: HTMLSpanElement | null = null;
  parent: Atom | null = null;

  constructor(public body: Atom[]) {
    this.body = [new FirstAtom(), ...body];
  }

  children(): Atom[] {
    return this.body.flatMap((atom) => atom.children());
  }

  static _toBox(group: GroupAtom, options: Options) {
    let prevKind: AtomKind | null;
    return group.body.map((atom) => {
      const box = atom.toBox(options);
      atom.parent = group;
      if (prevKind && atom.kind) {
        box.space.left =
          (box.space.left ?? 0) +
          getSpacing(prevKind, atom.kind, options?.style.isTight());
      }
      prevKind = atom.kind;
      return box;
    });
  }

  serialize() {
    return this.body.map((atom) => atom.serialize()).join("");
  }

  toBox(options: Options): HBox {
    return new HBox(MathGroup._toBox(this, options)).bind(this);
  }
}

export class TextGroup implements GroupAtom {
  kind: AtomKind | null = null;
  elem: HTMLSpanElement | null = null;
  parent: Atom | null = null;

  constructor(public body: Atom[]) {
    this.body = [new FirstAtom(), ...body];
  }

  children(): Atom[] {
    return this.body.flatMap((atom) => atom.children());
  }

  serialize() {
    return `\\text{${this.body.map((atom) => atom.serialize()).join("")}}`;
  }

  toBox(options: Options): HBox {
    return new HBox(
      this.body.map((atom) => {
        atom.parent = this;
        return atom.toBox(options);
      })
    ).bind(this);
  }
}

export class Article implements GroupAtom {
  kind = null;
  elem: HTMLSpanElement | null = null;
  parent: Atom | null = null;

  constructor(public body: Atom[]) {
    this.body = [new FirstAtom(), ...body];
  }

  children(): Atom[] {
    return this.body.flatMap((atom) => atom.children());
  }

  serialize() {
    return this.body.map((atom) => atom.serialize()).join("");
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

export class ThmAtom implements GroupAtom {
  kind = null;
  elem: HTMLSpanElement | null = null;
  parent: Atom | null = null;

  constructor(
    public body: Atom[],
    public thmName: ThmData,
    public label: string
  ) {
    this.body = [new FirstAtom(), ...body];
  }

  children(): Atom[] {
    return this.body.flatMap((atom) => atom.children());
  }

  serialize() {
    const name = this.thmName.label.toLowerCase();
    return `\n\\begin{${name}}\\label{${this.label}}${this.body
      .map((atom) => atom.serialize())
      .join("")}\\end{${name}}\n`;
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

export class SectionAtom implements GroupAtom {
  kind = null;
  elem: HTMLSpanElement | null = null;
  parent: Atom | null = null;
  constructor(
    public body: Atom[],
    public mode: "section" | "subsection" | "subsubsection",
    public label: string = randStr()
  ) {
    this.body = [new FirstAtom(), ...body];
  }

  children(): Atom[] {
    return [...this.body.flatMap((atom) => atom.children()), this];
  }

  serialize() {
    const label = this.label ? `\\label{${this.label}}` : "";
    return `\n\\${this.mode}{${this.body
      .map((atom) => atom.serialize())
      .join("")}}\n${label}`;
  }

  toBox(): SectionBox {
    const children = this.body.map((atom) => {
      const box = atom.toBox(new Options());
      atom.parent = this;
      return box;
    });
    return new SectionBox(children, this.mode, this.label).bind(this);
  }
}
export class InlineAtom implements GroupAtom {
  kind = null;
  elem: HTMLSpanElement | null = null;
  parent = null;
  constructor(public body: Atom[]) {
    this.body = [new FirstAtom(), ...body];
  }

  children(): Atom[] {
    return [...this.body.flatMap((atom) => atom.children()), this];
  }

  serialize() {
    return `$${this.body.map((atom) => atom.serialize()).join("")}$`;
  }

  toBox(): InlineBox {
    return new InlineBox(MathGroup._toBox(this, new Options(6, TEXT))).bind(
      this
    );
  }
}

export class DisplayAtom implements Atom {
  kind = null;
  elem: HTMLSpanElement | null = null;
  parent: Atom | null = null;
  constructor(public body: MathGroup, public label: string | null) {}

  children() {
    return this.body.children();
  }

  serialize() {
    if (this.label) {
      return `\n\\begin{equation}\\label{${
        this.label
      }}${this.body.serialize()}\\end{equation}\n`;
    }
    return `\n\\[${this.body.serialize()}\\]\n`;
  }

  toBox(): DisplayBox {
    const body = this.body.toBox(new Options());
    this.body.parent = this;
    if (this.label) {
      const box = new SymBox("(?)", ["Main-R"]);
      [box.rect.depth, box.rect.height] = [body.rect.depth, body.rect.height];
      const tagBox = new VBox([{ box, shift: 0 }]);
      tagBox.tag = true;
      return new DisplayBox([body, tagBox], this.label).bind(this);
    }
    return new DisplayBox([body], this.label).bind(this);
  }
}

export class AlignAtom implements Atom {
  kind = null;
  elem: HTMLSpanElement | null = null;
  parent: Atom | null = null;
  constructor(public body: MathGroup, public label: string | null) {}

  children() {
    return this.body.children();
  }

  serialize() {
    if (this.label) {
      return `\n\\begin{equation}\\label{${
        this.label
      }}${this.body.serialize()}\\end{equation}\n`;
    }
    return `\n\\[${this.body.serialize()}\\]\n`;
  }

  toBox(): DisplayBox {
    const body = this.body.toBox(new Options());
    this.body.parent = this;
    if (this.label) {
      const box = new SymBox("(?)", ["Main-R"]);
      [box.rect.depth, box.rect.height] = [body.rect.depth, body.rect.height];
      const tagBox = new VBox([{ box, shift: 0 }]);
      tagBox.tag = true;
      return new DisplayBox([body, tagBox], this.label).bind(this);
    }
    return new DisplayBox([body], this.label).bind(this);
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
