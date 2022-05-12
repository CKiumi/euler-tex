import fontkit from "fontkit";
import { promises as fs } from "fs";

const fontDir = "./woff";
const cssDir = "../css/font.css";
const srcDir = "./src/spec.ts";
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
    type += `|"${fontName}"`;
    css += `@font-face {
      font-family: "${fontName}";
      src: url("../font/woff/${fontName}.woff2") format("woff2");
    }\n
    .${fontName.toLowerCase()} {
      font-family: "${fontName}";
    }\n\n`;
  });

  fs.writeFile(cssDir, css);

  fs.writeFile(
    srcDir,
    `export type Font= ${type};\n
     export const SPEC= ${JSON.stringify(result)};`
  );
};

main();
