import { SqrtBox } from "./../box/box";
import { Box, HBox, DelimInnerBox, SymBox, VStackBox } from "../box/box";
import { innerPath } from "./svg/inner";
import { PathNode, SvgNode } from "./svg/pathNode";
import { em } from "../util";
import { SPEC } from "/font/src/spec";
import { sqrtSvg } from "./svg/sqrt";
import { getSigma } from "/font";

export const buildVBox = (vBox: VStackBox) => {
  const span = document.createElement("span");
  span.classList.add("vlist");
  vBox.children
    .slice()
    .reverse()
    .forEach((child) => span.append(buildBox(child)));
  span.style.verticalAlign = em(vBox.shift);
  return span;
};

export const buildHBox = (hbox: HBox) => {
  const span = document.createElement("span");
  span.classList.add("hbox");
  hbox.children.forEach((box) => {
    span.append(buildBox(box));
  });
  if (hbox.spacing) span.style.marginLeft = em(hbox.spacing);
  return span;
};

export const buildBox = (box: Box): HTMLSpanElement => {
  if ((box as SymBox).char) {
    return buildSymBox(box as SymBox);
  }
  if ((box as SqrtBox).size) {
    return buildSqrtBox(box as SqrtBox);
  }
  if ((box as VStackBox).shift !== undefined) {
    return buildVBox(box as VStackBox);
  }
  if ((box as HBox).children) {
    return buildHBox(box as HBox);
  }
  if ((box as DelimInnerBox).repeat) {
    return buildDelimInnerBox(box as DelimInnerBox);
  }
  const span = document.createElement("span");
  span.style.height = em(box.height);
  span.style.background = "black";
  span.style.width = "100%";
  span.style.marginBottom = em(box.spacingBelow);
  span.style.marginTop = em(box.spacingTop);
  return span;
};

export const buildSymBox = ({
  char,
  font,
  height,
  depth,
  italic,
  spacing,
  spacingBelow,
  spacingTop,
}: SymBox): HTMLSpanElement => {
  const span = document.createElement("span");
  span.innerText = char;
  span.classList.add("box", font.toLowerCase());
  span.style.height = em(height + depth);
  if (italic) span.style.paddingRight = em(italic);
  if (spacing) span.style.marginLeft = em(spacing);
  if (spacingBelow) span.style.marginBottom = em(spacingBelow);
  if (spacingTop) span.style.marginTop = em(spacingTop);
  span.style.lineHeight = em(
    (height + (SPEC[font].descent - SPEC[font].ascent) / 2) * 2
  );
  return span;
};

export const buildDelimInnerBox = ({
  height,
  width,
  repeat,
}: DelimInnerBox) => {
  const path = new PathNode(
    "inner",
    innerPath(repeat, Math.round(1000 * height))
  );
  const svgNode = new SvgNode([path], {
    width: em(width),
    height: em(height),
    // Override CSS rule `.katex svg { width: 100% }`
    style: "width:" + em(width),
    viewBox: "0 0 " + 1000 * width + " " + Math.round(1000 * height),
    preserveAspectRatio: "xMinYMin",
  });
  const span = document.createElement("span");
  span.innerHTML = svgNode.toMarkup();
  span.style.height = em(height);
  span.style.width = em(width);
  span.style.background = "green";
  return span;
};

const sizeToMaxHeight = [0, 1.2, 1.8, 2.4, 3.0];

const buildSqrtBox = (box: SqrtBox): HTMLSpanElement => {
  const { width, innerHeight: height } = box;
  let sizeMultiplier = 1;
  const extraViniculum = Math.max(0, 0 - getSigma("sqrtRuleThickness"));
  const span = document.createElement("span");
  let spanHeight = 0;
  let viewBoxHeight = 0;
  let advanceWidth;
  if (box.size === "small") {
    viewBoxHeight = 1000 + 1000 * extraViniculum;
    if (height < 1.0) sizeMultiplier = 1.0;
    else if (height < 1.4) sizeMultiplier = 0.7;
    spanHeight = (1.0 + extraViniculum) / sizeMultiplier;
    advanceWidth = 0.777 / sizeMultiplier; // from the font.
    span.innerHTML = sqrtSvg(
      "sqrtMain",
      width + advanceWidth,
      spanHeight,
      viewBoxHeight,
      extraViniculum
    );
    span.style.minWidth = "0.853em";
  } else if (
    box.size === 1 ||
    box.size === 2 ||
    box.size === 3 ||
    box.size === 4
  ) {
    viewBoxHeight = 1000 * sizeToMaxHeight[box.size];
    spanHeight = (sizeToMaxHeight[box.size] + extraViniculum) / sizeMultiplier;
    advanceWidth = 0.95 / sizeMultiplier; // 1.0 from the font.

    span.innerHTML = sqrtSvg(
      "sqrtSize" + box.size,
      advanceWidth + width,
      spanHeight,
      viewBoxHeight,
      extraViniculum
    );
    span.style.minWidth = "1.02em";
  } else {
    spanHeight = height + extraViniculum;
    viewBoxHeight = Math.floor(1000 * height + extraViniculum);
    advanceWidth = 0.67;
    span.innerHTML = sqrtSvg(
      "sqrtTall",
      width + advanceWidth,
      spanHeight,
      viewBoxHeight,
      extraViniculum
    );
    span.style.minWidth = "0.742em";
  }
  span.style.height = em(spanHeight);
  span.style.background = "yellow";
  span.style.display = "inline-block";
  span.style.verticalAlign = em(box.shift);
  return span;
};
