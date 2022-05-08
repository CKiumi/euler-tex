import { VBox } from "../box/box";
import { Atom, parseAtoms, parseLine } from "./atom";
import { getSigma } from "/font";
import { AtomKind } from "/font/src/sigma";

export class FracAtom implements Atom {
  constructor(
    public kind: AtomKind,
    public numer: Atom[],
    public denom: Atom[]
  ) {}
  parse(): VBox {
    const { numer, denom } = this;
    const numBox = parseAtoms(numer);
    const denBox = parseAtoms(denom);
    const height = getSigma("defaultRuleThickness");
    const rule = parseLine();
    const ruleWidth = height;
    const ruleSpacing = height;

    // Rule 15b
    let numShift;
    let clearance;
    let denomShift;

    numShift = getSigma("num1");
    if (ruleWidth > 0) {
      clearance = 3 * ruleSpacing;
    } else {
      clearance = 7 * ruleSpacing;
    }
    denomShift = getSigma("denom1");

    // Rule 15d
    const axisHeight = getSigma("axisHeight");

    if (numShift - numBox.depth - (axisHeight + 0.5 * ruleWidth) < clearance) {
      numShift +=
        clearance - (numShift - numBox.depth - (axisHeight + 0.5 * ruleWidth));
    }

    if (
      axisHeight - 0.5 * ruleWidth - (denBox.height - denomShift) <
      clearance
    ) {
      denomShift +=
        clearance -
        (axisHeight - 0.5 * ruleWidth - (denBox.height - denomShift));
    }
    const midShift = -(axisHeight - 0.5 * ruleWidth);

    return {
      children: [
        { box: numBox, shift: numShift },
        { box: rule, shift: -midShift },
        { box: denBox, shift: -denomShift },
      ],
      width: Math.max(numBox.width, denBox.width),
      height: 0,
      depth: 0,
    };
  }
}
