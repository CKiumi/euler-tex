import { Box, DelimInnerBox, HBox, SymBox, VStackBox } from "../box/box";
import { em } from "../util";
import { SqrtBox, VBox } from "./../box/box";
import { innerPath } from "./svg/inner";
import { PathNode, SvgNode } from "./svg/pathNode";
import { sqrtSvg } from "./svg/sqrt";
import { getSigma } from "/font";
import { SPEC } from "/font/src/spec";

export const buildVStackBox = (span: HTMLSpanElement, vBox: VStackBox) => {
  span.classList.add("vlist");
  vBox.children
    .slice()
    .reverse()
    .forEach((child) => span.append(buildBox(child)));
  span.style.verticalAlign = em(vBox.shift);
  return span;
};

export const buildHBox = (span: HTMLSpanElement, hbox: HBox) => {
  span.classList.add("hbox");
  hbox.children.forEach((box) => {
    span.append(buildBox(box));
  });
  if (hbox.multiplier) span.style.fontSize = em(hbox.multiplier);
  return span;
};

export const buildBox = (box: Box): HTMLSpanElement => {
  const span = document.createElement("span");
  span.style.marginLeft = em(box.spaceL);
  span.style.marginRight = em(box.spaceR);
  span.style.marginBottom = em(box.spaceB);
  span.style.marginTop = em(box.spaceT);
  if ((box as SymBox).char) {
    return buildSymBox(span, box as SymBox);
  }
  if ((box as SqrtBox).size) {
    return buildSqrtBox(span, box as SqrtBox);
  }
  if ((box as VBox).children && (box as VBox).children[0].box !== undefined) {
    return buildVBox(span, box as VBox);
  }
  if ((box as VStackBox).shift !== undefined) {
    return buildVStackBox(span, box as VStackBox);
  }
  if ((box as HBox).children) {
    return buildHBox(span, box as HBox);
  }
  if ((box as DelimInnerBox).repeat) {
    return buildDelimInnerBox(span, box as DelimInnerBox);
  }
  span.style.height = em(box.height);
  span.style.background = "black";
  span.style.width = "100%";
  return span;
};

export const buildSymBox = (
  span: HTMLSpanElement,
  { char, font, height, depth, italic }: SymBox
): HTMLSpanElement => {
  span.innerText = char;
  span.classList.add("box", font.toLowerCase());
  span.style.height = em(height + depth);
  if (italic) span.style.paddingRight = em(italic);
  span.style.lineHeight = em(
    (height + (SPEC[font].descent - SPEC[font].ascent) / 2) * 2
  );
  return span;
};

export const buildVBox = (
  span: HTMLSpanElement,
  { children, align }: VBox
): HTMLSpanElement => {
  const depth = Math.min(
    ...children.map(({ shift, box }) => shift - box.depth)
  );
  const height = Math.max(
    ...children.map(({ shift, box }) => shift + box.height)
  );
  let stackHeight = 0;
  children
    .slice()
    .reverse()
    .forEach(({ box, shift }) => {
      const html = buildBox(box);
      span.append(html);
      const multiplier = parseFloat(html.style.fontSize.slice(0, -2) || "1");
      html.style.bottom = em(
        (-depth - stackHeight - box.depth + shift) / multiplier
      );
      stackHeight += box.depth + box.height;
    });
  const oldDepth = children[children.length - 1].box.depth;
  span.classList.add("vlist");
  span.style.height = em(height - depth);
  if (align) span.style.alignItems = align;
  span.style.verticalAlign = em(depth + oldDepth);
  return span;
};

export const buildDelimInnerBox = (
  span: HTMLSpanElement,
  { height, width, repeat }: DelimInnerBox
) => {
  const path = new PathNode(
    "inner",
    innerPath(repeat, Math.round(1000 * height))
  );
  const svgNode = new SvgNode([path], {
    width: em(width),
    height: em(height),
    style: "width:" + em(width),
    viewBox: "0 0 " + 1000 * width + " " + Math.round(1000 * height),
    preserveAspectRatio: "xMinYMin",
  });
  span.innerHTML = svgNode.toMarkup();
  span.style.height = em(height);
  span.style.width = em(width);
  span.style.background = "green";
  return span;
};

const sizeToMaxHeight = [0, 1.2, 1.8, 2.4, 3.0];

const buildSqrtBox = (span: HTMLSpanElement, box: SqrtBox): HTMLSpanElement => {
  const { width, innerHeight: height } = box;
  let sizeMultiplier = 1;
  const extraViniculum = Math.max(0, 0 - getSigma("sqrtRuleThickness"));
  let spanHeight = 0;
  let viewBoxHeight = 0;
  if (box.size === "small") {
    viewBoxHeight = 1000 + 1000 * extraViniculum;
    if (height < 1.0) sizeMultiplier = 1.0;
    else if (height < 1.4) sizeMultiplier = 0.7;
    spanHeight = (1.0 + extraViniculum) / sizeMultiplier;
    span.innerHTML = sqrtSvg(
      "sqrtMain",
      width,
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
    span.innerHTML = sqrtSvg(
      "sqrtSize" + box.size,
      width,
      spanHeight,
      viewBoxHeight,
      extraViniculum
    );
    span.style.minWidth = "1.02em";
  } else {
    spanHeight = height + extraViniculum;
    viewBoxHeight = Math.floor(1000 * height + extraViniculum);
    span.innerHTML = sqrtSvg(
      "sqrtTall",
      width,
      spanHeight,
      viewBoxHeight,
      extraViniculum
    );
    span.style.minWidth = "0.742em";
  }
  span.style.height = em(spanHeight);
  span.style.background = "#31121355";
  span.style.display = "inline-block";
  return span;
};
