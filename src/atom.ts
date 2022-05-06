import { Font } from "/font/src/spec";

export type Atom = SymAtom;
export interface SymAtom {
  char: string;
  font: Font;
}
