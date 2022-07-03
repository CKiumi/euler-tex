import { AtomKind } from "../font";
import { HBox, SymBox } from "../lib";
import { Atom, GroupAtom } from "./atom";

export class OpAtom implements Atom {
  parent: GroupAtom | null = null;
  elem: HTMLSpanElement | null = null;
  kind: AtomKind = "op";
  constructor(public body: string) {}
  toBox(): HBox {
    return new HBox(
      this.body.split("").map((char) => new SymBox(char, ["Main-R"])),
      this
    );
  }
}
