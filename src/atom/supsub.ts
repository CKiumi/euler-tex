import { Box, HBox, multiplyBox, SymBox, VBox, VStackBox } from "../box/box";
import { DISPLAY, Options } from "../box/style";
import { AtomKind, getSigma, SIGMAS } from "../font";
import { LIMIT } from "../parser/command";
import { Atom, MathGroup, SymAtom } from "./atom";

export class SupSubAtom implements Atom {
  parent: MathGroup | null = null;
  elem: HTMLSpanElement | null = null;
  kind: AtomKind | null;
  constructor(
    public nuc: Atom,
    public sup?: MathGroup,
    public sub?: MathGroup
  ) {
    this.kind = nuc.kind;
  }

  children(): Atom[] {
    const nucs = this.nuc.children();
    nucs.pop();
    return [
      ...nucs,
      ...(this.sup ? this.sup.children() : []),
      ...(this.sub ? this.sub.children() : []),
      this,
    ];
  }
  toBox(options?: Options): Box {
    this.nuc.parent = this;
    options = options ?? new Options();
    if (this.sup) this.sup.parent = this;
    if (this.sub) this.sub.parent = this;
    if (
      this.nuc.kind === "op" &&
      this.nuc instanceof SymAtom &&
      LIMIT.includes(this.nuc.command ?? "") &&
      options?.style.size === DISPLAY.size
    ) {
      return parseLimitSupSub(this, options);
    }
    if (this.sup && this.sub) {
      return parseSupSub(this, options);
    } else if (this.sup) {
      return parseSup(this, options);
    } else {
      return parseSub(this, options);
    }
  }
}

export const parseSup = (atom: SupSubAtom, options: Options): HBox => {
  let supShift = 0;
  const supOption = options?.getNewOptions(options.style.sup());
  const { sizeMultiplier } = supOption;
  if (!atom.sup) throw new Error("Sup must exist");
  const sup = multiplyBox(
    atom.sup.toBox(supOption),
    sizeMultiplier / options.sizeMultiplier
  );
  const nuc = atom.nuc.toBox(options);
  if (!(atom.nuc as SymAtom).charBox) {
    supShift =
      nuc.rect.height -
      (getSigma("supDrop", supOption.size) * sizeMultiplier) /
        options.sizeMultiplier;
  }

  let minSupShift;
  if (options.style === DISPLAY) {
    minSupShift = getSigma("sup1", options.size);
  } else if (options.style.cramped) {
    minSupShift = getSigma("sup3", options.size);
  } else {
    minSupShift = getSigma("sup2", options.size);
  }

  supShift = Math.max(
    supShift,
    minSupShift,
    sup.rect.depth + 0.25 * getSigma("xHeight", options.size)
  );
  const marginRight = 0.5 / SIGMAS.ptPerEm[0] / sizeMultiplier;
  sup.space.right = marginRight;
  const vbox = new VBox([{ box: sup, shift: supShift }]);
  return new HBox([nuc, vbox]).bind(atom);
};

export const parseSub = (atom: SupSubAtom, options: Options) => {
  let subShift = 0;
  if (!atom.sub) throw new Error("Sup must exist");
  const subOption = options?.getNewOptions(options.style.sub());
  const { sizeMultiplier } = subOption;
  const sub = multiplyBox(
    atom.sub.toBox(subOption),
    sizeMultiplier / options.sizeMultiplier
  );
  const nuc = atom.nuc.toBox(options);
  if (!(atom.nuc as SymAtom).charBox) {
    subShift =
      nuc.rect.depth +
      (getSigma("subDrop", subOption.size) * sizeMultiplier) /
        options.sizeMultiplier;
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

  return new HBox([nuc, vbox]).bind(atom);
};

export const parseSupSub = (
  atom: SupSubAtom,
  options: Options
): HBox | VStackBox => {
  let supShift = 0;
  let subShift = 0;
  if (!atom.sup) throw new Error("Sup must exist");
  if (!atom.sub) throw new Error("Sub must exist");
  const subOption = options?.getNewOptions(options.style.sub());
  const { sizeMultiplier: subSizeMultiplier } = subOption;
  const supOption = options?.getNewOptions(options.style.sup());
  const { sizeMultiplier: supSizeMultiplier } = supOption;
  const nuc = atom.nuc.toBox(options);
  const sup = multiplyBox(
    atom.sup.toBox(supOption),
    supSizeMultiplier / options.sizeMultiplier
  );

  const sub = multiplyBox(
    atom.sub.toBox(subOption),
    subSizeMultiplier / options.sizeMultiplier
  );
  if (!(nuc as SymBox).char || atom.nuc.kind === "op") {
    supShift =
      nuc.rect.height -
      (getSigma("supDrop", supOption.size) * supSizeMultiplier) /
        options.sizeMultiplier;
    subShift =
      nuc.rect.depth +
      (getSigma("subDrop", subOption.size) * subSizeMultiplier) /
        options.sizeMultiplier;
  }

  let minSupShift;
  if (options.style === DISPLAY) {
    minSupShift = getSigma("sup1", options.size);
  } else if (options.style.cramped) {
    minSupShift = getSigma("sup3", options.size);
  } else {
    minSupShift = getSigma("sup2", options.size);
  }

  supShift = Math.max(
    supShift,
    minSupShift,
    sup.rect.depth + 0.25 * getSigma("xHeight", options.size)
  );

  subShift = Math.max(subShift, getSigma("sub2", options.size));

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
    "start"
  );
  return new HBox([nuc, supsub]).bind(atom);
};

export const parseLimitSupSub = (
  atom: SupSubAtom,
  options: Options
): VStackBox => {
  const { nuc, sup: supAtom, sub: subAtom } = atom;
  let supBox;
  let subBox;
  const nucBox = nuc.toBox();
  if (supAtom) {
    const supOption = options?.getNewOptions(options.style.sup());
    const { sizeMultiplier: supSizeMultiplier } = supOption;
    supBox = multiplyBox(supAtom.toBox(supOption), supSizeMultiplier);
    supBox.space.top = getSigma("bigOpSpacing5") / supSizeMultiplier;
    supBox.space.bottom =
      Math.max(
        getSigma("bigOpSpacing1"),
        getSigma("bigOpSpacing3") - supBox.rect.depth
      ) / supSizeMultiplier;
  }

  if (subAtom) {
    const subOption = options?.getNewOptions(options.style.sub());
    const { sizeMultiplier: subSizeMultiplier } = subOption;
    subBox = multiplyBox(subAtom.toBox(subOption), subSizeMultiplier);
    subBox.space.bottom = getSigma("bigOpSpacing5") / subSizeMultiplier;
    subBox.space.top =
      Math.max(
        getSigma("bigOpSpacing2"),
        getSigma("bigOpSpacing4") - subBox.rect.height
      ) / subSizeMultiplier;
  }
  if (supBox && subBox) {
    const bottom =
      getSigma("bigOpSpacing5") +
      subBox.rect.height +
      subBox.rect.depth +
      (subBox.space.top ?? 0) +
      nucBox.rect.depth;
    return new VStackBox([supBox, nucBox, subBox], bottom).bind(atom);
  } else if (subBox) {
    const top = nucBox.rect.height;
    return new VStackBox([nucBox, subBox], top).bind(atom);
  } else if (supBox) {
    const bottom = nucBox.rect.depth;
    return new VStackBox([supBox, nucBox], bottom).bind(atom);
  } else {
    throw new Error("Sup or Sub must specified");
  }
};
