import { AtomKind } from "../font";
import { HBox, SymBox } from "../lib";
import { OP } from "../parser/command";
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
    return OP.includes("\\" + this.body)
      ? "\\" + this.body + " "
      : "\\operatorname{" + this.body + "}";
  }

  toBox(): HBox {
    return new HBox(
      this.body.split("").map((char) => new SymBox(char, ["Main-R"]))
    ).bind(this);
  }
}
