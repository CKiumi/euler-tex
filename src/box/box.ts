import { Atom, Font, getCharMetrics, getSigma, MatrixAtom, SPEC } from "../lib";
import { PathNode, SvgNode, innerPath, sqrtSvg, html } from "../html";
import { em } from "../util";
import { ThmData } from "../parser/command";

type Space = { left?: number; right?: number; top?: number; bottom?: number };
type Rect = { height: number; depth: number; width: number };

export interface Box {
  rect: Rect;
  space: Space;
  multiplier?: number;
  atom?: Atom;
  bind: (atom: Atom) => Box;
  toHtml(): HTMLSpanElement;
}

export class RectBox implements Box {
  space: Space = {};
  atom?: Atom;
  constructor(public rect: Rect, public classes: string[]) {
    this.space = { bottom: -rect.depth };
  }

  bind(atom: Atom) {
    this.atom = atom;
    return this;
  }

  toHtml(): HTMLSpanElement {
    const span = document.createElement("span");
    if (this.atom) this.atom.elem = span;
    addSpace(span, this);
    span.style.minHeight = em(this.rect.height + this.rect.depth);
    if (this.rect.width !== 0) {
      span.style.width = this.rect.width + "em";
    } else span.style.width = "100%";
    span.classList.add(...this.classes);
    return span;
  }
}

export class CharBox implements Box {
  space: Space = { left: 0, right: 0, top: 0, bottom: 0 };
  rect: Rect = { height: 0, depth: 0, width: 0 };
  atom?: Atom;
  constructor(public char: string, public font: Font | null) {}

  bind(atom: Atom) {
    this.atom = atom;
    return this;
  }

  toHtml(): HTMLSpanElement {
    const span = document.createElement("span");
    span.innerText = this.char;
    this.font && span.classList.add(this.font.toLowerCase());
    if (this.atom) this.atom.elem = span;
    return span;
  }
}

export interface SymStyle {
  composite?: boolean;
  italic?: boolean;
  bold?: boolean;
  ref?: boolean;
}

export class SymBox implements Box {
  rect: Rect;
  italic: number;
  space: Space = {};
  font: Font;
  atom?: Atom;
  constructor(public char: string, fonts: Font[], public style?: SymStyle) {
    const {
      font: f,
      depth,
      height,
      italic,
      width,
    } = getCharMetrics(char, fonts);
    this.font = f;
    this.rect = { width: width + italic, height, depth };
    this.italic = italic;
    if (this.char === " ") this.space.right = 1;
    if (this.char === "  ") this.space.right = 2;
  }

  bind(atom: Atom) {
    this.atom = atom;
    return this;
  }

  toHtml(): HTMLSpanElement {
    const { char, font, rect, italic } = this;
    const { height, depth } = rect;
    const span = document.createElement("span");
    if (char === "\n") {
      const first = document.createElement("span");
      first.innerHTML = "&#8203;";
      span.append(document.createElement("br"), first);
      this.atom && (this.atom.elem = span);
      return span;
    }
    addSpace(span, this);
    span.innerHTML = char;
    span.classList.add("box", font.toLowerCase());
    span.style.height = em(height + depth);
    if (italic) span.style.paddingRight = em(italic);
    span.style.lineHeight = em(
      (height + (SPEC[font].descent - SPEC[font].ascent) / 2) * 2
    );

    //Deal with unknown error, these character are not contained in the rect
    if (this.char === "⎩" || this.char === "⎭")
      span.style.marginTop = "-0.25em";
    if (this.style?.italic) span.style.fontStyle = "italic";
    if (this.style?.bold) span.style.fontWeight = "bold";
    if (this.style?.composite) span.style.textDecoration = "underline";
    if (this.style?.ref) span.classList.add("ref");
    if (this.atom) this.atom.elem = span;
    return span;
  }
}

