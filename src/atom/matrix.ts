import { Box, HBox, RectBox, SymBox, VBox } from "../box/box";
import { DISPLAY, Options, TEXT } from "../box/style";
import { AtomKind, getSpacing, SIGMAS } from "../font";
import { Atom, FirstAtom, GroupAtom } from "./atom";
import { makeLeftRightDelim } from "./leftright";
const envs = [
  "pmatrix",
  "bmatrix",
  "Bmatrix",
  "vmatrix",
  "Vmatrix",
  "matrix",
  "cases",
  "aligned",
  "align",
] as const;
export class MatrixAtom implements Atom {
  parent: GroupAtom | null = null;
  kind: AtomKind = "ord";
  elem: HTMLSpanElement | null = null;
  grid = false;

  constructor(
    public children: GroupAtom[][],
    public type: typeof envs[number] = "pmatrix",
    public labels: (string | null)[] = [],
    public editable = false
  ) {}

  setGrid(grid: boolean) {
    this.grid = grid;
  }

  toBox(options: Options): HBox | VBox {
    const hLinesBeforeRow = Array(this.children.length + 1).fill([true]);
    const hlines: { pos: number; isDashed: boolean }[] = [];
    this.children.forEach((row) =>
      row.forEach((group) => {
        group.parent = this;
      })
    );

    //align
    const children = this.children.map((child) => {
      return child.map((e, i) => {
        const hbox = e.toBox(
          options?.getNewOptions(isAlign(this.type) ? DISPLAY : TEXT)
        );
        const { children } = hbox;
        if (isAlign(this.type) && i === 1) {
          if (e.body[0] instanceof FirstAtom && children.length > 1) {
            children[1].space.left = getSpacing("ord", e.body[1].kind ?? "ord");
            hbox.rect.width += children[1].space.left;
          } else if (children.length > 0) {
            children[0].space.left = getSpacing("ord", e.body[0].kind ?? "ord");
            hbox.rect.width += children[0].space.left;
          }
        }
        return hbox;
      });
    });
    //align
    let r;
    let c: number;
    const nr = children.length;
    if (!children[0]) return new HBox([]);
    let nc = children[0].length;
    const body: Outrow[] = [];
    let totalHeight = 0;

    // Set a position for \hline(s) at the top of the array, if any.
    const setHLinePos = (hlinesInGap: boolean[]) => {
      for (let i = 0; i < hlinesInGap.length; ++i) {
        if (i > 0) totalHeight += 0.25;
        hlines.push({ pos: totalHeight, isDashed: hlinesInGap[i] });
      }
    };
    setHLinePos(hLinesBeforeRow[0]);

    const arraystretch = this.type === "cases" ? 1.2 : 1;
    const pt = 1 / SIGMAS.ptPerEm[0];
    const jot = 3 * pt;
    const arraycolsep = 5 * pt;
    const baselineskip = 12 * pt;
    const arrayskip = arraystretch * baselineskip;
    const arstrutHeight = 0.7 * arrayskip;
    const arstrutDepth = 0.3 * arrayskip;

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
      if (isAlign(this.type)) {
        depth += jot;
      }
      outrow.height = height;
      outrow.depth = depth;
      totalHeight += height;
      outrow.pos = totalHeight;
      totalHeight += depth;
      body.push(outrow);
      setHLinePos(hLinesBeforeRow[r + 1]);
    }

    const offset = totalHeight / 2 + SIGMAS.axisHeight[0];

    const cols: Box[] = [];
    const sep = createSep(totalHeight, totalHeight - offset, !this.grid);
    sep.space.bottom = -totalHeight + offset;
    if (this.editable) {
      cols.push(sep);
    }

    const tagBoxes = [];
    if (this.type === "align") {
      for (r = 0; r < nr; ++r) {
        const rw = body[r];
        const shift = -(rw.pos - offset);
        const tagBox = new SymBox(`(${this.labels.pop() ?? "?"})`, ["Main-R"]);
        tagBox.rect.depth = rw.depth;
        tagBox.rect.height = rw.height;
        tagBoxes.push({ box: tagBox, shift });
      }
    }

    for (c = 0; c < nc; c++) {
      if (c >= nc) continue;
      const col = body
        .filter((row) => !!row.children[c])
        .map((row) => ({ box: row.children[c], shift: -(row.pos - offset) }));

      if (isAlign(this.type) && c === 0) {
        cols.push(new VBox(col, undefined, undefined, "end"));
      } else if (isAlign(this.type) || this.type === "cases") {
        cols.push(new VBox(col, undefined, undefined, "start"));
      } else {
        cols.push(new VBox(col));
      }

      if (!isAlign(this.type)) {
        if (c > 0) cols[cols.length - 1].space.left = arraycolsep;
        if (c < nc - 1) cols[cols.length - 1].space.right = arraycolsep;
      }
      const sep = createSep(totalHeight, totalHeight - offset, !this.grid);

      sep.space.bottom = -totalHeight + offset;
      if (this.editable) cols.push(sep);
    }
    const hbox = this.type === "matrix" ? new HBox(cols, this) : new HBox(cols);
    hbox.space.bottom = totalHeight - offset - hbox.rect.depth;
    hbox.space.top = offset - hbox.rect.height;
    const innerHeight = hbox.rect.height + hbox.space.top;
    const innerDepth = hbox.rect.depth + hbox.space.bottom;
    const lines = this.editable
      ? Array(this.children.length + 1)
          .fill(0)
          .map((_, i) => {
            //createlint width is not used, it is set to 100%
            //currently, the width of text box is 0
            return {
              box: createLine(hbox.rect.width, !this.grid),
              shift: -hlines[i].pos + offset,
            };
          })
      : [];
    if (MAT_DELIM[this.type]) {
      const left = makeLeftRightDelim(
        MAT_DELIM[this.type][0],
        innerHeight,
        innerDepth
      );
      const right = makeLeftRightDelim(
        MAT_DELIM[this.type][1],
        innerHeight,
        innerDepth
      );
      this.kind = "inner";
      return new HBox(
        [
          left,
          new VBox([{ box: new HBox([hbox]), shift: 0 }, ...lines]),
          right,
        ],
        this
      );
    }
    if (this.type === "cases") {
      const left = makeLeftRightDelim("{", innerHeight, innerDepth);
      this.kind = "inner";
      return new HBox(
        [left, new VBox([{ box: new HBox([hbox]), shift: 0 }, ...lines])],
        this
      );
    }
    if (this.type === "align") {
      const tags = new VBox(tagBoxes);
      tags.tag = true;
      return new HBox(
        [new VBox([{ box: new HBox([hbox]), shift: 0 }, ...lines]), tags],
        this
      );
    }
    return new HBox(
      [new VBox([{ box: new HBox([hbox]), shift: 0 }, ...lines])],
      this
    );
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

export const createLine = (_?: number, hidden = false): RectBox => {
  return new RectBox(
    { width: 0, height: 0.02, depth: 0 },
    hidden ? ["hline", "hidden"] : ["hline"]
  );
};

const isAlign = (type: string) => {
  return type === "aligned" || type === "align";
};
