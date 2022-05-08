import { Font } from "/font/src/spec";
export interface Box {
  height: number;
  depth: number;
  width: number;
  spaceL?: number;
  spaceR?: number;
  spaceB?: number;
  spaceT?: number;
  multiplier?: number;
}

export interface SymBox extends Box {
  char: string;
  font: Font;
  italic: number;
}

export interface HBox extends Box {
  children: Box[];
}
export interface VBox extends Box {
  children: { box: Box; shift: number }[];
  align?: "center" | "start";
}
export interface VStackBox extends Box {
  children: Box[];
  shift: number;
}

export interface DelimInnerBox extends Box {
  repeat: "⎜" | "⎟";
}

export interface SqrtBox extends Box {
  size: 1 | 2 | 3 | 4 | "small" | "Tall";
  shift: number;
  innerHeight: number;
}
export type SqrtSize = 1 | 2 | 3 | 4 | "small" | "Tall";

export const toVBox = (children: Box[], newDepth: number): VStackBox => {
  const height =
    children
      .map((box) => box.height + box.depth)
      .reduce((partialSum, a) => partialSum + a, 0) - newDepth;
  const width = Math.max(...children.map((box) => box.width));
  const revChildren = children.slice().reverse();
  const oldDepth = revChildren[0].depth + (revChildren[0].spaceB ?? 0);
  return {
    children,
    depth: newDepth,
    height,
    width,
    shift: -(newDepth - oldDepth),
  };
};

export const multiplyBox = (box: Box, multiplier: number): Box => {
  return {
    multiplier,
    ...box,
    height: box.height * multiplier,
    depth: box.depth * multiplier,
    width: box.width * multiplier,
  };
};
