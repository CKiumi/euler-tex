import { ArticleAtom, GroupAtom } from "./atom/atom";
import { Options, TEXT } from "./box/style";
import { FontList } from "./font/spec";
import { html } from "./html";
import { parse } from "./parser/parser";
export * from "./atom/atom";
export * from "./box/box";
export * from "./font";
export * from "./parser/parser";

export const loadFont = () => {
  FontList.forEach((name) => {
    const url = new URL(`../woff/${name}.woff2`, import.meta.url).href;
    const font = new FontFace(name, `url(${url}) format('woff2')`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (document.fonts as any).add(font);
    font.load().catch(console.log);
  });
};

export const MathLatexToHtml = (
  latex: string,
  mode: "inline" | "display" = "display"
) => {
  if (mode === "inline") {
    const html = new GroupAtom(parse(latex))
      .toBox(new Options(6, TEXT))
      .toHtml();
    html.className = "inline";
    return html;
  } else {
    const html = new GroupAtom(parse(latex)).toBox(new Options()).toHtml();
    html.className = "display";
    return html;
  }
};

export const latexToArticle = (latex: string) => {
  return new ArticleAtom(parse(latex));
};

export const setLabels = (article: HTMLSpanElement) => {
  const thmCtr: { [x: string]: number } = {};
  const thms = article.querySelectorAll(".theorem");
  thms.forEach((thm) => {
    const label = thm.querySelector(".label");
    const labelName = label?.textContent ?? "";
    label?.querySelector(".counter")?.remove();
    thmCtr[labelName] ? thmCtr[labelName]++ : (thmCtr[labelName] = 1);
    const num = html("span", {
      cls: ["counter"],
      text: ` ${thmCtr[labelName]}.`,
    });
    label?.insertAdjacentElement("beforeend", num);
  });
  let [sectCtr, subSecCtr, subSubsectCtr] = [0, 0, 0];
  const sections = article.querySelectorAll(".section");
  sections.forEach((section) => {
    section.querySelectorAll(".label").forEach((lab) => lab.remove());
    if (section.classList.contains("sub")) {
      subSecCtr++;
      const label = html("span", {
        cls: ["label"],
        text: `${sectCtr}.${subSecCtr}`,
      });
      section.insertAdjacentElement("afterbegin", label);
    } else if (section.classList.contains("subsub")) {
      subSubsectCtr++;
      const label = html("span", {
        cls: ["label"],
        text: `${sectCtr}.${subSecCtr}.${subSubsectCtr}`,
      });
      section.insertAdjacentElement("afterbegin", label);
    } else {
      sectCtr++;
      const label = html("span", { cls: ["label"], text: `${sectCtr}` });
      section.insertAdjacentElement("afterbegin", label);
    }
  });
  const tags = article.querySelectorAll(".tag");
  let counter = 1;
  const labelHash: { [key: string]: number } = {};
  tags.forEach((label) => {
    Array.from(label.children)
      .reverse()
      .forEach((child) => {
        const label = child.textContent?.replace("(", "").replace(")", "");
        child.innerHTML = `(${counter})`;
        label && (labelHash[label] = counter);
        counter++;
      });
  });
  const refs = article.querySelectorAll(".ref");
  refs.forEach((ref) => {
    const label = ref.textContent?.replace("(", "").replace(")", "");
    label && (ref.innerHTML = `${labelHash[label]}`);
  });
};
