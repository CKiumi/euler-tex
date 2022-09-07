import { Box, HBox, RectBox, SymBox, VBox } from "../box/box";
import { DISPLAY, Options, TEXT } from "../box/style";
import { AtomKind, getSpacing, SIGMAS } from "../font";
import { Atom, MathGroup } from "./atom";
import { makeLRDelim } from "./leftright";

export const ENVNAMES = [
  "pmatrix",
  "bmatrix",
  "Bmatrix",
  "vmatrix",
  "Vmatrix",
  "matrix",
  "cases",
  "aligned",
  "align",
  "align*",
] as const;

export class MatrixAtom implements Atom {
  parent: MathGroup | null = null;
  kind: AtomKind = "ord";
  elem: HTMLSpanElement | null = null;
  grid = false;
  hPos: number[] = [0];
  constructor(
    public rows: MathGroup[][],
    public type: typeof ENVNAMES[number] = "pmatrix",
    public labels: (string | null)[] = []
  ) {}

  children(): Atom[] {
    const rows = this.rows.flatMap((row) =>
      row.flatMap((group) => group.children())
    );
    return [...rows, this];
  }

  serialize(): string {
    let result = "";
    for (let row = 0; row < this.rows.length; row++) {
      this.labels[row] && (result += `\\label{${this.labels[row]}}`);
      for (let col = 0; col < this.rows[row].length; col++) {
        if (col > 0) result += " & ";
        result += this.rows[row][col].serialize();
      }
      if (row < this.rows.length - 1) {
        result += "\\\\\n";
      }
    }
    return `\n\n\\begin{${this.type}}${result}\\end{${this.type}}\n\n`;
  }

  setGrid(grid: boolean) {
    this.grid = grid;
  }

  toBox(options: Options): HBox | VBox {
    const newOptions = options?.getNewOptions(
      isAlign(this.type) ? DISPLAY : TEXT
    );
    const children = this.rows.map((child) => {
      return child.map((e, i) => {
        e.parent = this;
        const hbox = e.toBox(newOptions);
        const { children } = hbox;
        if (isAlign(this.type) && i === 1) {
          const space = getSpacing("ord", e.body[1].kind ?? "ord");
          children[1].space.left = space;
          hbox.rect.width += space;
        }
        return hbox;
      });
    });

    let r: number, c: number;
    const nr = children.length;
    if (!children[0]) return new HBox([]).bind(this);
    let nc = children[0].length;
    const body: Outrow[] = [];
    let totalHeight = 0;
    const arraystretch = this.type === "cases" ? 1.2 : 1;
    const pt = 1 / SIGMAS.ptPerEm[0];
    const jot = isAlign(this.type) ? 3 * pt : 0;
    const arraycolsep = !isAlign(this.type) ? 5 * pt : 0;
    const baselineskip = 12 * pt;
    const arrayskip = arraystretch * baselineskip;
    const [arstrutHeight, arstrutDepth] = [0.7 * arrayskip, 0.3 * arrayskip];

    for (r = 0; r < nr; ++r) {
      const inrow = children[r];
      let [height, depth] = [arstrutHeight, arstrutDepth];
      nc = Math.max(nc, inrow.length);
      const outrow: Outrow = { children: [], pos: 0, height: 0, depth: 0 };
      for (c = 0; c < inrow.length; c++) {
        [height, depth] = [
          Math.max(height, children[r][c].rect.height),
          Math.max(depth, children[r][c].rect.depth),
        ];
        outrow.children.push(children[r][c]);
      }
      depth += jot;
      [outrow.height, outrow.depth] = [height, depth];
      totalHeight += height;
      outrow.pos = totalHeight;
      totalHeight += depth;
      body.push(outrow);
      this.hPos.push(totalHeight);
    }

    const offset = totalHeight / 2 + SIGMAS.axisHeight[0];

    const cols: Box[] = [];
    cols.push(createSep(offset, totalHeight - offset, !this.grid));

    for (c = 0; c < nc; c++) {
      if (c >= nc) continue;
      const col = body
        .filter((row) => !!row.children[c])
        .map((row) => ({ box: row.children[c], shift: -(row.pos - offset) }));

      if (isAlign(this.type) && c === 0) {
        cols.push(new VBox(col, undefined, "end"));
      } else if (isAlign(this.type) || this.type === "cases") {
        cols.push(new VBox(col, undefined, "start"));
      } else {
        cols.push(new VBox(col));
      }
      if (c > 0) cols[cols.length - 1].space.left = arraycolsep;
      if (c < nc - 1) cols[cols.length - 1].space.right = arraycolsep;
      cols.push(createSep(offset, totalHeight - offset, !this.grid));
    }
    const hbox = new HBox(cols);
    hbox.space.bottom = totalHeight - offset - hbox.rect.depth;
    hbox.space.top = offset - hbox.rect.height;
    const inHeight = hbox.rect.height + hbox.space.top;
    const inDepth = hbox.rect.depth + hbox.space.bottom;
    const lines = createLine(
      this.hPos.map((pos) => offset - pos),
      !this.grid
    );
    const inner = new VBox([{ box: new HBox([hbox]), shift: 0 }, ...lines]);
    const delim = MAT_DELIM[this.type];
    if (delim) {
      const [left, right] = delim.map((c) => makeLRDelim(c, inHeight, inDepth));
      this.kind = "inner";
      return new HBox([left, inner, right]).bind(this);
    }
    if (this.type === "cases") {
      const left = makeLRDelim("{", inHeight, inDepth);
      this.kind = "inner";
      return new HBox([left, inner]).bind(this);
    }
    if (this.type === "align") {
      const tagBoxes = [];
      for (r = 0; r < nr; ++r) {
        const tagBox = new SymBox(`(${this.labels[r] ?? "?"})`, ["Main-R"]);
        tagBox.rect.depth = body[r].depth;
        tagBox.rect.height = body[r].height;
        tagBoxes.push({ box: tagBox, shift: -(body[r].pos - offset) });
      }
      const tags = new VBox(tagBoxes);
      tags.tag = true;
      return new HBox([inner, tags]).bind(this);
    }
    return new HBox([inner]).bind(this);
  }
}

const MAT_DELIM: { [x: string]: [string, string] } = {
  pmatrix: ["(", ")"],
  bmatrix: ["[", "]"],
  Bmatrix: ["{", "}"],
  vmatrix: ["∣", "∣"],
  Vmatrix: ["∥", "∥"],
};

type Outrow = {
  children: Box[];
  height: number;
  depth: number;
  pos: number;
};

const createSep = (height: number, depth: number, hidden = false) => {
  return new RectBox(
    { width: 0.02, height, depth },
    hidden ? ["sep", "hidden"] : ["sep"]
  );
};

export const createLine = (pos: number[], hidden = false) => {
  const cls = hidden ? ["hline", "hidden"] : ["hline"];
  return pos.map((p) => ({
    box: new RectBox({ width: 0, height: 0.02, depth: 0 }, cls),
    shift: p,
  }));
};

const isAlign = (type: string) => {
  return type === "aligned" || type === "align" || type === "align*";
};
