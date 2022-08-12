const sizeStyleMap = [
  [1, 1, 1], // size1: [5, 5, 5]              \tiny
  [2, 1, 1], // size2: [6, 5, 5]
  [3, 1, 1], // size3: [7, 5, 5]              \scriptsize
  [4, 2, 1], // size4: [8, 6, 5]              \footnotesize
  [5, 2, 1], // size5: [9, 6, 5]              \small
  [6, 3, 1], // size6: [10, 7, 5]             \normalsize
  [7, 4, 2], // size7: [12, 8, 6]             \large
  [8, 6, 3], // size8: [14.4, 10, 7]          \Large
  [9, 7, 6], // size9: [17.28, 12, 10]        \LARGE
  [10, 8, 7], // size10: [20.74, 14.4, 12]     \huge
  [11, 10, 9], // size11: [24.88, 20.74, 17.28] \HUGE
];

const sizeMultipliers = [
  0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.2, 1.44, 1.728, 2.074, 2.488,
];

const sizeAtStyle = function (textSize: number, style: Style): number {
  return style.size < 2 ? textSize : sizeStyleMap[textSize - 1][style.size - 1];
};

export class Style {
  constructor(
    public id: number,
    public size: 0 | 1 | 2 | 3,
    public cramped: boolean
  ) {}

  sup(): Style {
    return styles[sup[this.id]];
  }

  sub(): Style {
    return styles[sub[this.id]];
  }

  isTight(): boolean {
    return this.size >= 2;
  }

  fracNum(): Style {
    return styles[fracNum[this.id]];
  }

  cramp(): Style {
    return styles[cramp[this.id]];
  }

  /**
   * Get the style of a fraction denominator given the fraction in the current
   * style.
   */
  fracDen(): Style {
    return styles[fracDen[this.id]];
  }
}

const [D, Dc, T, Tc, S, Sc, SS, SSc] = [0, 1, 2, 3, 4, 5, 6, 7];
const sup = [S, Sc, S, Sc, SS, SSc, SS, SSc];
const sub = [Sc, Sc, Sc, Sc, SSc, SSc, SSc, SSc];
const fracNum = [T, Tc, S, Sc, SS, SSc, SS, SSc];
const fracDen = [Tc, Tc, Sc, Sc, SSc, SSc, SSc, SSc];
const cramp = [Dc, Dc, Tc, Tc, Sc, Sc, SSc, SSc];
// const text = [D, Dc, T, Tc, T, Tc, T, Tc];
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

export class Options {
  style: Style = DISPLAY;
  textSize = 6;
  sizeMultiplier: number;
  constructor(public size = 6) {
    this.sizeMultiplier = sizeMultipliers[this.size - 1];
  }
  getNewOptions(style: Style): Options {
    const newOptions = new Options(sizeAtStyle(this.textSize, style));
    newOptions.style = style;
    return newOptions;
  }
}

export const DISPLAY = styles[D];
export const TEXT = styles[T];
export const SCRIPT = styles[S];
export const SCRIPTSCRIPT = styles[SS];
