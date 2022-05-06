export const SIGMAS = {
  slant: [0.25, 0.25, 0.25], // sigma1
  space: [0.0, 0.0, 0.0], // sigma2
  stretch: [0.0, 0.0, 0.0], // sigma3
  shrink: [0.0, 0.0, 0.0], // sigma4
  xHeight: [0.431, 0.431, 0.431], // sigma5
  quad: [1.0, 1.171, 1.472], // sigma6
  extraSpace: [0.0, 0.0, 0.0], // sigma7
  num1: [0.677, 0.732, 0.925], // sigma8
  num2: [0.394, 0.384, 0.387], // sigma9
  num3: [0.444, 0.471, 0.504], // sigma10
  denom1: [0.686, 0.752, 1.025], // sigma11
  denom2: [0.345, 0.344, 0.532], // sigma12
  sup1: [0.413, 0.503, 0.504], // sigma13
  sup2: [0.363, 0.431, 0.404], // sigma14
  sup3: [0.289, 0.286, 0.294], // sigma15
  sub1: [0.15, 0.143, 0.2], // sigma16
  sub2: [0.247, 0.286, 0.4], // sigma17
  supDrop: [0.386, 0.353, 0.494], // sigma18
  subDrop: [0.05, 0.071, 0.1], // sigma19
  delim1: [2.39, 1.7, 1.98], // sigma20
  delim2: [1.01, 1.157, 1.42], // sigma21
  axisHeight: [0.25, 0.25, 0.25], // sigma22

  // These font metrics are extracted from TeX by using tftopl on cmex10.tfm;
  // they correspond to the font parameters of the extension fonts (family 3).
  // See the TeXbook, page 441. In AMSTeX, the extension fonts scale; to
  // match cmex7, we'd use cmex7.tfm values for script and scriptscript
  // values.
  defaultRuleThickness: [0.04, 0.049, 0.049], // xi8; cmex7: 0.049
  bigOpSpacing1: [0.111, 0.111, 0.111], // xi9
  bigOpSpacing2: [0.166, 0.166, 0.166], // xi10
  bigOpSpacing3: [0.2, 0.2, 0.2], // xi11
  bigOpSpacing4: [0.6, 0.611, 0.611], // xi12; cmex7: 0.611
  bigOpSpacing5: [0.1, 0.143, 0.143], // xi13; cmex7: 0.143

  // The \sqrt rule width is taken from the height of the surd character.
  // Since we use the same font at all sizes, this thickness doesn't scale.
  sqrtRuleThickness: [0.04, 0.04, 0.04],

  // This value determines how large a pt is, for metrics which are defined
  // in terms of pts.
  // This value is also used in katex.less; if you change it make sure the
  // values match.
  ptPerEm: [10.0, 10.0, 10.0],

  // The space between adjacent `|` columns in an array definition. From
  // `\showthe\doublerulesep` in LaTeX. Equals 2.0 / ptPerEm.
  doubleRuleSep: [0.2, 0.2, 0.2],

  // The width of separator lines in {array} environments. From
  // `\showthe\arrayrulewidth` in LaTeX. Equals 0.4 / ptPerEm.
  arrayRuleWidth: [0.04, 0.04, 0.04],

  // Two values from LaTeX source2e:
  fboxsep: [0.3, 0.3, 0.3], //        3 pt / ptPerEm
  fboxrule: [0.04, 0.04, 0.04], // 0.4 pt / ptPerEm
};

export const INTER_ATOM_SPACING: Partial<
  Record<AtomKind, Partial<Record<AtomKind, number>>>
> = {
  ord: { op: 3, bin: 4, rel: 5, inner: 3 },
  op: { ord: 3, op: 3, rel: 5, inner: 3 },
  bin: { ord: 4, op: 4, open: 4, inner: 4 },
  rel: { ord: 5, op: 5, open: 5, inner: 5 },
  close: { op: 3, bin: 4, rel: 5, inner: 3 },
  punct: { ord: 3, op: 3, rel: 3, open: 3, punct: 3, inner: 3 },
  inner: { ord: 3, op: 3, bin: 4, rel: 5, open: 3, punct: 3, inner: 3 },
};

export type AtomKind =
  | "ord"
  | "op"
  | "bin"
  | "rel"
  | "open"
  | "close"
  | "punct"
  | "inner";
