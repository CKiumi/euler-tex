import { VStackBox } from "../box/box";
import { AtomKind, getSigma } from "../lib";
import { Atom, SymAtom, parseLine, GroupAtom } from "./atom";

export class AccentAtom implements Atom {
  parent: GroupAtom | null = null;
  elem: HTMLSpanElement | null = null;
  kind: AtomKind = "ord";
  constructor(public body: GroupAtom, public accent: SymAtom) {}
  toBox(): VStackBox {
    this.body.parent = this;
    const { body, accent } = this;
    const [box, accBox] = [body.toBox(), accent.toBox()];
    const clearance = Math.min(box.rect.height, getSigma("xHeight"));
    accBox.space.bottom = -clearance;
    return new VStackBox([accBox, box], box.rect.depth, this);
  }
}

export class OverlineAtom implements Atom {
  parent: GroupAtom | null = null;
  elem: HTMLSpanElement | null = null;
  kind: AtomKind = "ord";
  constructor(public body: GroupAtom) {
    body.parent = this;
  }
  toBox(): VStackBox {
    const { body } = this;
    const accBox = parseLine();
    const box = body.toBox();
    const defaultRuleThickness = getSigma("defaultRuleThickness");
    accBox.space.top = defaultRuleThickness;
    accBox.space.bottom = 3 * defaultRuleThickness;
    return new VStackBox([accBox, box], box.rect.depth, this);
  }
}
