import "./style.css";
import katex from "katex";
import "katex/dist/katex.min.css";
const app = document.querySelector<HTMLDivElement>("#app");
if (app) {
  app.innerHTML = "<h1>Euler Tex</h1>";
  katex.render("c = \\pm\\sqrt{a^2 + b^2}", app, {
    throwOnError: false,
  });
}
