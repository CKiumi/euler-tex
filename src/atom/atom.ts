import {
  Box,
  HBox,
  SqrtBox,
  SymBox,
  toVBox,
  VBox,
  VStackBox,
} from "./../box/box";
import { makeLeftRightDelim } from "./leftright";
import { sqrtImage } from "./sqrt";
import { getCharMetrics, getSigma, getSpacing } from "/font";
import { AtomKind } from "/font/src/sigma";
import { Font } from "/font/src/spec";
import Style from "/font/src/style";

export const parseAtoms = (atoms: Atom[]): HBox => {
  let prevKind: AtomKind | undefined;
  const children = atoms.map((atom) => {
    const box = atom.parse();
    if (prevKind && atom.kind) {
      box.spaceL = getSpacing(prevKind, atom.kind);
    }
    prevKind = atom.kind;
    return box;
  });
  const width = children.reduce((acc, a) => acc + a.width + (a.spaceL ?? 0), 0);
  const depth = Math.max(...children.map((child) => child.depth));
  const height = Math.max(...children.map((child) => child.height));
  return { children, width, height, depth };
};

export interface Atom {
  kind: AtomKind;
  parse(): Box;
}

export class SymAtom implements Atom {
  constructor(public kind: AtomKind, public char: string, public font: Font) {}
  parse(): SymBox {
    const { char, font } = this;
    const { depth, height, italic, width } = getCharMetrics(char, font);
    return { char, font, depth, height, width: width + italic, italic };
  }
}

export class AccentAtom implements Atom {
  constructor(
    public kind: AtomKind,
    public body: SymAtom,
    public accent: SymAtom
  ) {}
  parse(): VStackBox {
    const { body, accent } = this;
    const [box, accBox] = [body.parse(), accent.parse()];
    const clearance = Math.min(box.height, getSigma("xHeight"));
    accBox.spaceB = -clearance;
    return toVBox([accBox, box], box.depth);
  }
}

export class OverlineAtom implements Atom {
  constructor(public kind: AtomKind, public body: SymAtom) {}
  parse(): VStackBox {
    const { body } = this;
    const accBox = parseLine();
    const box = body.parse();
    const defaultRuleThickness = getSigma("defaultRuleThickness");
    accBox.spaceT = defaultRuleThickness;
    accBox.spaceB = 3 * defaultRuleThickness;
    return toVBox([accBox, box], box.depth);
  }
}

export class LRAtom implements Atom {
  constructor(
    public kind: AtomKind,
    public left: SymAtom,
    public right: SymAtom,
    public body: Atom[]
  ) {}
  parse(): HBox {
    const { left, right, body } = this;
    const innerBox = parseAtoms(body);
    const leftBox = makeLeftRightDelim(
      left.char,
      innerBox.height,
      innerBox.depth
    );
    const rightBox = makeLeftRightDelim(
      right.char,
      innerBox.height,
      innerBox.depth
    );
    const width = leftBox.width + innerBox.width + rightBox.width;
    return {
      children: [leftBox, innerBox, rightBox],
      width,
      height: leftBox.height,
      depth: leftBox.depth,
    };
  }
}

export class SqrtAtom implements Atom {
  constructor(public kind: AtomKind, public body: Atom[]) {}
  parse(): VBox {
    const inner = parseAtoms(this.body);
    const { width, depth } = inner;
    let { height } = inner;
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
    const sqrtBox: SqrtBox = {
      size: type,
      width: totalWidth,
      height: totalHeight - imgShift,
      depth: imgShift,
      shift: -imgShift,
      innerHeight: minDelimiterHeight,
    };
    inner.spaceL = totalWidth - width;
    return {
      children: [
        { box: sqrtBox, shift: 0 },
        { box: inner, shift: 0 },
      ],
      width: totalWidth,
      height: totalHeight,
      depth: delimDepth,
    };
  }
}

export const parseLine = (): Box => {
  return { width: 0, height: getSigma("defaultRuleThickness"), depth: 0 };
};
