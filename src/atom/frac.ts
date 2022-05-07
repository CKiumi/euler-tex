import { VBox } from "../box/box";
import { Atom, LineAtom, parseAtom, parseAtoms } from "./atom";
import { getSigma } from "/font";

export interface FracAtom extends Atom {
  type: "frac";
  numer: Atom[];
  denom: Atom[];
}

export const parseFrac = (atom: FracAtom): VBox => {
  // Fractions are handled in the TeXbook on pages 444-445, rules 15(a-e).
  const { numer, denom } = atom;
  const numBox = parseAtoms(numer);
  const denBox = parseAtoms(denom);

  const height = getSigma("defaultRuleThickness");
  const line: LineAtom = { type: "line", kind: "ord" };
  const rule = parseAtom(line);
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

  if (axisHeight - 0.5 * ruleWidth - (denBox.height - denomShift) < clearance) {
    denomShift +=
      clearance - (axisHeight - 0.5 * ruleWidth - (denBox.height - denomShift));
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
};
