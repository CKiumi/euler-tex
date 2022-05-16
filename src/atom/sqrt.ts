import { SqrtBox, SqrtSize, VBox } from "../box/box";
import { AtomKind, getSigma } from "../font";
import Style from "../font/style";
import { Atom, GroupAtom } from "./atom";
import { stackLargeDelimiterSequence, traverseSequence } from "./leftright";

export class SqrtAtom implements Atom {
  parent: GroupAtom | null = null;
  kind: AtomKind;
  elem: HTMLSpanElement | null = null;
  constructor(public body: GroupAtom) {
    this.kind = "ord";
  }
  toBox(): VBox {
    this.body.parent = this;
    const inner = this.body.toBox();
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
    return new VBox(
      [
        { box: sqrtBox, shift: 0 },
        { box: inner, shift: 0 },
      ],
      this
    );
  }
}

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
