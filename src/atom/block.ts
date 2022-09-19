import { Options, TEXT } from "../box/style";
import { html } from "../html";
import { Font, TagBox, VBox } from "../lib";
import { ThmData } from "../parser/command";
import { randStr } from "../util";
import { Atom, FirstAtom, MathGroup, MatrixAtom } from "./atom";

export abstract class Block {
  elem = document.createElement("span");
  abstract parent: Atom | Block | null;
  abstract children(): (Atom | Block)[];
  abstract serialize(): string;
  abstract render(): HTMLSpanElement;
}

export class Char extends Block {
  parent: Section | Article | null = null;
  constructor(public char: string, public font: Font | null) {
    super();
  }

  children(): Block[] {
    return [this];
  }

  serialize(): string {
    return this.char;
  }

  render(): HTMLSpanElement {
    this.elem.innerText = this.char;
    this.font && this.elem.classList.add(this.font.toLowerCase());
    return this.elem;
  }
}

export class Ref extends Block {
  parent: Section | Article | null = null;
  constructor(public label: string, public font: Font | null) {
    super();
  }

  children(): Block[] {
    return [this];
  }

  serialize(): string {
    return `\\ref{${this.label}}`;
  }

  render(): HTMLSpanElement {
    this.elem.innerText = this.label;
    this.elem.classList.add("ref");
    return this.elem;
  }
}

export class Article extends Block {
  parent: Atom | null = null;
  constructor(public body: Block[]) {
    super();
    this.body = [new Char("\u200b", null), ...body];
  }

  children() {
    return this.body.flatMap((atom) => atom.children());
  }

  serialize() {
    return this.body.map((atom) => atom.serialize()).join("");
  }

  render(): HTMLSpanElement {
    this.elem.innerHTML = "";
    this.elem.classList.add("text");
    this.body.forEach((atom) => {
      if (!atom.parent) this.elem.append(atom.render());
      else this.elem.append(atom.elem);
      atom.parent = this;
    });
    return this.elem;
  }
}

export class Theorem extends Block {
  kind = null;
  parent: Atom | null = null;
  constructor(
    public body: Block[],
    public thmName: ThmData,
    public label: string
  ) {
    super();
    this.body = [new Char("\u200b", null), ...body];
  }

  children() {
    return this.body.flatMap((atom) => atom.children());
  }

  serialize() {
    const name = this.thmName.label.toLowerCase();
    return `\n\\begin{${name}}\\label{${this.label}}${this.body
      .map((atom) => atom.serialize())
      .join("")}\\end{${name}}\n`;
  }

  render(): HTMLSpanElement {
    this.elem.innerHTML = "";
    const wrapper = html("span", {
      cls: ["text"],
      children: [html("span", { cls: ["label"], text: this.thmName?.label })],
    });
    this.elem.append(wrapper);
    this.elem.classList.add("theorem");
    if (this.thmName?.nonum) this.elem.classList.add("nonum");
    this.body.map((atom) => {
      if (!atom.parent) wrapper.append(atom.render());
      else wrapper.append(atom.elem);
      atom.parent = this;
    });
    this.elem.setAttribute("label", this.label ?? "");
    return this.elem;
  }
}

export class Section extends Block {
  parent: Article | null = null;
  constructor(
    public body: Char[],
    public mode: "section" | "subsection" | "subsubsection",
    public label: string = randStr()
  ) {
    super();
    this.body = [new Char("\u200b", null), ...body];
  }

  children() {
    return this.body.flatMap((atom) => atom.children());
  }

  serialize() {
    const label = this.label ? `\\label{${this.label}}` : "";
    return `\n\\${this.mode}{${this.body
      .map((atom) => atom.serialize())
      .join("")}}\n${label}`;
  }

  render(): HTMLSpanElement {
    this.elem.innerHTML = "";
    this.elem.classList.add("section", "text", this.mode);
    this.elem.setAttribute("label", this.label ?? "");
    this.body.forEach((atom) => {
      atom.parent = this;
      (this.elem as Element).append(atom.render());
    });
    return this.elem;
  }
}

export class Inline extends Block {
  parent = null;
  constructor(public body: Atom[]) {
    super();
    this.body = [new FirstAtom(), ...body];
  }

  children() {
    return [...this.body.flatMap((atom) => atom.children()), this];
  }

  serialize() {
    return `$${this.body.map((atom) => atom.serialize()).join("")}$`;
  }

  render(): HTMLSpanElement {
    this.elem.innerHTML = "";
    this.elem.classList.add("inline");
    MathGroup._toBox(this, new Options(6, TEXT)).forEach((box) => {
      (this.elem as Element).append(box.toHtml());
    });
    if (this.children.length === 1) {
      const space = document.createElement("span");
      space.innerHTML = "&nbsp;";
      this.elem.append(space);
    }
    return this.elem;
  }
}

export class Display extends Block {
  parent: Atom | null = null;
  constructor(public body: MathGroup, public label: string | null) {
    super();
  }

  children() {
    return this.body.children();
  }

  serialize() {
    if (this.label) {
      return `\n\\begin{equation}\\label{${
        this.label
      }}${this.body.serialize()}\\end{equation}\n`;
    }
    return `\n\\[${this.body.serialize()}\\]\n`;
  }

  render(): HTMLSpanElement {
    this.elem.innerHTML = "";
    this.elem.classList.add("display");
    const body = this.body.toBox(new Options());
    this.body.parent = this;
    this.elem.append(body.toHtml());
    if (this.label) {
      const box = new TagBox(body.rect.height, body.rect.depth);
      const tag = new VBox([{ box, shift: 0 }]).setTag().toHtml();
      this.elem.append(tag);
    }
    this.elem.setAttribute("label", this.label ?? "");
    return this.elem;
  }
}

export class Align extends Block {
  parent: Atom | null = null;

  constructor(public body: MatrixAtom, public labels: string[] | null) {
    super();
  }

  children() {
    return this.body.children();
  }

  serialize() {
    return this.body.serialize();
  }

  render() {
    this.elem.innerHTML = "";
    this.body.parent = this;
    this.elem.classList.add("align");
    if (this.labels) {
      this.elem.setAttribute("label", this.labels.join("\\"));
    }
    this.elem.append(this.body.toBox(new Options()).toHtml());
    return this.elem;
  }
}
