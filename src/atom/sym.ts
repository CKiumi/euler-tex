import { SymBox } from "../box/box";
import { Atom } from "./atom";
import { AtomKind, Font } from "/src/lib";

export class SymAtom implements Atom {
  constructor(public kind: AtomKind, public char: string, public font: Font) {}
  toBox(): SymBox {
    const { char, font } = this;
    return new SymBox(char, font);
  }
}
