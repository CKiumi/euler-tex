import { Box, FirstBox, HBox, RectBox } from "../box/box";
import { Options } from "../box/style";
import { AtomKind, getSigma, getSpacing } from "../lib";
import { Display, Inline } from "./block";
export * from "./block";
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
  children(): Atom[];
  serialize(): string;
}

export interface MathAtom extends Atom {
  kind: AtomKind | null;
  toBox(options?: Options): Box;
}

export interface Group {
  body: Atom[];
}

export class FirstAtom implements Atom {
  kind = null;
  parent: Atom | null = null;
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

export class MathGroup implements Group {
  kind: AtomKind | null = null;
  elem: HTMLSpanElement | null = null;
  parent: (Atom | Display) | null = null;

  constructor(public body: MathAtom[]) {
    this.body = [new FirstAtom(), ...body];
  }

  children(): Atom[] {
    return this.body.flatMap((atom) => atom.children());
  }

  static _toBox(group: MathGroup | Inline, options: Options) {
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

export class TextGroup implements Group {
  kind: AtomKind | null = null;
  elem: HTMLSpanElement | null = null;
  parent: Atom | null = null;

  constructor(public body: MathAtom[]) {
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

export const parseLine = (width = 0): RectBox => {
  const height = getSigma("defaultRuleThickness");
  return new RectBox({ width, height, depth: 0 }, ["line"]);
};
