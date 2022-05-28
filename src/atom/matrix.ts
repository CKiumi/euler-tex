import { Box, HBox, VBox } from "../box/box";
import { AtomKind, SIGMAS } from "../font";
import { Atom, GroupAtom } from "./atom";
import { makeLeftRightDelim } from "./leftright";

const pt = 1 / SIGMAS.ptPerEm[0];
const arraycolsep = 5 * pt;
const baselineskip = 12 * pt;
const arrayskip = 1 * baselineskip;
const arstrutHeight = 0.7 * arrayskip;
const arstrutDepth = 0.3 * arrayskip;

export class MatrixAtom implements Atom {
  parent: GroupAtom | null = null;
  kind: AtomKind = "ord";
  elem: HTMLSpanElement | null = null;
  constructor(
    public children: GroupAtom[][],
    public type: "pmatrix" | "matrix"
  ) {}
  toBox(): HBox {
    this.children.forEach((row) =>
      row.forEach((group) => {
        group.parent = this;
      })
    );
    const children = this.children.map((child) => child.map((e) => e.toBox()));
    let r;
    let c: number;
    const nr = children.length;
    if (!children[0]) return new HBox([]);
    let nc = children[0].length;
    const body: Outrow[] = [];
    let totalHeight = 0;
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
      outrow.height = height;
      outrow.depth = depth;
      totalHeight += height;
      outrow.pos = totalHeight;
      totalHeight += depth;
      body.push(outrow);
    }

    const offset = totalHeight / 2 + SIGMAS.axisHeight[0];

    const cols: VBox[] = [];
    for (c = 0; c < nc; c++) {
      if (c >= nc) continue;
      const col = body
        .filter((row) => !!row.children[c])
        .map((row) => ({ box: row.children[c], shift: -(row.pos - offset) }));
      cols.push(new VBox(col));
      if (c > 0) cols[c].space.left = arraycolsep;
      if (c < nc - 1) cols[c].space.right = arraycolsep;
    }
    const hbox =
      this.type === "pmatrix" ? new HBox(cols) : new HBox(cols, this);
    hbox.space.bottom = totalHeight - offset - hbox.rect.depth;
    hbox.space.top = offset - hbox.rect.height;
    if (this.type === "pmatrix") {
      const innerHeight = hbox.rect.height + hbox.space.top;
      const innerDepth = hbox.rect.depth + hbox.space.bottom;
      const left = makeLeftRightDelim("(", innerHeight, innerDepth);
      const right = makeLeftRightDelim(")", innerHeight, innerDepth);
      this.kind = "inner";
      return new HBox([left, hbox, right], this);
    }
    return hbox;
  }
}

type Outrow = {
  children: Box[];
  height: number;
  depth: number;
  pos: number;
};
