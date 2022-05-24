import { SymBox } from "../box/box";
import { Atom, GroupAtom } from "./atom";
import { AtomKind, Font } from "/src/lib";

export class SymAtom implements Atom {
  parent: GroupAtom | null = null;
  elem: HTMLSpanElement | null = null;
  constructor(
    public kind: AtomKind,
    public char: string,
    public font: Font,
    public charBox: boolean = true
  ) {}
  toBox(): SymBox {
    const { char, font } = this;
    return new SymBox(char, font, this);
  }
}
