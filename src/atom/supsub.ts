import { getSigma } from "/font";
import { HBox, multiplyBox, SymBox, toVBox, VBox, VStackBox } from "../box/box";
import { Atom, parseAtom, parseAtoms, SymAtom } from "./atom";
import { SIGMAS } from "/font/src/sigma";

export interface SupSubAtom extends Atom {
  type: "supsub";
  sup?: Atom[];
  sub?: Atom[];
  nuc: Atom;
}

export const parseSup = (atom: SupSubAtom, multiplier: number): HBox => {
  let supShift = 0;
  const sup = multiplyBox(parseAtoms(atom.sup as Atom[]), multiplier);
  const nuc = parseAtom(atom.nuc);
  if (!(nuc as SymBox).char) {
    supShift = nuc.height - (SIGMAS.supDrop[1] * multiplier) / 1;
  }
  const minSupShift = getSigma("sup1");
  supShift = Math.max(
    supShift,
    minSupShift,
    sup.depth + 0.25 * getSigma("xHeight")
  );

  const marginRight = 0.5 / SIGMAS.ptPerEm[0] / multiplier;
  sup.spaceR = marginRight;
  const vbox: VBox = {
    children: [{ box: sup, shift: supShift }],
    width: sup.width,
    height: sup.height,
    depth: sup.depth,
  };

  return {
    children: [nuc, vbox],
    width: nuc.width + sup.width,
    depth: nuc.depth,
    height: supShift / multiplier + sup.height,
  };
};

export const parseSub = (atom: SupSubAtom, multiplier: number) => {
  let subShift = 0;
  const sub = multiplyBox(parseAtoms(atom.sub as Atom[]), multiplier);
  //   const marginRight = 0.5 / getSigma("ptPerEm") / multiplier;
  const nuc = parseAtom(atom.nuc);
  if (!(nuc as SymBox).char) {
    subShift = nuc.depth + (SIGMAS.subDrop[1] * multiplier) / 1;
  }
  subShift = Math.max(
    subShift,
    getSigma("sub1"),
    sub.height - 0.8 * getSigma("xHeight")
  );

  const marginRight = 0.5 / SIGMAS.ptPerEm[0] / multiplier;
  sub.spaceR = marginRight;
  sub.spaceL = -(nuc as SymBox).italic / multiplier;
  const vbox: VBox = {
    children: [{ box: sub, shift: -subShift }],
    width: sub.width,
    height: sub.height,
    depth: sub.depth,
  };

  return {
    children: [nuc, vbox],
    width: nuc.width + sub.width,
    depth: nuc.depth,
    height: subShift / multiplier + sub.height,
  };
};

export const parseSupSub = (
  atom: SupSubAtom,
  multiplier: number
): HBox | VStackBox => {
  let supShift = 0;
  let subShift = 0;
  if (atom.nuc.kind === "op" && (atom.nuc as SymAtom).char === "∑") {
    return parseLimitSupSub(
      atom.nuc,
      atom.sup as Atom[],
      atom.sub as Atom[],
      multiplier
    );
  }
  const nuc = parseAtom(atom.nuc);
  const sup = multiplyBox(parseAtoms(atom.sup as Atom[]), multiplier);
  const sub = multiplyBox(parseAtoms(atom.sub as Atom[]), multiplier);
  const minSupShift = getSigma("sup1");
  supShift = Math.max(
    supShift,
    minSupShift,
    sup.depth + 0.25 * getSigma("xHeight")
  );
  if (!(nuc as SymBox).char || atom.nuc.kind === "op") {
    subShift = nuc.depth + (SIGMAS.subDrop[1] * multiplier) / 1;
  }
  if (!(nuc as SymBox).char || atom.nuc.kind === "op") {
    supShift = nuc.height - (SIGMAS.supDrop[1] * multiplier) / 1;
  }

  subShift = Math.max(subShift, getSigma("sub2"));

  const ruleWidth = getSigma("defaultRuleThickness");

  // Rule 18e
  const maxWidth = 4 * ruleWidth;

  if (supShift - sup.depth - (sub.height - subShift) < maxWidth) {
    subShift = maxWidth - (supShift - sup.depth) + sub.height;
    const psi = 0.8 * getSigma("xHeight") - (supShift - sup.depth);
    if (psi > 0) {
      supShift += psi;
      subShift -= psi;
    }
  }
  sub.spaceL = -(nuc as SymBox).italic / multiplier;
  const marginRight = 0.5 / SIGMAS.ptPerEm[0] / multiplier;
  sup.spaceR = marginRight;
  sub.spaceR = marginRight;
  const supsub: VBox = {
    children: [
      { box: sup, shift: supShift },
      { box: sub, shift: -subShift },
    ],
    width: Math.max(sup.width, sub.width),
    height: 0,
    depth: 0,
    align: "start",
  };

  return {
    children: [nuc, supsub],
    width: nuc.width + supsub.width,
    depth: nuc.depth,
    height: supsub.height,
  };
};

export const parseLimitSupSub = (
  nuc: Atom,
  supAtom: Atom[],
  subAtom: Atom[],
  multiplier: number
): VStackBox => {
  let supBox;
  let subBox;
  const nucBox = parseAtom(nuc);
  if (supAtom) {
    supBox = multiplyBox(parseAtoms(supAtom), multiplier);
    supBox.spaceT = getSigma("bigOpSpacing5") / multiplier;
    supBox.spaceB =
      Math.max(
        getSigma("bigOpSpacing1"),
        getSigma("bigOpSpacing3") - supBox.depth
      ) / multiplier;
  }

  if (subAtom) {
    subBox = multiplyBox(parseAtoms(subAtom), multiplier);
    subBox.spaceB = getSigma("bigOpSpacing5") / multiplier;
    subBox.spaceT =
      Math.max(
        getSigma("bigOpSpacing2"),
        getSigma("bigOpSpacing4") - subBox.height
      ) / multiplier;
  }
  if (supBox && subBox) {
    const bottom =
      getSigma("bigOpSpacing5") +
      subBox.height +
      subBox.depth +
      (subBox.spaceT ?? 0) +
      nucBox.depth;
    return toVBox([supBox, nucBox, subBox], bottom);
  } else if (subBox) {
    const top = nucBox.height;
    return toVBox([nucBox, subBox], top);
  } else if (supBox) {
    const bottom = nucBox.depth;
    return toVBox([supBox, nucBox], bottom);
  } else {
    throw new Error("Sup or Sub must specified");
  }
};
