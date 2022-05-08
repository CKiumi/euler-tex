import { SqrtSize } from "../box/box";
import { stackLargeDelimiterSequence, traverseSequence } from "./leftright";
import { getSigma } from "/font";

const sizeToMaxHeight = [0, 1.2, 1.8, 2.4, 3.0];

export const sqrtImage = (
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
