import { Box, HBox, VBox } from "../box/box";
import { Atom } from "./atom";
import { SIGMAS, AtomKind } from "/font/src/sigma";

const pt = 1 / SIGMAS.ptPerEm[0];
const arraycolsep = 5 * pt;
const baselineskip = 12 * pt;
const arrayskip = 1 * baselineskip;
const arstrutHeight = 0.7 * arrayskip;
const arstrutDepth = 0.3 * arrayskip;

export class MatrixAtom implements Atom {
  constructor(public kind: AtomKind, public children: Atom[][]) {}
  parse(): HBox {
    const children = this.children.map((child) => child.map((e) => e.parse()));
    let r;
    let c: number;
    const nr = children.length;
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
    const hbox = new HBox(cols);
    hbox.space.bottom = totalHeight - offset - hbox.rect.depth;
    hbox.space.top = offset - hbox.rect.height;
    return hbox;
  }
}

type Outrow = {
  children: Box[];
  height: number;
  depth: number;
  pos: number;
};
