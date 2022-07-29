import { Box, DelimInnerBox, HBox, SymBox, VStackBox } from "../box/box";
import { getCharMetrics, getSigma } from "../font";
import METRICS from "../font/data";
import Style, { StyleInterface } from "../font/style";
import { AtomKind, Font } from "../lib";
import { Atom, GroupAtom, SymAtom } from "./atom";

export class LRAtom implements Atom {
  parent: GroupAtom | null = null;
  kind: AtomKind;
  left: SymAtom;
  right: SymAtom;
  elem: HTMLSpanElement | null = null;
  constructor(left: string, right: string, public body: GroupAtom) {
    this.kind = "inner";
    this.left = new SymAtom("open", left, ["Main-R"]);
    this.right = new SymAtom("open", right, ["Main-R"]);
  }
  toBox(): HBox {
    this.body.parent = this;
    const { left, right, body } = this;
    const innerBox = body.toBox();
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
    return new HBox([leftBox, innerBox, rightBox], this);
  }
}

export const makeLeftRightDelim = function (
  delim: string,
  height: number,
  depth: number
) {
  // We always center \left/\right delimiters, so the axis is always shifted
  const axisHeight = getSigma("axisHeight") * 1;

  // Taken from TeX source, tex.web, function make_left_right
  const delimiterFactor = 901;
  const delimiterExtend = 5.0 / getSigma("ptPerEm");

  const maxDistFromAxis = Math.max(height - axisHeight, depth + axisHeight);

  const totalHeight = Math.max(
    (maxDistFromAxis / 500) * delimiterFactor,
    2 * maxDistFromAxis - delimiterExtend
  );
  return makeCustomSizedDelim(delim, totalHeight);
};

const makeCustomSizedDelim = (delim: string, height: number): Box => {
  let sequence: Delimiter[];
  if (stackNeverDelimiters.indexOf(delim) !== -1) {
    sequence = stackNeverDelimiterSequence;
  } else if (stackLargeDelimiters.indexOf(delim) !== -1) {
    sequence = stackLargeDelimiterSequence;
  } else {
    sequence = stackAlwaysDelimiterSequence;
  }
  const delimType = traverseSequence(delim, height, sequence);
  if (delimType.type === "small") {
    return makeSmallDelim(delim);
  } else if (delimType.type === "large") {
    return makeLargeDelim(delim, delimType.size);
  } else {
    return makeStackedDelim(delim, height);
  }
};

const stackNeverDelimiterSequence: Delimiter[] = [
  { type: "small", style: Style.SCRIPTSCRIPT },
  { type: "small", style: Style.SCRIPT },
  { type: "small", style: Style.TEXT },
  { type: "large", size: 1 },
  { type: "large", size: 2 },
  { type: "large", size: 3 },
  { type: "large", size: 4 },
];

// There are three kinds of delimiters, delimiters that stack when they become
// too large
const stackLargeDelimiters = [
  "(",
  "\\lparen",
  ")",
  "\\rparen",
  "[",
  "\\lbrack",
  "]",
  "\\rbrack",
  "{",
  "\\lbrace",
  "}",
  "\\rbrace",
  "\\lfloor",
  "\\rfloor",
  "\u230a",
  "\u230b",
  "\\lceil",
  "\\rceil",
  "\u2308",
  "\u2309",
  "\\surd",
];

// and delimiters that never stack
const stackNeverDelimiters = [
  "⟨",
  "⟩",
  "\\langle",
  "\\rangle",
  "/",
  "\\backslash",
  "\\lt",
  "\\gt",
];

// Delimiters that always stack try the small delimiters first, then stack
const stackAlwaysDelimiterSequence: Delimiter[] = [
  { type: "small", style: Style.SCRIPTSCRIPT },
  { type: "small", style: Style.SCRIPT },
  { type: "small", style: Style.TEXT },
  { type: "stack" },
];

export const stackLargeDelimiterSequence: Delimiter[] = [
  { type: "small", style: Style.SCRIPTSCRIPT },
  { type: "small", style: Style.SCRIPT },
  { type: "small", style: Style.TEXT },
  { type: "large", size: 1 },
  { type: "large", size: 2 },
  { type: "large", size: 3 },
  { type: "large", size: 4 },
  { type: "stack" },
];
type Delimiter =
  | { type: "small"; style: StyleInterface }
  | { type: "large"; size: 1 | 2 | 3 | 4 }
  | { type: "stack" };
export const traverseSequence = function (
  delim: string,
  height: number,
  sequence: Delimiter[]
): Delimiter {
  const start = Math.min(2, 3);
  for (let i = start; i < sequence.length; i++) {
    if (sequence[i].type === "stack") break;

    const metrics = getCharMetrics(delim, [delimTypeToFont(sequence[i])]);
    const heightDepth = metrics.height + metrics.depth;
    if (heightDepth > height) return sequence[i];
  }
  return sequence[sequence.length - 1];
};

