import { Box, HBox, DelimInnerBox, SymBox, VStackBox } from "../box/box";
import { innerPath } from "./svg/inner";
import { PathNode, SvgNode } from "./svg/pathNode";
import { em } from "../util";
import { SPEC } from "/font/src/spec";

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
