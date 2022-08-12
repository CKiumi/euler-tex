import { VBox } from "../box/box";
import { Options } from "../box/style";
import { AtomKind, getSigma } from "../font";
import { Atom, GroupAtom, parseLine } from "./atom";

export class FracAtom implements Atom {
  parent: GroupAtom | null = null;
  kind: AtomKind = "ord";
  elem: HTMLSpanElement | null = null;
  constructor(public numer: GroupAtom, public denom: GroupAtom) {}
  toBox(options?: Options): VBox {
    this.numer.parent = this;
    this.denom.parent = this;
    const { numer, denom } = this;
    const numOptions = options?.getNewOptions(options.style.fracNum());
    const denOptions = options?.getNewOptions(options.style.fracDen());
    const numBox = numer.toBox(numOptions);
    const denBox = denom.toBox(denOptions);
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

    if (
      numShift - numBox.rect.depth - (axisHeight + 0.5 * ruleWidth) <
      clearance
    ) {
      numShift +=
        clearance -
        (numShift - numBox.rect.depth - (axisHeight + 0.5 * ruleWidth));
    }

    if (
      axisHeight - 0.5 * ruleWidth - (denBox.rect.height - denomShift) <
      clearance
    ) {
      denomShift +=
        clearance -
        (axisHeight - 0.5 * ruleWidth - (denBox.rect.height - denomShift));
    }
    const midShift = -(axisHeight - 0.5 * ruleWidth);
    const vbox = new VBox(
      [
        { box: numBox, shift: numShift },
        { box: rule, shift: -midShift },
        { box: denBox, shift: -denomShift },
      ],
      this
    );
    vbox.space.left = vbox.space.right = 0.12;
    return vbox;
  }
}
