import { INTER_ATOM_SPACING, SIGMAS, AtomKind } from "./sigma";
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
  throw new Error("Font metric not found for " + fonts.join(" "));
};

export const getSigma = (name: keyof typeof SIGMAS): number => {
  return SIGMAS[name][0];
};

export const getSpacing = (prevKind: AtomKind, curKind: AtomKind): number =>
  (INTER_ATOM_SPACING[prevKind]?.[curKind] ?? 0) * CSSEmPerMu;

const CSSEmPerMu = SIGMAS.quad[0] / 18;

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