export class HBox implements Box {
  rect: Rect;
  space: Space = {};
  atom?: Atom;
  constructor(public children: Box[], public multiplier?: number) {
    const width = children.reduce(
      (t, a) => t + a.rect.width + (a.space.left ?? 0) + (a.space.right ?? 0),
      0
    );
    const depth = Math.max(
      0,
      ...children.map((c) => c.rect.depth + (c.space.bottom ?? 0))
    );
    const height = Math.max(
      0,
      ...children.map((child) => child.rect.height + (child.space.top ?? 0))
    );
    this.rect = { depth, height, width };
  }

  bind(atom: Atom) {
    this.atom = atom;
    return this;
  }

  toHtml(): HTMLSpanElement {
    const span = document.createElement("span");
    span.classList.add("hbox");
    this.children.forEach((box) => {
      span.append(box.toHtml());
    });
    addSpace(span, this);
    if (
      this.atom &&
      this.atom instanceof MatrixAtom &&
      (this.atom.type === "align" || this.atom.type === "align*")
    ) {
      span.classList.add("align");
    }

    if (this.multiplier) {
      span.style.fontSize = em(this.multiplier);
    }
    if (this.atom) this.atom.elem = span;
    return span;
  }
}

export class VBox implements Box {
  rect: Rect;
  space: Space = {};
  tag = false;
  atom?: Atom;
  constructor(
    public children: { box: Box; shift: number }[],
    public multiplier?: number,
    public align?: string
  ) {
    const depth = Math.max(
      ...children.map(({ shift, box }) => box.rect.depth - shift)
    );
    const height = Math.max(
      ...children.map(({ shift, box }) => shift + box.rect.height)
    );
    const width = Math.max(...children.map(({ box: { rect } }) => rect.width));
    this.rect = { depth, height, width };
  }

  bind(atom: Atom) {
    this.atom = atom;
    return this;
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
        html.style.bottom = em(
          (this.rect.depth - stackHeight - rect.depth + shift) /
            (box.multiplier ?? 1)
        );
        stackHeight += rect.depth + rect.height;
      });
    const oldDepth = this.children[this.children.length - 1].box.rect.depth;
    span.classList.add("vlist");

    span.style.height = em(this.rect.height + this.rect.depth);
    if (this.align) span.style.alignItems = this.align;

    span.style.verticalAlign = em(-this.rect.depth + oldDepth);

    if (this.atom) this.atom.elem = span;
    if (this.tag) span.classList.add("tag");
    return span;
  }
}

export class VStackBox implements Box {
  rect: Rect;
  space: Space = {};
  shift: number;
  atom?: Atom;
  constructor(
    public children: Box[],
    public newDepth: number,
    public multiplier?: number,
    public align?: string
  ) {
    const height =
      children
        .map(
          ({ rect, space }) =>
            rect.height + rect.depth + (space.bottom ?? 0) + (space.top ?? 0)
        )
        .reduce((t, a) => t + a, 0) - newDepth;
    const width = Math.max(...children.map(({ rect }) => rect.width));
    const revChildren = children.slice().reverse();
    const oldDepth =
      revChildren[0].rect.depth + (revChildren[0].space?.bottom ?? 0);
    this.rect = { depth: newDepth, height, width };
    this.shift = -(newDepth - oldDepth);
  }

