import { MathGroup, Article } from "./atom/atom";
import { Options, TEXT } from "./box/style";
import { FontList } from "./font/spec";
import { html } from "./html";
import { parse, prarseMath } from "./parser/parser";
export * from "./atom/atom";
export * from "./box/box";
export * from "./font";
export * from "./parser/parser";

export const loadFont = () => {
  FontList.forEach((name) => {
    let [bold, italic] = [false, false];
    const [fname, attr] = name.split("-");
    if (attr?.includes("B")) bold = true;
    if (attr?.includes("I")) italic = true;
    const url = new URL(`../woff/${name}.woff2`, import.meta.url).href;
    const font = new FontFace(fname, `url(${url}) format('woff2')`, {
      style: italic ? "italic" : "normal",
      weight: bold ? "bold" : "normal",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (document.fonts as any).add(font);
    font.load().catch(console.log);
  });
};

export const MathLatexToHtml = (
  latex: string,
  mode: "inline" | "display" | "text" = "display"
) => {
  const html = (() => {
    if (mode === "inline") {
      return new MathGroup(prarseMath(latex))
        .toBox(new Options(6, TEXT))
        .toHtml();
    } else if (mode === "display") {
      return new MathGroup(prarseMath(latex)).toBox(new Options()).toHtml();
    } else {
      return new MathGroup(parse(latex)).toBox(new Options()).toHtml();
    }
  })();
  html.className = mode;
  return html;
};

export const latexToArticle = (latex: string) => new Article(parse(latex));

export const setLabels = (article: HTMLSpanElement) => {
  const labelHash: { [key: string]: string } = {};
  const thmCtr: { [x: string]: number } = {};
  const thms = article.querySelectorAll(".theorem");
  thms.forEach((thm) => {
    const lbl = thm.getAttribute("label");
    if (thm.classList.contains("nonum")) return;
    const label = thm.querySelector(".label");
    const labelName = label?.textContent ?? "";
    label?.querySelector(".counter")?.remove();
    thmCtr[labelName] ? thmCtr[labelName]++ : (thmCtr[labelName] = 1);
    const num = html("span", {
      cls: ["counter"],
      text: ` ${thmCtr[labelName]}.`,
    });
    label?.insertAdjacentElement("beforeend", num);
    if (lbl) labelHash[lbl] = `${thmCtr[labelName]}`;
  });
  let [sectCtr, subSecCtr, subSubsectCtr] = [0, 0, 0];
  const sections = article.querySelectorAll(".section");
  sections.forEach((section) => {
    section.querySelectorAll(".label").forEach((lab) => lab.remove());
    const lbl = section.getAttribute("label");
    if (section.classList.contains("subsection")) {
      subSecCtr++;
      const label = html("span", {
        cls: ["label"],
        text: `${sectCtr}.${subSecCtr}`,
      });
      section.insertAdjacentElement("afterbegin", label);
      if (lbl) labelHash[lbl] = `${sectCtr}.${subSecCtr}`;
    } else if (section.classList.contains("subsubsection")) {
      subSubsectCtr++;
      const label = html("span", {
        cls: ["label"],
        text: `${sectCtr}.${subSecCtr}.${subSubsectCtr}`,
      });
      section.insertAdjacentElement("afterbegin", label);
      if (lbl) labelHash[lbl] = `${sectCtr}.${subSecCtr}.${subSubsectCtr}`;
    } else {
      sectCtr++;
      const label = html("span", { cls: ["label"], text: `${sectCtr}` });
      section.insertAdjacentElement("afterbegin", label);
      if (lbl) labelHash[lbl] = `${sectCtr}`;
    }
  });
  const tags = article.querySelectorAll(".tag");
  let counter = 1;

  tags.forEach((label) => {
    Array.from(label.children)
      .reverse()
      .forEach((child) => {
        const label = child.textContent?.replace("(", "").replace(")", "");
        child.innerHTML = `(${counter})`;
        label && (labelHash[label] = `${counter}`);
        counter++;
      });
  });
  const refs = article.querySelectorAll(".ref");
  refs.forEach((ref) => {
    const label = ref.textContent?.replace("(", "").replace(")", "");
    label && (ref.innerHTML = `${labelHash[label] ?? "?"}`);
  });
};
