import { CharAtom } from "./atom";
import { em } from "./util";
import { SPEC } from "/font/src/spec";

export const buildCharBox = ({
  italic,
  char,
  font,
  box,
}: CharAtom): HTMLSpanElement => {
  const span = document.createElement("span");
  span.innerText = char;
  span.classList.add("box", font.toLowerCase());
  span.style.height = em(box.height + box.depth);
  span.style.paddingRight = em(italic);
  span.style.lineHeight = em(
    (box.height + (SPEC[font].descent - SPEC[font].ascent) / 2) * 2
  );
  return span;
};
