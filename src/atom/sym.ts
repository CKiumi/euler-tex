import { CharBox, SymBox, VStackBox } from "../box/box";
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
    public command: string,
    fonts: (Font | null)[],
    public charBox: boolean = true
  ) {
    this.fonts = fonts.filter((e) => e) as Font[];
  }
  toBox(options?: Options): SymBox | VStackBox {
    const { char, fonts } = this;
    if (this.command === "\\neq") {
      const not = new SymBox("", fonts);
      not.space.bottom = -0.56;
      return new VStackBox([not, new SymBox(char, fonts)], -0.14, this);
    }
    if (this.command === "\\notin" || this.command === "\\notni") {
      const not = new SymBox("", fonts);
      not.space.bottom = -0.7;
      return new VStackBox([not, new SymBox(char, fonts)], 0, this);
    }
    options = options ?? new Options();
    if (
      options.style.size !== DISPLAY.size &&
      Object.keys(BLOCKOP).includes(this.command ?? "")
    ) {
      return new SymBox(this.char, ["Size1"], this);
    }
    if (this.command === "\\vdots") {
      const box = new SymBox(char, fonts, this);
      box.space.top = 0.4;
      return box;
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
    public font: Font | null = null,
    public ref = false
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
      this.font,
      this.ref
    );
  }
}
