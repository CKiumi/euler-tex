import { VStackBox } from "../box/box";
import { Options } from "../box/style";
import { AtomKind, getSigma } from "../lib";
import { Atom, SymAtom, parseLine, MathGroup } from "./atom";

export class AccentAtom implements Atom {
  parent: MathGroup | null = null;
  elem: HTMLSpanElement | null = null;
  kind: AtomKind = "ord";
  constructor(public body: MathGroup, public accent: SymAtom) {}

  children(): Atom[] {
    return [...this.body.children(), this];
  }

  serialize(): string {
    return this.body.serialize();
  }

  toBox(options: Options): VStackBox {
    this.body.parent = this;
    const { body, accent } = this;
    const [box, accBox] = [
      body.toBox(options?.getNewOptions(options.style.cramp())),
      accent.toBox(),
    ];
    const clearance = Math.min(box.rect.height, getSigma("xHeight"));
    accBox.space.bottom = -clearance;
    return new VStackBox([accBox, box], box.rect.depth).bind(this);
  }
}

export class OverlineAtom implements Atom {
  parent: MathGroup | null = null;
  elem: HTMLSpanElement | null = null;
  kind: AtomKind = "ord";
  constructor(public body: MathGroup) {
    body.parent = this;
  }

  children(): Atom[] {
    return [...this.body.children(), this];
  }

  serialize() {
    return `\\overline{${this.body.serialize()}}`;
  }

  toBox(options: Options): VStackBox {
    const { body } = this;
    const accBox = parseLine();
    const box = body.toBox(options?.getNewOptions(options.style.cramp()));
    const defaultRuleThickness = getSigma("defaultRuleThickness");
    accBox.space.top = defaultRuleThickness;
    accBox.space.bottom = 3 * defaultRuleThickness;
    return new VStackBox([accBox, box], box.rect.depth).bind(this);
  }
}
