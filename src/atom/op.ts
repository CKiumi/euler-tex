import { AtomKind } from "../font";
import { HBox, SymBox } from "../lib";
import { Atom, MathGroup } from "./atom";

export class OpAtom implements Atom {
  parent: MathGroup | null = null;
  elem: HTMLSpanElement | null = null;
  kind: AtomKind = "op";
  constructor(public body: string) {}

  children() {
    return [this];
  }

  toBox(): HBox {
    return new HBox(
      this.body.split("").map((char) => new SymBox(char, ["Main-R"]))
    ).bind(this);
  }
}