  bind(atom: Atom) {
    this.atom = atom;
    return this;
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

export class ArticleBox implements Box {
  rect: Rect = { depth: 0, height: 0, width: 0 };
  space: Space = { top: 0, bottom: 0, left: 0, right: 0 };
  atom?: Atom | undefined;

  constructor(public children: Box[]) {}

  bind(atom: Atom) {
    this.atom = atom;
    return this;
  }

  toHtml(): HTMLSpanElement {
    const span = document.createElement("span");
    span.classList.add("text");
    this.children.forEach((box) => {
      span.append(box.toHtml());
    });
    if (this.atom) this.atom.elem = span;
    return span;
  }
}

export class InlineBox implements Box {
  rect: Rect = { depth: 0, height: 0, width: 0 };
  space: Space = { top: 0, bottom: 0, left: 0, right: 0 };
  atom?: Atom;

  constructor(public children: Box[]) {}

  bind(atom: Atom) {
    this.atom = atom;
    return this;
  }

  toHtml(): HTMLSpanElement {
    const span = document.createElement("span");
    span.classList.add("inline");
    this.children.forEach((box) => {
      span.append(box.toHtml());
    });
    if (this.children.length === 1) {
      const space = document.createElement("span");
      space.innerHTML = "&nbsp;";
      span.append(space);
    }
    if (this.atom) this.atom.elem = span;
    return span;
  }
}

export class DisplayBox implements Box {
  rect: Rect = { depth: 0, height: 0, width: 0 };
  space: Space = { top: 0, bottom: 0, left: 0, right: 0 };
  atom?: Atom | undefined;

  constructor(public children: Box[], public label: string | null = null) {}

  bind(atom: Atom) {
    this.atom = atom;
    return this;
  }

  toHtml(): HTMLSpanElement {
    const span = document.createElement("span");
    span.classList.add("display");
    this.children.forEach((box) => {
      span.append(box.toHtml());
    });
    if (this.atom) this.atom.elem = span;
    return span;
  }
}

export class SectionBox implements Box {
  rect: Rect = { depth: 0, height: 0, width: 0 };
  space: Space = { top: 0, bottom: 0, left: 0, right: 0 };
  atom?: Atom | undefined;

  constructor(
    public children: Box[],
    public mode: "section" | "subsection" | "subsubsection",
    public label: string | null = null
  ) {}

  bind(atom: Atom) {
    this.atom = atom;
    return this;
  }

  toHtml(): HTMLSpanElement {
    const span = document.createElement("span");
    span.classList.add("section", "text");
    span.classList.add(this.mode);
    span.setAttribute("label", this.label ?? "");
    this.children.forEach((box) => {
      span.append(box.toHtml());
    });
    if (this.atom) this.atom.elem = span;
    return span;
  }
}

export class ThmBox implements Box {
  rect: Rect = { depth: 0, height: 0, width: 0 };
  space: Space = { top: 0, bottom: 0, left: 0, right: 0 };
  atom?: Atom | undefined;

  constructor(
    public children: Box[],
    public thmName: ThmData | null = null,
    public label: string | null = null
  ) {}

  bind(atom: Atom) {
    this.atom = atom;
    return this;
  }

  toHtml(): HTMLSpanElement {
    const span = document.createElement("span");
    const wrapper = html("span", {
      cls: ["text"],
      children: [html("span", { cls: ["label"], text: this.thmName?.label })],
    });
    span.append(wrapper);
    span.classList.add("theorem");
    if (this.thmName?.nonum) span.classList.add("nonum");
    span.setAttribute("label", this.label ?? "");
    this.children.forEach((box) => {
      wrapper.append(box.toHtml());
    });
    if (this.atom) this.atom.elem = span;
    return span;
  }
}

export class DelimInnerBox implements Box {
  space: Space = {};
  multiplier?: number | undefined;
  atom: Atom | undefined;
  constructor(public repeat: string, public rect: Rect) {}

  bind(_: Atom): Box {
    throw new Error("Method not implemented." + _);
  }

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
    return span;
  }
}

export class SqrtBox implements Box {
  space: Space = {};
  multiplier?: number;
  constructor(
    public size: 1 | 2 | 3 | 4 | "small" | "Tall",
    public shift: number,
    public innerHeight: number,
    public rect: Rect
  ) {}

  bind(_: Atom): Box {
    throw new Error("Method not implemented." + _);
  }

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
    span.style.display = "inline-block";
    return span;
  }
}

export type SqrtSize = 1 | 2 | 3 | 4 | "small" | "Tall";

export const multiplyBox = (box: Box, m: number): Box => {
  box.rect = {
    height: box.rect.height * m,
    depth: box.rect.depth * m,
    width: box.rect.width * m,
  };
  box.multiplier = m;
  return box;
};

const addSpace = (span: HTMLSpanElement, box: Box) => {
  span.style.marginLeft = em(box.space.left);
  span.style.marginRight = em(box.space.right);
  span.style.marginBottom = em(box.space.bottom);
  span.style.marginTop = em(box.space.top);
};
