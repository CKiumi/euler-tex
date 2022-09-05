import {
  Atom,
  FirstAtom,
  Font,
  getCharMetrics,
  getSigma,
  MatrixAtom,
  SPEC,
} from "../lib";
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
  toHtml(): HTMLSpanElement;
}

export class RectBox implements Box {
  space: Space = {};
  constructor(
    public rect: Rect,
    public classes: string[],
    public atom?: Atom,
    public multiplier?: number
  ) {}
  toHtml(): HTMLSpanElement {
    const span = document.createElement("span");
    if (this.atom) this.atom.elem = span;
    if (this.atom instanceof FirstAtom) return span;
    addSpace(span, this);
    span.style.height = em(this.rect.height);
    if (this.rect.width !== 0) {
      span.style.width = this.rect.width + "em";
    } else {
      span.style.width = "100%";
    }
    span.classList.add(...this.classes);

    return span;
  }
}

export class SymBox implements Box {
  rect: Rect;
  italic: number;
  space: Space = {};
  font: Font;
  constructor(
    public char: string,
    fonts: Font[],
    public atom?: Atom,
    public composite?: boolean,
    public italicStyle = false,
    public bold = false,
    public ref = false
  ) {
    if (this.char === "&#8203;") {
      this.rect = { width: 0, height: 0.4306, depth: 0 };
      this.font = "Math-I";
      this.italic = 0;
      return;
    }
    if (this.char === " ") {
      this.rect = { width: 0, height: 0, depth: 0 };
      this.space.right = 1;
      this.italic = 0;
      this.font = "Main-R";
      return;
    }
    if (this.char === "  ") {
      this.rect = { width: 0, height: 0, depth: 0 };
      this.space.right = 2;
      this.italic = 0;
      this.font = "Main-R";
      return;
    }
    try {
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
    } catch (error) {
      //Case CJK
      this.rect = { width: 1, height: 1.17, depth: 0 };
      this.italic = 0;
      this.font = "Main-R";
    }
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
    if (this.italicStyle) span.style.fontStyle = "italic";
    if (this.bold) span.style.fontWeight = "bold";
    if (this.composite) span.style.textDecoration = "underline";
    if (this.ref) span.classList.add("ref");
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

  toHtml(): HTMLSpanElement {
    const span = document.createElement("span");
    addSpace(span, this);
    if (
      this.atom &&
      this.atom instanceof MatrixAtom &&
      (this.atom.type === "align" || this.atom.type === "align*")
    ) {
      span.classList.add("align");
    }
    span.classList.add("hbox");
    this.children.forEach((box) => {
      span.append(box.toHtml());
    });
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
  constructor(
    public children: { box: Box; shift: number }[],
    public atom?: Atom,
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
  constructor(
    public children: Box[],
    public newDepth: number,
    public atom?: Atom,
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
  constructor(public repeat: string, public rect: Rect) {}
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

export class BlockBox implements Box {
  rect: Rect = { depth: 0, height: 0, width: 0 };
  space: Space = {};
  constructor(
    public mode:
      | "text"
      | "inline"
      | "display"
      | "section"
      | "subsection"
      | "subsubsection"
      | "theorem",
    public children: Box[],
    public atom?: Atom,
    public multiplier?: number,
    public thmName: ThmData | null = null,
    public label: string | null = null
  ) {}

  toHtml(): HTMLSpanElement {
    const span = document.createElement("span");
    if (this.mode === "subsection") {
      span.classList.add("section", "sub");
      span.setAttribute("label", this.label ?? "");
    } else if (this.mode === "subsubsection") {
      span.classList.add("section", "subsub");
      span.setAttribute("label", this.label ?? "");
    } else if (this.mode === "section") {
      span.classList.add("section");
      span.setAttribute("label", this.label ?? "");
    } else if (this.mode === "theorem") {
      span.append(html("span", { cls: ["label"], text: this.thmName?.label }));
      span.classList.add("theorem");
      if (this.thmName?.nonum) span.classList.add("nonum");
      span.setAttribute("label", this.label ?? "");
    } else {
      span.classList.add(this.mode);
    }

    if (
      this.mode === "theorem" ||
      this.mode === "section" ||
      this.mode === "subsection" ||
      this.mode === "subsubsection"
    ) {
      const wrapper = html("span", {
        cls: ["text"],
        style: { fontStyle: this.thmName?.italic ? "italic" : "normal" },
      });
      this.children.forEach((box) => {
        wrapper.append(box.toHtml());
      });
      span.append(wrapper);
    } else {
      this.children.forEach((box) => {
        span.append(box.toHtml());
      });
    }

    if (this.children.length === 1) {
      const space = document.createElement("span");
      space.innerHTML = "&nbsp;";
      span.append(space);
    }
    if (this.atom) this.atom.elem = span;
    return span;
  }
}
