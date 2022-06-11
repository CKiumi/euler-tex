import { SymBox } from "../box/box";
import { Atom, GroupAtom } from "./atom";
import { AtomKind, Font } from "../lib";

export class SymAtom implements Atom {
  parent: GroupAtom | null = null;
  elem: HTMLSpanElement | null = null;
  fonts: Font[];
  constructor(
    public kind: AtomKind,
    public char: string,
    fonts: (Font | null)[],
    public charBox: boolean = true
  ) {
    this.fonts = fonts.filter((e) => e) as Font[];
  }
  toBox(): SymBox {
    const { char, fonts } = this;
    return new SymBox(char, fonts, this);
  }
}
