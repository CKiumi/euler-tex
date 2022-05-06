import { HBox, SymBox } from "./box";
import { em } from "./util";
import { SPEC } from "/font/src/spec";

export const buildHBox = (hbox: HBox) => {
  const span = document.createElement("span");
  span.classList.add("hbox");
  hbox.children.forEach((box) => {
    span.append(buildSymBox(box as SymBox));
  });
  return span;
};

export const buildSymBox = ({
  char,
  font,
  height,
  depth,
  italic,
  spacing,
}: SymBox): HTMLSpanElement => {
  const span = document.createElement("span");
  span.innerText = char;
  span.classList.add("box", font.toLowerCase());
  span.style.height = em(height + depth);
  if (italic) {
    span.style.paddingRight = em(italic);
  }
  if (spacing) {
    span.style.marginLeft = em(spacing);
  }
  span.style.lineHeight = em(
    (height + (SPEC[font].descent - SPEC[font].ascent) / 2) * 2
  );
  return span;
};
