import { Box, HBox, RectBox, TagBox, VBox } from "../box/box";
import { DISPLAY, Options, TEXT } from "../box/style";
import { AtomKind, getSpacing, SIGMAS } from "../font";
import { Atom, MathAtom, MathGroup } from "./atom";
import { Align } from "./block";
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

export class MatrixAtom implements MathAtom {
  parent: MathGroup | Align | null = null;
  kind: AtomKind = "ord";
  elem: HTMLSpanElement | null = null;
  grid = false;
  hPos = [0];
  rows: MathGroup[][];
  constructor(
    rows: MathGroup[][],
    public type: typeof ENVNAMES[number] = "pmatrix",
    public labels: string[] = []
  ) {
    const cn = Math.max(...rows.map((row) => row.length));
    for (const r of rows) while (r.length < cn) r.push(new MathGroup([]));
    this.rows = rows;
  }

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
      if (row < this.rows.length - 1) result += "\\\\\n";
    }
    return `\n\\begin{${this.type}}${result}\\end{${this.type}}\n`;
  }

  setGrid(grid: boolean) {
    this.grid = grid;
  }

  toBox(options: Options): HBox | VBox {
    const { type, grid } = this;
    this.hPos = [0];
    const newOptions = options?.getNewOptions(isAlign(type) ? DISPLAY : TEXT);
    const children = this.rows.map((row) => {
      return row.map((e, i) => {
        e.parent = this;
        const hbox = e.toBox(newOptions);
        if (isAlign(type) && i === 1) {
          hbox.space.left = getSpacing("ord", e.body[1]?.kind ?? "ord");
        }
        return hbox;
      });
    });
    const nc = children[0].length;
    const pt = 1 / SIGMAS.ptPerEm[0];
    const [jot, colsep] = isAlign(type) ? [3 * pt, 0] : [0, 5 * pt];
    const skip = (type === "cases" ? 1.2 : 1) * 12 * pt;
    const [strutH, strutD] = [0.7 * skip, 0.3 * skip];
    let totalH = 0;
    const outrows = children.map((r) => {
      const height = Math.max(strutH, ...r.map((e) => e.rect.height));
      const depth = Math.max(strutD, ...r.map((e) => e.rect.depth)) + jot;
      totalH += height + depth;
      this.hPos.push(totalH);
      return { children: r, pos: totalH - depth, height, depth };
    });
    const offset = totalH / 2 + SIGMAS.axisHeight[0];
    const cols: Box[] = [makeSep(offset, totalH - offset, !grid)];
    for (let c = 0; c < nc; c++) {
      const col = outrows.map((row) => ({
        box: row.children[c],
        shift: offset - row.pos,
      }));
      cols.push(new VBox(col, undefined, alignments(type)[c]));
      if (c > 0) cols[cols.length - 1].space.left = colsep;
      if (c < nc - 1) cols[cols.length - 1].space.right = colsep;
      cols.push(makeSep(offset, totalH - offset, !grid));
    }
    const pos = this.hPos.map((p) => offset - p);
    const hls = makeHl(pos, !grid);
    const inner = new VBox([{ box: new HBox(cols), shift: 0 }, ...hls]);
    if (MAT_DELIM[type]) {
      const [left, right] = MAT_DELIM[type].map((c) =>
        makeLRDelim(c, inner.rect.height, inner.rect.depth)
      );
      this.kind = "inner";
      return new HBox(right ? [left, inner, right] : [left, inner]).bind(this);
    }
    if (type === "align") {
      const tgs = outrows.map((r) => ({
        box: new TagBox(r.height, r.depth),
        shift: offset - r.pos,
      }));
      return new HBox([inner, new VBox(tgs).setTag()]).bind(this);
    }
    return inner.bind(this);
  }
}

const alignments = (type: typeof ENVNAMES[number]) => {
  if (isAlign(type)) return ["end", "start"];
  if (type === "cases") return ["start", "start"];
  else return [];
};

const MAT_DELIM: { [x: string]: string[] } = {
  pmatrix: ["(", ")"],
  bmatrix: ["[", "]"],
  Bmatrix: ["{", "}"],
  vmatrix: ["∣", "∣"],
  Vmatrix: ["∥", "∥"],
  cases: ["{"],
};

const makeSep = (height: number, depth: number, hidden = false) => {
  return new RectBox(
    { width: 0.02, height, depth },
    hidden ? ["sep", "hidden"] : ["sep"]
  );
};

export const makeHl = (pos: number[], hidden = false) => {
  const cls = hidden ? ["hline", "hidden"] : ["hline"];
  return pos.map((p) => ({
    box: new RectBox({ width: 0, height: 0.02, depth: 0 }, cls),
    shift: p,
  }));
};

const isAlign = (type: typeof ENVNAMES[number]) => {
  return type === "aligned" || type === "align" || type === "align*";
};
