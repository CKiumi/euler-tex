import { MathGroup } from "./atom/atom";
import { Article } from "./atom/block";
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
      return new Article(parse(latex)).render();
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
    if (thm.classList.contains("nonum")) return;
    const label = thm.querySelector(".label");
    label?.querySelector(".counter")?.remove();
    const lbName = label?.textContent ?? "";
    thmCtr[lbName] ? thmCtr[lbName]++ : (thmCtr[lbName] = 1);
    label?.append(
      html("span", { cls: ["counter"], text: ` ${thmCtr[lbName]}.` })
    );
    const lbl = thm.getAttribute("label");
    if (lbl) labelHash[lbl] = `${thmCtr[lbName]}`;
  });
  let [sectCtr, subSecCtr, subSubsectCtr] = [0, 0, 0];
  const sections = article.querySelectorAll(".section");
  sections.forEach((section) => {
    section.querySelectorAll(".label").forEach((lab) => lab.remove());
    let text;
    if (section.classList.contains("subsection")) {
      subSecCtr++;
      text = `${sectCtr}.${subSecCtr}`;
    } else if (section.classList.contains("subsubsection")) {
      subSubsectCtr++;
      text = `${sectCtr}.${subSecCtr}.${subSubsectCtr}`;
    } else {
      sectCtr++;
      text = `${sectCtr}`;
    }
    section.prepend(html("span", { cls: ["label"], text }));
    const lbl = section.getAttribute("label");
    if (lbl) labelHash[lbl] = text;
  });
  let counter = 1;
  const eqs = article.querySelectorAll(".display");
  eqs.forEach((eq) => {
    const lbl = eq.getAttribute("label");
    const label = eq.querySelector(".tag")?.children[0] as HTMLElement;
    if (!label) return;
    label.innerText = `(${counter})`;
    if (lbl) labelHash[lbl] = `${counter}`;
    counter++;
  });
  const align = article.querySelectorAll(".align");
  align.forEach((eq) => {
    const lbls = eq.getAttribute("label")?.split("\\");
    const labels = eq.querySelector(".tag")?.children;
    if (!labels) return;
    (Array.from(labels) as HTMLElement[]).reverse().forEach((label, i) => {
      label.innerText = `(${counter})`;
      if (lbls) labelHash[lbls[i]] = `${counter}`;
      counter++;
    });
  });
  const refs = article.querySelectorAll(".ref");
  refs.forEach((ref) => {
    const lbl = ref.getAttribute("label");
    lbl && (ref.innerHTML = `${labelHash[lbl] ?? "?"}`);
  });
};
