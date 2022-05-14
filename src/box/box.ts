import { Atom, FirstAtom, Font, getCharMetrics, getSigma, SPEC } from "../lib";
import { PathNode, SvgNode, innerPath, sqrtSvg } from "../html";
import { em } from "../util";

type Space = { left?: number; right?: number; top?: number; bottom?: number };
type Rect = { height: number; depth: number; width: number };

export interface Box {
  rect: Rect;
  space: Space;
  multiplier?: number;
  atom?: Atom;
  toHtml(): HTMLSpanElement;
}

export class RectBox implements Box {
  space: Space = {};
  constructor(
    public rect: Rect,
    public atom?: Atom,
    public multiplier?: number
  ) {}
  toHtml(): HTMLSpanElement {
    const span = document.createElement("span");
    if (this.atom) this.atom.elem = span;
    if (this.atom instanceof FirstAtom) return span;
    addSpace(span, this);
    span.style.height = em(this.rect.height);
    span.style.background = "black";
    span.style.width = "100%";
    return span;
  }
}

export class SymBox implements Box {
  rect: Rect;
  italic: number;
  space: Space = {};
  constructor(
    public char: string,
    public font: Font,
    public atom?: Atom,
    public multiplier?: number
  ) {
    const { depth, height, italic, width } = getCharMetrics(char, font);
    this.rect = { width: width + italic, height, depth };
    this.italic = italic;
  }
  toHtml(): HTMLSpanElement {
    const { char, font, rect, italic } = this;
    const { height, depth } = rect;
    const span = document.createElement("span");
    addSpace(span, this);
    span.innerText = char;
    span.classList.add("box", font.toLowerCase());
    span.style.height = em(height + depth);
    if (italic) span.style.paddingRight = em(italic);
    span.style.lineHeight = em(
      (height + (SPEC[font].descent - SPEC[font].ascent) / 2) * 2
    );
    if (this.atom) this.atom.elem = span;
    return span;
  }
}

export class HBox implements Box {
  rect: Rect;
  space: Space = {};
  constructor(
    public children: Box[],
    public atom?: Atom,
    public multiplier?: number
  ) {
    const width = children.reduce(
      (t, a) => t + a.rect.width + (a.space.left ?? 0),
      0
    );
    const depth = Math.max(
      ...children.map((child) => child.rect.depth + (child.space.bottom ?? 0))
    );
    const height = Math.max(
      ...children.map((child) => child.rect.height + (child.space.top ?? 0))
    );
    this.rect = { depth, height, width };
  }
  toHtml(): HTMLSpanElement {
    const span = document.createElement("span");
    addSpace(span, this);
    span.classList.add("hbox");
    this.children.forEach((box) => {
      span.append(box.toHtml());
    });
    if (this.multiplier) span.style.fontSize = em(this.multiplier);
    if (this.atom) this.atom.elem = span;
    return span;
  }
}

export class VBox implements Box {
  rect: Rect;
  space: Space = {};
  constructor(
    public children: { box: Box; shift: number }[],
    public atom?: Atom,
    public multiplier?: number,
    public align?: string
  ) {
    const depth = Math.max(
      ...children.map(({ shift, box: { rect } }) => rect.depth - shift)
    );
    const height = Math.max(
      ...children.map(({ shift, box: { rect } }) => shift + rect.height)
    );
    const width = children.reduce((t, { box: { rect } }) => t + rect.width, 0);
    this.rect = { depth, height, width };
  }
  toHtml(): HTMLSpanElement {
    const span = document.createElement("span");
    addSpace(span, this);
    let stackHeight = 0;
    this.children
      .slice()
      .reverse()
      .forEach(({ box, shift }) => {
        const { rect } = box;
        const html = box.toHtml();
        span.append(html);
        const multiplier = parseFloat(html.style.fontSize.slice(0, -2) || "1");
        html.style.bottom = em(
          (this.rect.depth - stackHeight - rect.depth + shift) / multiplier
        );
        stackHeight += rect.depth + rect.height;
      });
    const oldDepth = this.children[this.children.length - 1].box.rect.depth;
    span.classList.add("vlist");
    span.style.height = em(this.rect.height + this.rect.depth);
    if (this.align) span.style.alignItems = this.align;
    span.style.verticalAlign = em(-this.rect.depth + oldDepth);
    if (this.atom) this.atom.elem = span;
    return span;
  }
}

