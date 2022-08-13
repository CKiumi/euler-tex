// @flow
/**
 * This file contains information and classes for the various kinds of styles
 * used in TeX. It provides a generic `Style` class, which holds information
 * about a specific style. It then provides instances of all the different kinds
 * of styles possible, and provides functions to move between them and get
 * information about them.
 */

/**
 * The main style class. Contains a unique id for the style, a size (which is
 * the same for cramped and uncramped version of a style), and a cramped flag.
 */
class Style implements StyleInterface {
  id: number;
  size: number;
  cramped: boolean;

  constructor(id: number, size: number, cramped: boolean) {
    this.id = id;
    this.size = size;
    this.cramped = cramped;
  }

  sup(): Style {
    return styles[sup[this.id]];
  }

  sub(): Style {
    return styles[sub[this.id]];
  }

  fracNum(): Style {
    return styles[fracNum[this.id]];
  }

  fracDen(): Style {
    return styles[fracDen[this.id]];
  }

  cramp(): Style {
    return styles[cramp[this.id]];
  }

  text(): Style {
    return styles[text[this.id]];
  }

  isTight(): boolean {
    return this.size >= 2;
  }
}

export interface StyleInterface {
  id: number;
  size: number;
  cramped: boolean;

  sup(): StyleInterface;
  sub(): StyleInterface;
  fracNum(): StyleInterface;
  fracDen(): StyleInterface;
  cramp(): StyleInterface;
  text(): StyleInterface;
  isTight(): boolean;
}

// IDs of the different styles
const D = 0;
const Dc = 1;
const T = 2;
const Tc = 3;
const S = 4;
const Sc = 5;
const SS = 6;
const SSc = 7;

// Instances of the different styles
const styles = [
  new Style(D, 0, false),
  new Style(Dc, 0, true),
  new Style(T, 1, false),
  new Style(Tc, 1, true),
  new Style(S, 2, false),
  new Style(Sc, 2, true),
  new Style(SS, 3, false),
  new Style(SSc, 3, true),
];

// Lookup tables for switching from one style to another
const sup = [S, Sc, S, Sc, SS, SSc, SS, SSc];
const sub = [Sc, Sc, Sc, Sc, SSc, SSc, SSc, SSc];
const fracNum = [T, Tc, S, Sc, SS, SSc, SS, SSc];
const fracDen = [Tc, Tc, Sc, Sc, SSc, SSc, SSc, SSc];
const cramp = [Dc, Dc, Tc, Tc, Sc, Sc, SSc, SSc];
const text = [D, Dc, T, Tc, T, Tc, T, Tc];

// We only export some of the styles.
export default {
  DISPLAY: styles[D],
  TEXT: styles[T],
  SCRIPT: styles[S],
  SCRIPTSCRIPT: styles[SS],
};
