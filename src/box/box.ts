import { Font } from "/font/src/spec";
export interface Box {
  height: number;
  depth: number;
  width: number;
  spacing?: number;
  spacingBelow?: number;
  spacingTop?: number;
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
}
export interface VStackBox extends Box {
  children: Box[];
  shift: number;
}

export interface DelimInnerBox extends Box {
  repeat: "⎜" | "⎟";
}

export const toVBox = (children: Box[], newDepth: number): VStackBox => {
  const height =
    children
      .map((box) => box.height + box.depth)
      .reduce((partialSum, a) => partialSum + a, 0) - newDepth;
  const width = Math.max(...children.map((box) => box.width));
  const revChildren = children.slice().reverse();
  const oldDepth = revChildren[0].depth;
  return {
    children,
    depth: newDepth,
    height,
    width,
    shift: -(newDepth - oldDepth),
  };
};
