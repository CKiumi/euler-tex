import { VStackBox } from "../box/box";
import { AtomKind, getSigma } from "../lib";
import { Atom, parseAtoms, SymAtom, parseLine } from "./atom";

export class AccentAtom implements Atom {
  kind: AtomKind = "ord";
  constructor(public body: Atom[], public accent: SymAtom) {}
  parse(): VStackBox {
    const { body, accent } = this;
    const [box, accBox] = [parseAtoms(body), accent.parse()];
    const clearance = Math.min(box.rect.height, getSigma("xHeight"));
    accBox.space.bottom = -clearance;
    return new VStackBox([accBox, box], box.rect.depth);
  }
}

export class OverlineAtom implements Atom {
  kind: AtomKind = "ord";
  constructor(public body: Atom[]) {}
  parse(): VStackBox {
    const { body } = this;
    const accBox = parseLine();
    const box = parseAtoms(body);
    const defaultRuleThickness = getSigma("defaultRuleThickness");
    accBox.space.top = defaultRuleThickness;
    accBox.space.bottom = 3 * defaultRuleThickness;
    return new VStackBox([accBox, box], box.rect.depth);
  }
}