const delimTypeToFont = function (type: Delimiter): Font {
  if (type.type === "small") {
    return "Main-R";
  } else if (type.type === "large") {
    return ("Size" + type.size) as Font;
  } else if (type.type === "stack") {
    return "Size4";
  } else {
    throw new Error(`Add support for delim type '${type}' here.`);
  }
};

const makeSmallDelim = (delim: string): SymBox => {
  return new SymAtom("open", delim, ["Main-R"]).toBox();
};

const makeLargeDelim = (delim: string, size: number): SymBox => {
  return new SymAtom("open", delim, [("Size" + size) as Font]).toBox();
};
const verts = ["∣", "\\lvert", "\\rvert", "\\vert"];
export const makeStackedDelim = function (
  delim: string,
  heightTotal: number
): VStackBox {
  // There are four parts, the top, an optional middle, a repeated part, and a
  // bottom.
  let top;
  let repeat;
  let bottom;
  let middle = null;
  top = repeat = bottom = delim;
  let font: Font = "Size1";
  if (delim === "(") {
    top = "⎛";
    repeat = "⎜";
    bottom = "⎝";
    font = "Size4";
  } else if (delim === ")") {
    top = "⎞";
    repeat = "⎟";
    bottom = "⎠";
    font = "Size4";
  } else if (delim === "{" || delim === "\\lbrace") {
    top = "\u23a7";
    middle = "\u23a8";
    bottom = "\u23a9";
    repeat = "\u23aa";
    font = "Size4";
  } else if (delim === "}" || delim === "\\rbrace") {
    top = "\u23ab";
    middle = "\u23ac";
    bottom = "\u23ad";
    repeat = "\u23aa";
    font = "Size4";
  } else if (delim === "[" || delim === "\\lbrack") {
    top = "\u23a1";
    repeat = "\u23a2";
    bottom = "\u23a3";
    font = "Size4";
  } else if (delim === "]" || delim === "\\rbrack") {
    top = "\u23a4";
    repeat = "\u23a5";
    bottom = "\u23a6";
    font = "Size4";
  } else if (verts.indexOf(delim) !== -1) {
    repeat = "∣";
  }
  const topMetrics = getCharMetrics(top, [font]);
  const topHeightTotal = topMetrics.height + topMetrics.depth;
  const repeatMetrics = getCharMetrics(repeat, [font]);
  const repeatHeightTotal = repeatMetrics.height + repeatMetrics.depth;
  const bottomMetrics = getCharMetrics(bottom, [font]);
  const bottomHeightTotal = bottomMetrics.height + bottomMetrics.depth;
  let middleHeightTotal = 0;
  let middleFactor = 1;
  if (middle !== null) {
    const middleMetrics = getCharMetrics(middle, [font]);
    middleHeightTotal = middleMetrics.height + middleMetrics.depth;
    middleFactor = 2; // repeat symmetrically above and below middle
  }
  const minHeight = topHeightTotal + bottomHeightTotal + middleHeightTotal;

  // Compute the number of copies of the repeat symbol we will need
  const repeatCount = Math.max(
    0,
    Math.ceil((heightTotal - minHeight) / (middleFactor * repeatHeightTotal))
  );

  // Compute the total height of the delimiter including all the symbols
  const realHeightTotal =
    minHeight + repeatCount * middleFactor * repeatHeightTotal;

  const axisHeight = getSigma("axisHeight");
  const depth = realHeightTotal / 2 - axisHeight;
  if (middle === null) {
    const innerHeight =
      realHeightTotal - topHeightTotal - bottomHeightTotal + 2 * lapInEms;
    return new VStackBox(
      [
        new SymAtom("ord", top, [font]).toBox(),
        new DelimInnerBox(repeat, {
          width: METRICS[font][repeat.charCodeAt(0)][4],
          height: innerHeight,
          depth: 0,
        }),
        new SymAtom("open", bottom, [font]).toBox(),
      ],
      depth
    );
  } else {
    const innerHeight =
      (realHeightTotal -
        topHeightTotal -
        bottomHeightTotal -
        middleHeightTotal) /
        2 +
      2 * lapInEms;

    return new VStackBox(
      [
        new SymAtom("ord", top, [font]).toBox(),
        new DelimInnerBox(repeat, {
          width: METRICS[font][repeat.charCodeAt(0)][4],
          height: innerHeight,
          depth: 0,
        }),
        new SymAtom("ord", middle, [font]).toBox(),
        new DelimInnerBox(repeat, {
          width: METRICS[font][repeat.charCodeAt(0)][4],
          height: innerHeight,
          depth: 0,
        }),
        new SymAtom("open", bottom, [font]).toBox(),
      ],
      depth
    );
  }
};

const lapInEms = 0.008;
