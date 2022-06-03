import fontkit from "fontkit";
import { promises as fs } from "fs";

//Build font.css and spec.ts files
const fontDir = "./woff";
const cssDir = "./css/font.css";
const srcDir = "./src/font/spec.ts";
const result: { [key: string]: { ascent: number; descent: number } } = {};

let [type, css] = ["", ""];

const main = async () => {
  const files = await fs.readdir(fontDir);

  files.forEach((file) => {
    const font = fontkit.openSync(fontDir + "/" + file);
    const { ascent, descent } = font;

    result[file.split(".")[0]] = {
      ascent: ascent / 1000,
      descent: -descent / 1000,
    };

    const fontName = file.split(".")[0];
    type += `"${fontName}",`;
    css += `
    .${fontName.toLowerCase()} {
      font-family: "${fontName}";
    }\n`;
  });

  fs.writeFile(cssDir, css);

  fs.writeFile(
    srcDir,
    `export const FontList = [${type}] as const;\n
     export type Font = typeof FontList[number];\n
     export const SPEC= ${JSON.stringify(result)};`
  );
};

main();
