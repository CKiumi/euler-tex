import { AtomKind } from "/font/src/sigma";
import { Font } from "/font/src/spec";

export interface Atom {
  kind: AtomKind;
}

export interface SymAtom extends Atom {
  char: string;
  font: Font;
}
