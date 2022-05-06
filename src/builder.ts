import { Box, HBox, SymBox, VStackBox } from "./box";
import { em } from "./util";
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
  return span;
};

export const buildBox = (box: Box): HTMLSpanElement => {
  if ((box as SymBox).char) {
    return buildSymBox(box as SymBox);
  }
  if ((box as VStackBox).shift) {
    return buildVBox(box as VStackBox);
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
