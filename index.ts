import katex from "katex";
import "katex/dist/katex.min.css";
const main = () => {
  render("Symbols", "abcdefghijk\\int");
  render("Accent", "\\hat{x} \\tilde{y} \\tilde{K} \\hat{\\int}");
  render("Square Root", "\\sqrt{a} \\sqrt{K} \\sqrt{\\int} ");
  render("Left Right Parentheses", "\\left(x+y\\right) \\left(\\int+y\\right)");
  render("Superscript Subscript", "x^a f^G K_s s_f x_a^b \\sum_x^y \\int_x^y");
};
const render = (title: string, latex: string) => {
  const main = document.getElementById("main");
  const h1 = document.createElement("h1");
  h1.innerText = title;
  const line = document.createElement("span");
  line.classList.add("ruler");
  main && main.append(h1, line);
  katex.render(latex, line, { displayMode: true });
};

main();
