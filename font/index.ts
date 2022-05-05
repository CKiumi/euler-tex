import { SIGMAS } from "./src/sigma";
import { Font } from "./src/spec";
import METRICS from "./src/data";

export type CharMetric = {
  depth: number;
  height: number;
  italic: number;
  skew: number;
  width: number;
};

export function getCharMetrics(char: string, font: Font): CharMetric {
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
}

export function getSigma(name: keyof typeof SIGMAS): number {
  return SIGMAS[name][0];
}
