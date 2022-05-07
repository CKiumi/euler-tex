import { SqrtBox, SqrtSize } from "../box/box";
import { Atom, parseAtoms } from "./atom";
import { stackLargeDelimiterSequence, traverseSequence } from "./leftright";
import { getSigma } from "/font";
import Style from "/font/src/style";

export interface SqrtAtom extends Atom {
  type: "sqrt";
  body: Atom[];
}

const sizeToMaxHeight = [0, 1.2, 1.8, 2.4, 3.0];
export const parseSqrt = (atom: SqrtAtom): SqrtBox => {
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
  return {
    size: type,
    width: totalWidth,
    height: totalHeight,
    depth: delimDepth,
    shift: -imgShift,
    innerHeight: minDelimiterHeight,
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
  let sizeMultiplier = 1;
  const extraViniculum = Math.max(0, 0 - getSigma("sqrtRuleThickness"));
  const ruleWidth =
    (getSigma("sqrtRuleThickness") + extraViniculum) * sizeMultiplier;

  if (delim.type === "small") {
    if (height < 1.0) sizeMultiplier = 1.0;
    else if (height < 1.4) sizeMultiplier = 0.7;
    return {
      type: "small",
      totalWidth: width,
      totalHeight: (1.0 + extraViniculum) / sizeMultiplier,
      ruleWidth,
    };
  } else if (delim.type === "large") {
    return {
      type: delim.size,
      totalWidth: width,
      totalHeight:
        (sizeToMaxHeight[delim.size] + extraViniculum) / sizeMultiplier,
      ruleWidth,
    };
  } else {
    return {
      type: "Tall",
      totalWidth: width,
      totalHeight: height + extraViniculum,
      ruleWidth,
    };
  }
};
