import { Box, HBox, VBox } from "../box/box";
import { Atom, parseAtom } from "./atom";
import { SIGMAS } from "/font/src/sigma";

const pt = 1 / SIGMAS.ptPerEm[0];
const arraycolsep = 5 * pt;
const baselineskip = 12 * pt;
const arrayskip = 1 * baselineskip;
const arstrutHeight = 0.7 * arrayskip;
const arstrutDepth = 0.3 * arrayskip;

export interface MatrixAtom extends Atom {
  type: "matrix";
  children: Atom[][];
}

export const parseMatrix = function (atom: MatrixAtom): HBox {
  const children = atom.children.map((child) => child.map((e) => parseAtom(e)));
  let r;
  let c: number;
  const nr = children.length;
  let nc = children[0].length;
  const body: Outrow[] = [];
  let totalWidth = 0;
  let totalHeight = 0;
  for (r = 0; r < nr; ++r) {
    const inrow = children[r];
    let [height, depth] = [arstrutHeight, arstrutDepth];
    nc = Math.max(nc, inrow.length);
    const outrow: Outrow = { children: [], pos: 0, height: 0, depth: 0 };
    for (c = 0; c < inrow.length; c++) {
      [height, depth] = [
        Math.max(height, children[r][c].height),
        Math.max(depth, children[r][c].depth),
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
    const col: { box: Box; shift: number }[] = body
      .filter((row) => !!row.children[c])
      .map((row) => ({ box: row.children[c], shift: -(row.pos - offset) }));
    cols.push({ children: col } as VBox);
    if (c > 0) cols[c].spacing = arraycolsep;
    if (c < nc - 1) cols[c].spacingRight = arraycolsep;
  }
  const mat = document.createElement("span");
  mat.classList.add("box");
  cols.forEach((e) => {
    totalWidth += e.width;
  });
  return {
    children: cols,
    width: totalWidth,
    height: offset,
    depth: totalHeight - offset,
  };
};

type Outrow = {
  children: Box[];
  height: number;
  depth: number;
  pos: number;
};
