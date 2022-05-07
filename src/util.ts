export const em = (n?: number): string => {
  if (n) return n.toFixed(4) + "em";
  else return "";
};
