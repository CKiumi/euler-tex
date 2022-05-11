import {
  Box,
  HBox,
  RectBox,
  SqrtBox,
  SymBox,
  VBox,
  VStackBox,
} from "../box/box";
import { makeLeftRightDelim } from "./leftright";
import { sqrtImage } from "./sqrt";
import { getSigma, getSpacing } from "/font";
import { AtomKind } from "/font/src/sigma";
import { Font } from "/font/src/spec";
import Style from "/font/src/style";

export const parseAtoms = (atoms: Atom[]): HBox => {
  let prevKind: AtomKind | undefined;
  const children = atoms.map((atom) => {
    const box = atom.parse();
    if (prevKind && atom.kind) {
      box.space.left = getSpacing(prevKind, atom.kind);
    }
    prevKind = atom.kind;
    return box;
  });
  return new HBox(children);
};

export interface Atom {
  kind: AtomKind;
  parse(): Box;
}

export class SymAtom implements Atom {
  constructor(public kind: AtomKind, public char: string, public font: Font) {}
  parse(): SymBox {
    const { char, font } = this;
    return new SymBox(char, font);
  }
}

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

export class LRAtom implements Atom {
  kind: AtomKind;
  left: SymAtom;
  right: SymAtom;
  constructor(left: string, right: string, public body: Atom[]) {
    this.kind = "inner";
    this.left = new SymAtom("open", left, "Main-R");
    this.right = new SymAtom("open", right, "Main-R");
  }
  parse(): HBox {
    const { left, right, body } = this;
    const innerBox = parseAtoms(body);
    const leftBox = makeLeftRightDelim(
      left.char,
      innerBox.rect.height,
      innerBox.rect.depth
    );
    const rightBox = makeLeftRightDelim(
      right.char,
      innerBox.rect.height,
      innerBox.rect.depth
    );
    return new HBox([leftBox, innerBox, rightBox]);
  }
}

export class SqrtAtom implements Atom {
  kind: AtomKind;
  constructor(public body: Atom[]) {
    this.kind = "ord";
  }
  parse(): VBox {
    const inner = parseAtoms(this.body);
    const { width, depth } = inner.rect;
    let { height } = inner.rect;
    if (height === 0) height = getSigma("xHeight");
    const theta = getSigma("defaultRuleThickness");
    let phi = theta;
    if (Style.DISPLAY.id < Style.TEXT.id) phi = getSigma("xHeight");
    // Calculate the clearance between the body and line
    let lineClearance = theta + phi / 4;
    const minDelimiterHeight = height + depth + lineClearance + theta;
    // Create a sqrt SVG of the required minimum size
    const { type, totalWidth, ruleWidth, totalHeight } = sqrtImage(
      minDelimiterHeight,
      width
    );
    const delimDepth = totalHeight - ruleWidth;
    if (delimDepth > height + depth + lineClearance) {
      lineClearance = (lineClearance + delimDepth - height - depth) / 2;
    }
    const imgShift = totalHeight - height - lineClearance - ruleWidth;
    const sqrtBox = new SqrtBox(type, -imgShift, minDelimiterHeight, {
      width: totalWidth,
      height: totalHeight - imgShift,
      depth: imgShift,
    });
    inner.space.left = totalWidth - width;
    return new VBox([
      { box: sqrtBox, shift: 0 },
      { box: inner, shift: 0 },
    ]);
  }
}

export const parseLine = (): RectBox => {
  return new RectBox({
    width: 0,
    height: getSigma("defaultRuleThickness"),
    depth: 0,
  });
};
