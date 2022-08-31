import { CharBox, SymBox } from "../box/box";
import { DISPLAY, Options } from "../box/style";
import { AtomKind, Font } from "../lib";
import { BLOCKOP } from "../parser/command";
import { Atom, GroupAtom } from "./atom";

export class SymAtom implements Atom {
  parent: GroupAtom | null = null;
  elem: HTMLSpanElement | null = null;
  fonts: Font[];

  constructor(
    public kind: AtomKind,
    public char: string,
    fonts: (Font | null)[],
    public charBox: boolean = true,
    public command?: string
  ) {
    this.fonts = fonts.filter((e) => e) as Font[];
  }
  toBox(options?: Options): SymBox {
    const { char, fonts } = this;
    options = options ?? new Options();
    if (
      options.style.size !== DISPLAY.size &&
      Object.keys(BLOCKOP).includes(this.command ?? "")
    ) {
      return new SymBox(this.char, ["Size1"], this);
    }
    return new SymBox(char, fonts, this);
  }
}

export class CharAtom implements Atom {
  kind: AtomKind = "ord";
  elem: HTMLSpanElement | null = null;
  parent: Atom | null = null;
  constructor(
    public char: string,
    public composite?: boolean,
    public italic = false,
    public bold = false,
    public font: Font | null = null
  ) {
    if (char === " ") this.char = "&nbsp;";
  }
  toBox(): CharBox {
    return new CharBox(
      this.char,
      this,
      this.composite,
      this.italic,
      this.bold,
      this.font
    );
  }
}
