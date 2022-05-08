import { SqrtBox, SqrtSize, VBox } from "../box/box";
import { Atom, parseAtoms } from "./atom";
import { stackLargeDelimiterSequence, traverseSequence } from "./leftright";
import { getSigma } from "/font";
import Style from "/font/src/style";

export interface SqrtAtom extends Atom {
  type: "sqrt";
  body: Atom[];
}

const sizeToMaxHeight = [0, 1.2, 1.8, 2.4, 3.0];
export const parseSqrt = (atom: SqrtAtom): VBox => {
  const inner = parseAtoms(atom.body);
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
};

const sqrtImage = (
  height: number,
  width: number
): {
  type: SqrtSize;
  ruleWidth: number;
  totalWidth: number;
  totalHeight: number;
} => {
  const delim = traverseSequence("\\surd", height, stackLargeDelimiterSequence);
  const extraViniculum = Math.max(0, 0 - getSigma("sqrtRuleThickness"));
  const ruleWidth = getSigma("sqrtRuleThickness") + extraViniculum;
  if (delim.type === "small") {
    let sizeMultiplier = 1;
    if (height < 1.0) sizeMultiplier = 1.0;
    else if (height < 1.4) sizeMultiplier = 0.7;
    const advanceWidth = 0.777 / sizeMultiplier;
    return {
      type: "small",
      totalWidth: width + advanceWidth,
      totalHeight: (1.0 + extraViniculum) / sizeMultiplier,
      ruleWidth,
    };
  } else if (delim.type === "large") {
    const advanceWidth = 0.95;
    return {
      type: delim.size,
      totalWidth: width + advanceWidth,
      totalHeight: sizeToMaxHeight[delim.size] + extraViniculum,
      ruleWidth,
    };
  } else {
    const advanceWidth = 0.67;
    return {
      type: "Tall",
      totalWidth: width + advanceWidth,
      totalHeight: height + extraViniculum,
      ruleWidth,
    };
  }
};
