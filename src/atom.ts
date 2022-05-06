import { getCharMetrics } from "/font";
import { Font } from "/font/src/spec";

export interface Box {
  height: number;
  depth: number;
  width: number;
}

export interface CharAtom {
  char: string;
  font: Font;
  italic: number;
  box: Box;
}

export const charAtom = (char: string, font: Font): CharAtom => {
  const { depth, height, italic, width } = getCharMetrics(char, font);
  return { char, font, italic, box: { depth, height, width } };
};
