import { SymBox, SymStyle, VStackBox } from "../box/box";
import { DISPLAY, Options } from "../box/style";
import { AtomKind, Font } from "../lib";
import { BLOCKOP } from "../parser/command";
import { MathAtom, MathGroup } from "./atom";

export class SymAtom implements MathAtom {
  parent: MathGroup | null = null;
  elem: HTMLSpanElement | null = null;
  fonts: Font[];
  constructor(
    public kind: AtomKind | null,
    public char: string,
    public command: string,
    fonts: (Font | null)[],
    public style?: SymStyle,
    public charBox: boolean = true
  ) {
    this.fonts = fonts.filter((e) => e) as Font[];
    if (fonts.includes("Math-BI") && fonts.includes("Main-R")) {
      this.fonts = ["Main-B"];
    }
    if (fonts.length === 0) this.fonts = ["Main-R"];
  }

  static newRef = (c: string) =>
    new SymAtom("ord", c, c, ["Main-R"], { ref: true });

  children() {
    return [this];
  }

  serialize(): string {
    if (this.style?.font) return `${this.style?.font}{${this.command}}`;
    if (this.style?.ref) return `\\ref{${this.command}}`;
    return this.command.startsWith("\\") ? this.command + " " : this.command;
  }

  toBox(options?: Options): SymBox | VStackBox {
    const { char, fonts, style } = this;
    if (this.command === "\\neq") {
      const not = new SymBox("", fonts);
      not.space.bottom = -0.56;
      return new VStackBox([not, new SymBox(char, fonts)], -0.14).bind(this);
    }
    if (this.command === "\\notin" || this.command === "\\notni") {
      const not = new SymBox("", fonts);
      not.space.bottom = -0.7;
      return new VStackBox([not, new SymBox(char, fonts)], 0).bind(this);
    }
    options = options ?? new Options();
    if (
      options.style.size !== DISPLAY.size &&
      Object.keys(BLOCKOP).includes(this.command ?? "")
    ) {
      return new SymBox(this.char, ["Size1"]).bind(this);
    }
    if (this.command === "\\vdots") {
      const box = new SymBox(char, fonts).bind(this);
      box.space.top = 0.4;
      return box;
    }
    return new SymBox(char, fonts, style).bind(this);
  }
}
