import { Box, HBox, multiplyBox, SymBox, VBox, VStackBox } from "../box/box";
import { AtomKind, getSigma, SIGMAS } from "../font";
import { Atom, GroupAtom, SymAtom } from "./atom";

export class SupSubAtom implements Atom {
  elem: HTMLSpanElement | null = null;
  kind: AtomKind | null;
  constructor(
    public nuc: Atom,
    public sup?: GroupAtom,
    public sub?: GroupAtom
  ) {
    this.kind = nuc.kind;
  }
  toBox(): Box {
    if (this.sup && this.sub) {
      return parseSupSub(this, 0.7);
    } else if (this.sup) {
      return parseSup(this, 0.7);
    } else {
      return parseSub(this, 0.7);
    }
  }
}

export const parseSup = (atom: SupSubAtom, multiplier: number): HBox => {
  let supShift = 0;
  if (!atom.sup) throw new Error("Sup must exist");
  const sup = multiplyBox(atom.sup.toBox(), multiplier);
  const nuc = atom.nuc.toBox();
  if (!(nuc as SymBox).char) {
    supShift = nuc.rect.height - (SIGMAS.supDrop[1] * multiplier) / 1;
  }
  const minSupShift = getSigma("sup1");
  supShift = Math.max(
    supShift,
    minSupShift,
    sup.rect.depth + 0.25 * getSigma("xHeight")
  );
  const marginRight = 0.5 / SIGMAS.ptPerEm[0] / multiplier;
  sup.space.right = marginRight;
  const vbox = new VBox([{ box: sup, shift: supShift }]);
  return new HBox([nuc, vbox], atom);
};

export const parseSub = (atom: SupSubAtom, multiplier: number) => {
  let subShift = 0;
  if (!atom.sub) throw new Error("Sup must exist");
  const sub = multiplyBox(atom.sub.toBox(), multiplier);
  //   const marginRight = 0.5 / getSigma("ptPerEm") / multiplier;
  const nuc = atom.nuc.toBox();
  if (!(nuc as SymBox).char) {
    subShift = nuc.rect.depth + (SIGMAS.subDrop[1] * multiplier) / 1;
  }
  subShift = Math.max(
    subShift,
    getSigma("sub1"),
    sub.rect.height - 0.8 * getSigma("xHeight")
  );

  const marginRight = 0.5 / SIGMAS.ptPerEm[0] / multiplier;
  sub.space.right = marginRight;
  sub.space.left = -(nuc as SymBox).italic / multiplier;
  const vbox = new VBox([{ box: sub, shift: -subShift }]);

  return new HBox([nuc, vbox], atom);
};

export const parseSupSub = (
  atom: SupSubAtom,
  multiplier: number
): HBox | VStackBox => {
  let supShift = 0;
  let subShift = 0;
  if (!atom.sup) throw new Error("Sup must exist");
  if (!atom.sub) throw new Error("Sub must exist");
  if (atom.nuc.kind === "op" && (atom.nuc as SymAtom).char === "∑") {
    return parseLimitSupSub(atom.nuc, atom.sup, atom.sub, multiplier);
  }
  const nuc = atom.nuc.toBox();
  const sup = multiplyBox(atom.sup.toBox(), multiplier);
  const sub = multiplyBox(atom.sub.toBox(), multiplier);
  const minSupShift = getSigma("sup1");
  supShift = Math.max(
    supShift,
    minSupShift,
    sup.rect.depth + 0.25 * getSigma("xHeight")
  );
  if (!(nuc as SymBox).char || atom.nuc.kind === "op") {
    subShift = nuc.rect.depth + (SIGMAS.subDrop[1] * multiplier) / 1;
  }
  if (!(nuc as SymBox).char || atom.nuc.kind === "op") {
    supShift = nuc.rect.height - (SIGMAS.supDrop[1] * multiplier) / 1;
  }

  subShift = Math.max(subShift, getSigma("sub2"));

  const ruleWidth = getSigma("defaultRuleThickness");

  // Rule 18e
  const maxWidth = 4 * ruleWidth;

  if (supShift - sup.rect.depth - (sub.rect.height - subShift) < maxWidth) {
    subShift = maxWidth - (supShift - sup.rect.depth) + sub.rect.height;
    const psi = 0.8 * getSigma("xHeight") - (supShift - sup.rect.depth);
    if (psi > 0) {
      supShift += psi;
      subShift -= psi;
    }
  }
  sub.space.left = -(nuc as SymBox).italic / multiplier;
  const marginRight = 0.5 / SIGMAS.ptPerEm[0] / multiplier;
  sup.space.right = marginRight;
  sub.space.right = marginRight;
  const supsub = new VBox(
    [
      { box: sup, shift: supShift },
      { box: sub, shift: -subShift },
    ],
    undefined,
    undefined,
    "start"
  );
  return new HBox([nuc, supsub], atom);
};

export const parseLimitSupSub = (
  nuc: Atom,
  supAtom: GroupAtom,
  subAtom: GroupAtom,
  multiplier: number
): VStackBox => {
  let supBox;
  let subBox;
  const nucBox = nuc.toBox();
  if (supAtom) {
    supBox = multiplyBox(supAtom.toBox(), multiplier);
    supBox.space.top = getSigma("bigOpSpacing5") / multiplier;
    supBox.space.bottom =
      Math.max(
        getSigma("bigOpSpacing1"),
        getSigma("bigOpSpacing3") - supBox.rect.depth
      ) / multiplier;
  }

  if (subAtom) {
    subBox = multiplyBox(subAtom.toBox(), multiplier);
    subBox.space.bottom = getSigma("bigOpSpacing5") / multiplier;
    subBox.space.top =
      Math.max(
        getSigma("bigOpSpacing2"),
        getSigma("bigOpSpacing4") - subBox.rect.height
      ) / multiplier;
  }
  if (supBox && subBox) {
    const bottom =
      getSigma("bigOpSpacing5") +
      subBox.rect.height +
      subBox.rect.depth +
      (subBox.space.top ?? 0) +
      nucBox.rect.depth;
    return new VStackBox([supBox, nucBox, subBox], bottom);
  } else if (subBox) {
    const top = nucBox.rect.height;
    return new VStackBox([nucBox, subBox], top);
  } else if (supBox) {
    const bottom = nucBox.rect.depth;
    return new VStackBox([supBox, nucBox], bottom);
  } else {
    throw new Error("Sup or Sub must specified");
  }
};
