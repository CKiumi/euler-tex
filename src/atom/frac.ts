import { multiplyBox, VBox } from "../box/box";
import {
  DISPLAY,
  Options,
  SCRIPT,
  SCRIPTSCRIPT,
  Style,
  TEXT,
} from "../box/style";
import { AtomKind, getSigma } from "../font";
import { Atom, MathAtom, MathGroup, parseLine } from "./atom";

export class FracAtom implements MathAtom {
  parent: MathGroup | null = null;
  kind: AtomKind = "ord";
  elem: HTMLSpanElement | null = null;
  constructor(public numer: MathGroup, public denom: MathGroup) {}

  children(): Atom[] {
    return [...this.denom.children(), ...this.numer.children(), this];
  }

  serialize() {
    return `\\frac{${this.numer.serialize()}}{${this.denom.serialize()}}`;
  }

  toBox(options: Options): VBox {
    const style = adjustStyle(options.style.id, options.style);
    this.denom.parent = this.numer.parent = this;
    const { numer, denom } = this;
    const numOptions = options?.getNewOptions(style.fracNum());
    const denOptions = options?.getNewOptions(style.fracDen());
    const numBox = multiplyBox(
      numer.toBox(numOptions),
      numOptions.sizeMultiplier / options.sizeMultiplier
    );
    const denBox = multiplyBox(
      denom.toBox(denOptions),
      denOptions.sizeMultiplier / options.sizeMultiplier
    );
    const height = getSigma("defaultRuleThickness", options.size);
    const rule = parseLine();
    const ruleWidth = height;
    const ruleSpacing = height;

    // Rule 15b
    let numShift;
    let clearance;
    let denomShift;

    if (style.size === DISPLAY.size) {
      numShift = getSigma("num1", options.size);
      if (ruleWidth > 0) {
        clearance = 3 * ruleSpacing;
      } else {
        clearance = 7 * ruleSpacing;
      }
      denomShift = getSigma("denom1", options.size);
    } else {
      if (ruleWidth > 0) {
        numShift = getSigma("num2", options.size);
        clearance = ruleSpacing;
      } else {
        numShift = getSigma("num3", options.size);
        clearance = 3 * ruleSpacing;
      }
      denomShift = getSigma("denom2", options.size);
    }

    // Rule 15d
    const axisHeight = getSigma("axisHeight", options.size);

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
    const vbox = new VBox([
      { box: numBox, shift: numShift },
      { box: rule, shift: -midShift },
      { box: denBox, shift: -denomShift },
    ]).bind(this);
    vbox.space.left = vbox.space.right = 0.12;
    return vbox;
  }
}

const adjustStyle = (size: number, originalStyle: Style) => {
  // Figure out what style this fraction should be in based on the
  // function used
  let style = originalStyle;
  if (size === 0 || size === 1) {
    // Get display style as a default.
    // If incoming style is sub/sup, use style.text() to get correct size.
    style = style.id >= SCRIPT.id ? style.text() : DISPLAY;
  } else if ((size === 3 || size === 4) && style.size === DISPLAY.size) {
    // We're in a \tfrac but incoming style is displaystyle, so:
    style = TEXT;
  } else if (size === 5 || size === 6) {
    style = SCRIPT;
  } else if (size === 7 || size === 8) {
    style = SCRIPTSCRIPT;
  }
  return style;
};
