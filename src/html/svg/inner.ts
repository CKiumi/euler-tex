export const innerPath = function (name: string, height: number): string {
  // The inner part of stretchy tall delimiters
  switch (name) {
    case "\u239c":
      return `M291 0 H417 V${height} H291z M291 0 H417 V${height} H291z`;
    case "\u2223":
      return `M145 0 H188 V${height} H145z M145 0 H188 V${height} H145z`;
    case "\u2225":
      return (
        `M145 0 H188 V${height} H145z M145 0 H188 V${height} H145z` +
        `M367 0 H410 V${height} H367z M367 0 H410 V${height} H367z`
      );
    case "\u239f":
      return `M457 0 H583 V${height} H457z M457 0 H583 V${height} H457z`;
    case "\u23a2":
      return `M319 0 H403 V${height} H319z M319 0 H403 V${height} H319z`;
    case "\u23a5":
      return `M263 0 H347 V${height} H263z M263 0 H347 V${height} H263z`;
    case "\u23aa":
      return `M384 0 H504 V${height} H384z M384 0 H504 V${height} H384z`;
    case "\u23d0":
      return `M312 0 H355 V${height} H312z M312 0 H355 V${height} H312z`;
    case "\u2016":
      return (
        `M257 0 H300 V${height} H257z M257 0 H300 V${height} H257z` +
        `M478 0 H521 V${height} H478z M478 0 H521 V${height} H478z`
      );
    default:
      return "";
  }
};
