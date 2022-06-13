import { Box, HBox, multiplyBox, SymBox, VBox, VStackBox } from "../box/box";
import { Options } from "../box/style";
import { AtomKind, getSigma, SIGMAS } from "../font";
import { Atom, GroupAtom, SymAtom } from "./atom";

export class SupSubAtom implements Atom {
  parent: GroupAtom | null = null;
  elem: HTMLSpanElement | null = null;
  kind: AtomKind | null;
  constructor(
    public nuc: Atom,
    public sup?: GroupAtom,
    public sub?: GroupAtom
  ) {
    this.kind = nuc.kind;
  }
  toBox(options?: Options): Box {
    this.nuc.parent = this;
    if (this.sup) this.sup.parent = this;
    if (this.sub) this.sub.parent = this;
    if (
      this.nuc.kind === "op" &&
      this.nuc instanceof SymAtom &&
      this.nuc.char === "∑"
    ) {
      return parseLimitSupSub(this, 0.7);
    }
    if (this.sup && this.sub) {
      return parseSupSub(this, options ?? new Options());
    } else if (this.sup) {
      return parseSup(this, options ?? new Options());
    } else {
      return parseSub(this, options ?? new Options());
    }
  }
}

export const parseSup = (atom: SupSubAtom, options: Options): HBox => {
  let supShift = 0;
  const supOption = options?.getSupOptions(options.style.sup());
  const { sizeMultiplier } = supOption;
  if (!atom.sup) throw new Error("Sup must exist");
  const sup = multiplyBox(
    atom.sup.toBox(supOption),
    sizeMultiplier / options.sizeMultiplier
  );
  const nuc = atom.nuc.toBox();
  if (!(atom.nuc as SymAtom).charBox) {
    supShift =
      nuc.rect.height -
      (SIGMAS.supDrop[1] * sizeMultiplier) / options.sizeMultiplier / 1;
  }

  const minSupShift = getSigma("sup1");

  supShift = Math.max(
    supShift,
    minSupShift,
    sup.rect.depth + 0.25 * getSigma("xHeight")
  );
  const marginRight = 0.5 / SIGMAS.ptPerEm[0] / sizeMultiplier;
  sup.space.right = marginRight;
  const vbox = new VBox([{ box: sup, shift: supShift }]);
  return new HBox([nuc, vbox], atom);
};

export const parseSub = (atom: SupSubAtom, options: Options) => {
  let subShift = 0;
  if (!atom.sub) throw new Error("Sup must exist");
  const subOption = options?.getSupOptions(options.style.sub());
  const { sizeMultiplier } = subOption;
  const sub = multiplyBox(
    atom.sub.toBox(subOption),
    sizeMultiplier / options.sizeMultiplier
  );
  const nuc = atom.nuc.toBox();
  if (!(atom.nuc as SymAtom).charBox) {
    subShift = nuc.rect.depth + (SIGMAS.subDrop[1] * sizeMultiplier) / 1;
  }
  subShift = Math.max(
    subShift,
    getSigma("sub1"),
    sub.rect.height - 0.8 * getSigma("xHeight")
  );

  const marginRight = 0.5 / SIGMAS.ptPerEm[0] / sizeMultiplier;
  sub.space.right = marginRight;
  sub.space.left =
    -(nuc as SymBox).italic / (sizeMultiplier / options.sizeMultiplier);
  const vbox = new VBox([{ box: sub, shift: -subShift }]);

  return new HBox([nuc, vbox], atom);
};

export const parseSupSub = (
  atom: SupSubAtom,
  options: Options
): HBox | VStackBox => {
  let supShift = 0;
  let subShift = 0;
  if (!atom.sup) throw new Error("Sup must exist");
  if (!atom.sub) throw new Error("Sub must exist");
  const subOption = options?.getSupOptions(options.style.sub());
  const { sizeMultiplier: subSizeMultiplier } = subOption;
  const supOption = options?.getSupOptions(options.style.sup());
  const { sizeMultiplier: supSizeMultiplier } = supOption;
  const nuc = atom.nuc.toBox();
  const sup = multiplyBox(
    atom.sup.toBox(supOption),
    supSizeMultiplier / options.sizeMultiplier
  );
  const sub = multiplyBox(
    atom.sub.toBox(subOption),
    subSizeMultiplier / options.sizeMultiplier
  );
  const minSupShift = getSigma("sup1");
  supShift = Math.max(
    supShift,
    minSupShift,
    sup.rect.depth + 0.25 * getSigma("xHeight")
  );
  if (!(nuc as SymBox).char || atom.nuc.kind === "op") {
    subShift = nuc.rect.depth + (SIGMAS.subDrop[1] * subSizeMultiplier) / 1;
  }
  if (!(nuc as SymBox).char || atom.nuc.kind === "op") {
    supShift = nuc.rect.height - (SIGMAS.supDrop[1] * supSizeMultiplier) / 1;
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
  sub.space.left = -(nuc as SymBox).italic / subSizeMultiplier;

  sup.space.right = 0.5 / SIGMAS.ptPerEm[0] / supSizeMultiplier;
  sub.space.right = 0.5 / SIGMAS.ptPerEm[0] / subSizeMultiplier;
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
  atom: SupSubAtom,
  multiplier: number
): VStackBox => {
  const { nuc, sup: supAtom, sub: subAtom } = atom;
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
    return new VStackBox([supBox, nucBox, subBox], bottom, atom);
  } else if (subBox) {
    const top = nucBox.rect.height;
    return new VStackBox([nucBox, subBox], top, atom);
  } else if (supBox) {
    const bottom = nucBox.rect.depth;
    return new VStackBox([supBox, nucBox], bottom, atom);
  } else {
    throw new Error("Sup or Sub must specified");
  }
};
