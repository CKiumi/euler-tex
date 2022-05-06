import katex from "katex";
import "katex/dist/katex.min.css";
import { Atom } from "./src/atom";
import { toHBox } from "./src/box";
import { buildHBox } from "./src/builder";
const main = () => {
  const atoms = "abcdefghijk"
    .split("")
    .map((char) => ({ char, font: "Math-I" } as Atom));
  atoms.push({ char: "∫", font: "Size2" });
  render("Symbols", "abcdefghijk\\int", buildHBox(toHBox(atoms)));
  render("Accent", "\\hat{x} \\tilde{y} \\tilde{K} \\hat{\\int}");
  render("Square Root", "\\sqrt{a} \\sqrt{K} \\sqrt{\\int} ");
  render("Left Right Parentheses", "\\left(x+y\\right) \\left(\\int+y\\right)");
  render("Superscript Subscript", "x^a f^G K_s s_f x_a^b \\sum_x^y \\int_x^y");
};
const render = (title: string, latex: string, result?: HTMLElement) => {
  const main = document.getElementById("main");
  const h1 = document.createElement("h1");
  h1.innerText = title;
  const line = document.createElement("span");
  line.classList.add("ruler");
  line.id = title;
  main && main.append(h1, line);
  katex.render(latex, line, { displayMode: true });
  if (result) {
    line.append(result);
  }
};

main();
