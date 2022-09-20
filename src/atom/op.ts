import { AtomKind } from "../font";
import { HBox, SymBox } from "../lib";
import { MathAtom, MathGroup } from "./atom";

export class OpAtom implements MathAtom {
  parent: MathGroup | null = null;
  elem: HTMLSpanElement | null = null;
  kind: AtomKind = "op";
  constructor(public body: string) {}

  children() {
    return [this];
  }

  serialize() {
    return "\\" + this.body + " ";
  }

  toBox(): HBox {
    return new HBox(
      this.body.split("").map((char) => new SymBox(char, ["Main-R"]))
    ).bind(this);
  }
}
