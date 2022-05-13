import { INTER_ATOM_SPACING, SIGMAS, AtomKind } from "./sigma";
import { Font, SPEC } from "./spec";
import METRICS from "./data";
export { SPEC, SIGMAS };
export type { Font, AtomKind };

export type CharMetric = {
  depth: number;
  height: number;
  italic: number;
  skew: number;
  width: number;
};

export const getCharMetrics = (char: string, font: Font): CharMetric => {
  try {
    const metrics = METRICS[font][char.charCodeAt(0)];
    return {
      depth: metrics[0],
      height: metrics[1],
      italic: metrics[2],
      skew: metrics[3],
      width: metrics[4],
    };
  } catch (error) {
    throw new Error(`Font metrics not found for font: ${font}.`);
  }
};

export const getSigma = (name: keyof typeof SIGMAS): number => {
  return SIGMAS[name][0];
};

export const getSpacing = (prevKind: AtomKind, curKind: AtomKind): number =>
  (INTER_ATOM_SPACING[prevKind]?.[curKind] ?? 0) * CSSEmPerMu;

const CSSEmPerMu = SIGMAS.quad[0] / 18;