export class VStackBox implements Box {
  rect: Rect;
  space: Space = {};
  shift: number;
  constructor(
    public children: Box[],
    public newDepth: number,
    public atom?: Atom,
    public multiplier?: number,
    public align?: string
  ) {
    const height =
      children
        .map(({ rect }) => rect.height + rect.depth)
        .reduce((t, a) => t + a, 0) - newDepth;
    const width = Math.max(...children.map(({ rect }) => rect.width));
    const revChildren = children.slice().reverse();
    const oldDepth =
      revChildren[0].rect.depth + (revChildren[0].space?.bottom ?? 0);
    this.rect = { depth: newDepth, height, width };
    this.shift = -(newDepth - oldDepth);
  }
  toHtml(): HTMLSpanElement {
    const span = document.createElement("span");
    addSpace(span, this);
    span.classList.add("vlist");
    this.children
      .slice()
      .reverse()
      .forEach((child) => span.append(child.toHtml()));
    span.style.verticalAlign = em(this.shift);
    if (this.atom) this.atom.elem = span;
    return span;
  }
}

export class DelimInnerBox implements Box {
  space: Space = {};
  multiplier?: number | undefined;
  constructor(public repeat: "⎜" | "⎟", public rect: Rect) {}
  toHtml(): HTMLSpanElement {
    const span = document.createElement("span");
    addSpace(span, this);
    const {
      rect: { height, width },
    } = this;
    const path = new PathNode(
      "inner",
      innerPath(this.repeat, Math.round(1000 * height))
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
  }
}

export class SqrtBox implements Box {
  space: Space = {};
  multiplier?: number | undefined;
  constructor(
    public size: 1 | 2 | 3 | 4 | "small" | "Tall",
    public shift: number,
    public innerHeight: number,
    public rect: Rect,
    public atom?: Atom
  ) {}
  toHtml(): HTMLSpanElement {
    const sizeToMaxHeight = [0, 1.2, 1.8, 2.4, 3.0];
    const span = document.createElement("span");
    addSpace(span, this);
    const { width } = this.rect;
    const { innerHeight: height } = this;
    let sizeMultiplier = 1;
    const extraViniculum = Math.max(0, 0 - getSigma("sqrtRuleThickness"));
    let spanHeight = 0;
    let viewBoxHeight = 0;
    if (this.size === "small") {
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
      this.size === 1 ||
      this.size === 2 ||
      this.size === 3 ||
      this.size === 4
    ) {
      viewBoxHeight = 1000 * sizeToMaxHeight[this.size];
      spanHeight =
        (sizeToMaxHeight[this.size] + extraViniculum) / sizeMultiplier;
      span.innerHTML = sqrtSvg(
        "sqrtSize" + this.size,
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
    if (this.atom) this.atom.elem = span;
    return span;
  }
}

export type SqrtSize = 1 | 2 | 3 | 4 | "small" | "Tall";

export const multiplyBox = (box: Box, multiplier: number): Box => {
  box.rect = {
    height: box.rect.height * multiplier,
    depth: box.rect.depth * multiplier,
    width: box.rect.width * multiplier,
  };
  box.multiplier = multiplier;
  return box;
};

const addSpace = (span: HTMLSpanElement, box: Box) => {
  span.style.marginLeft = em(box.space.left);
  span.style.marginRight = em(box.space.right);
  span.style.marginBottom = em(box.space.bottom);
  span.style.marginTop = em(box.space.top);
};
