import { Box, DelimInnerBox, SymBox, VStackBox } from "../box/box";
import { SymAtom } from "./atom";
import { getCharMetrics, getSigma } from "/font";
import METRICS from "/font/src/data";
import { Font } from "/font/src/spec";
import Style, { StyleInterface } from "/font/src/style";

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
  const sequence = stackLargeDelimiterSequence as Delimiter[];
  const delimType = traverseSequence(delim, height, sequence);
  if (delimType.type === "small") {
    return makeSmallDelim(delim);
  } else if (delimType.type === "large") {
    return makeLargeDelim(delim, delimType.size);
  } else {
    return makeStackedDelim(delim, height);
  }
};

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
    const metrics = getCharMetrics(delim, delimTypeToFont(sequence[i]));
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
  return new SymAtom("open", delim, "Main-R").parse();
};

const makeLargeDelim = (delim: string, size: number): SymBox => {
  return new SymAtom("open", delim, ("Size" + size) as Font).parse();
};

export const makeStackedDelim = function (
  delim: string,
  heightTotal: number
): VStackBox {
  // There are four parts, the top, an optional middle, a repeated part, and a
  // bottom.
  let top;
  let repeat: "⎜" | "⎟" = "⎜";
  let bottom;
  top = bottom = delim;
  if (delim === "(") {
    top = "⎛";
    repeat = "⎜";
    bottom = "⎝";
  } else if (delim === ")") {
    top = "⎞";
    repeat = "⎟";
    bottom = "⎠";
  }
  const font = "Size4";
  const topMetrics = getCharMetrics(top, font);
  const topHeightTotal = topMetrics.height + topMetrics.depth;
  const repeatMetrics = getCharMetrics(repeat, font);
  const repeatHeightTotal = repeatMetrics.height + repeatMetrics.depth;
  const bottomMetrics = getCharMetrics(bottom, font);
  const bottomHeightTotal = bottomMetrics.height + bottomMetrics.depth;
  const middleHeightTotal = 0;
  const middleFactor = 1;
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
  const innerHeight =
    realHeightTotal - topHeightTotal - bottomHeightTotal + 2 * lapInEms;
  return new VStackBox(
    [
      new SymAtom("ord", top, "Size4").parse(),
      new DelimInnerBox(repeat, {
        width: METRICS["Size4"][repeat.charCodeAt(0)][4],
        height: innerHeight,
        depth: 0,
      }),
      new SymAtom("open", bottom, "Size4").parse(),
    ],
    depth
  );
};

const lapInEms = 0.008;
