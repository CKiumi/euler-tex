import { expect, test } from "vitest";
import { Options } from "../../src/box/style";

test("test option", () => {
  const options = new Options();
  expect(options).toEqual({
    size: 6,
    sizeMultiplier: 1,
    style: { cramped: false, id: 0, size: 0 },
    textSize: 6,
  });
  const sup1Options = options.getNewOptions(options.style.sup());
  expect(sup1Options).toEqual({
    size: 3,
    sizeMultiplier: 0.7,
    style: { cramped: false, id: 4, size: 2 },
    textSize: 6,
  });

  const sub1Options = options.getNewOptions(options.style.sub());
  expect(sub1Options).toEqual({
    size: 3,
    sizeMultiplier: 0.7,
    style: { cramped: true, id: 5, size: 2 },
    textSize: 6,
  });

  expect(sup1Options.getNewOptions(sup1Options.style.sup())).toEqual({
    size: 1,
    sizeMultiplier: 0.5,
    style: { cramped: false, id: 6, size: 3 },
    textSize: 6,
  });
});
