export const em = (n?: number): string => {
  if (n) return n.toFixed(4) + "em";
  else return "";
};

export const randStr = () => Math.random().toString(32).substring(2);
