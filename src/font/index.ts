import {
  INTER_ATOM_SPACING,
  SIGMAS,
  AtomKind,
  TIGHT_INTER_ATOM_SPACING,
} from "./sigma";
import { Font, FontList, SPEC } from "./spec";
import METRICS from "./data";
export { SPEC, SIGMAS };
export type { Font, AtomKind };

export type CharMetric = {
  font: Font;
  depth: number;
  height: number;
  italic: number;
  skew: number;
  width: number;
};

export const getCharMetrics = (char: string, fonts: Font[]): CharMetric => {
  for (let i = fonts.length - 1; i > -1; i--) {
    try {
      const metrics = METRICS[fonts[i]][char.charCodeAt(0)];
      return {
        font: fonts[i],
        depth: metrics[0],
        height: metrics[1],
        italic: metrics[2],
        skew: metrics[3],
        width: metrics[4],
      };
    } catch (error) {
      continue;
    }
  }
  throw new Error("Font metric not found for " + char + "," + fonts.join(" "));
};

export const getSigma = (name: keyof typeof SIGMAS, size?: number): number => {
  let sizeIndex: 0 | 1 | 2;
  if (size === undefined) {
    sizeIndex = 0;
  } else if (size >= 5) {
    sizeIndex = 0;
  } else if (size >= 3) {
    sizeIndex = 1;
  } else {
    sizeIndex = 2;
  }
  return SIGMAS[name][sizeIndex ?? 0];
};

export const getSpacing = (
  prevKind: AtomKind,
  curKind: AtomKind,
  tight?: boolean
): number => {
  if (tight) {
    return (TIGHT_INTER_ATOM_SPACING[prevKind]?.[curKind] ?? 0) * CSSEmPerMu[0];
  }
  return (INTER_ATOM_SPACING[prevKind]?.[curKind] ?? 0) * CSSEmPerMu[0];
};

const CSSEmPerMu = SIGMAS.quad.map((s) => s / 18);

export const loadFont = async (fontDirectory: string) => {
  FontList.forEach((fontName) => {
    const font = new FontFace(
      fontName,
      `url(${fontDirectory}/${fontName}.woff2) format('woff2')`
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (document.fonts as any).add(font);
    font.load().catch(console.log);
  });
};
