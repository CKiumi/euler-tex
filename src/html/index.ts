export * from "./svg/inner";
export * from "./svg/pathNode";
export * from "./svg/sqrt";

export const html = <K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  options: {
    text?: string;
    cls?: string[];
    id?: string;
    style?: Partial<CSSStyleDeclaration>;
    children?: HTMLElement[];
  }
): HTMLElementTagNameMap[K] => {
  const span = document.createElement(tagName);
  Object.assign(span.style, options.style);
  options.id && (span.id = options.id);
  options.cls && span.classList.add(...options.cls);
  options.text && (span.innerText = options.text);
  options.children && span.append(...options.children);
  return span;
};
