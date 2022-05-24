import { HBox, RectBox, SymBox, VBox, VStackBox } from "/src/lib";
import { expect, test } from "vitest";

const a = new SymBox("a", "Math-I");
const hbox = new HBox([a, a]);
const vStackbox = new VStackBox([a, hbox], 3);
const rectBox = new RectBox({ height: 1, depth: 0.5, width: 2 });

test("symbol box", () => {
  expect(a.toHtml()).toMatchSnapshot();
});

test("hBox box", () => {
  expect(hbox.toHtml()).toMatchSnapshot();
});

test("vBox box", () => {
  const vbox = new VBox([
    { box: a, shift: 1 },
    { box: hbox, shift: -0.5 },
  ]);
  expect(vbox.toHtml()).toMatchSnapshot();
  const vbox2 = new VBox([{ box: a, shift: 1 }]);
  expect(vbox2.toHtml()).toMatchSnapshot();
});

test("vStackBox box", () => {
  expect(vStackbox.toHtml()).toMatchSnapshot();
});

test("rect box", () => {
  expect(rectBox.toHtml()).toMatchSnapshot();
});
