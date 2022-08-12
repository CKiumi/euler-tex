import { SymBox } from "../box/box";
import { Atom, GroupAtom } from "./atom";
import { AtomKind, Font } from "../lib";
import { DISPLAY, Options } from "../box/style";
import { LIMIT } from "../parser/command";

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
      LIMIT.includes(this.command ?? "")
    ) {
      return new SymBox(this.char, ["Size1"], this);
    }
    return new SymBox(char, fonts, this);
  }
}
