import katex from "katex";
import "katex/dist/katex.min.css";
import { SymAtom } from "./src/atom";
import { toHBox } from "./src/box";
import { buildHBox } from "./src/builder";
const main = () => {
  const a: SymAtom = { char: "a", font: "Math-I", kind: "ord" };
  const f: SymAtom = { char: "f", font: "Math-I", kind: "ord" };
  const plus: SymAtom = { char: "+", font: "Main-R", kind: "bin" };
  const eq: SymAtom = { char: "=", font: "Main-R", kind: "rel" };
  const int: SymAtom = { char: "∫", font: "Size2", kind: "op" };
  render("Symbols", "a+f=\\int", buildHBox(toHBox([a, plus, f, eq, int])));
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
