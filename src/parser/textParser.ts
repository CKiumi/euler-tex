import { Escape, Lexer } from "./lexer";

type Mode = "text" | "display" | "inline" | "align";

interface LatexBlock {
  mode: "text" | "display" | "inline" | "align";
  latex: string;
}

const ENV_LIST = ["equation", "equation*", "align", "align*"];

class Parser {
  lexer: Lexer;
  mode: Mode = "text";
  envName: string | null = null;
  constructor(s: string) {
    this.lexer = new Lexer(s);
  }
  parse(): LatexBlock[] {
    const results: LatexBlock[] = [];
    for (;;) {
      if (this.mode === "text") {
        const text = this.parseText();
        if (text !== "") results.push({ mode: "text", latex: text });
        if (this.lexer.peekToken() === Escape.EOF) break;
        continue;
      }
      if (this.mode === "inline") {
        results.push({ mode: "inline", latex: this.parseInline() });
        continue;
      }
      if (this.mode === "display" && this.envName) {
        if (this.envName === "align" || this.envName === "align*") {
          results.push({ mode: "align", latex: this.parseEnv() });
        } else {
          results.push({ mode: "display", latex: this.parseEnv() });
        }
        continue;
      }
    }
    return results;
  }

  private parseText(): string {
    let result = "";
    for (;;) {
      const token = this.lexer.peekToken();
      if (token === Escape.EOF) return result;
      if (token === Escape.Inline) {
        this.mode = "inline";
        return result;
      }
      if (token === "\\begin") {
        this.lexer.tokenize();
        this.lexer.skipSpaces();
        if (this.lexer.tokenize() !== Escape.LCurly) {
          throw new Error("{ expected after \\begin or \\end");
        }
        const envName = this.lexer.readEnvName();
        if (this.lexer.tokenize() != Escape.RCurly) {
          throw new Error("Expected }");
        }
        if (ENV_LIST.includes(envName)) {
          this.mode = "display";
          this.envName = envName;
        } else {
          throw new Error(`Unsupported environment ${envName}`);
        }

        return result;
      }
      result += this.lexer.readChar();
    }
  }

  parseInline(): string {
    let result = "";
    this.lexer.tokenize();
    for (;;) {
      const token = this.lexer.peekToken();
      if (token === Escape.EOF) throw new Error("Expected $");
      if (token === Escape.Inline) {
        this.mode = "text";
        this.lexer.tokenize();
        return result;
      }
      result += this.lexer.readChar();
    }
  }

  parseEnv(): string {
    let result = "";
    for (;;) {
      const token = this.lexer.peekToken();
      if (token === Escape.EOF) {
        throw new Error(`Expected \\end{${this.envName}}`);
      }
      if (token === "\\end") {
        this.lexer.tokenize();
        this.lexer.skipSpaces();
        if (this.lexer.tokenize() === Escape.LCurly) {
          const envName = this.lexer.readEnvName();
          if (this.lexer.tokenize() != Escape.RCurly)
            throw new Error("Expected }");
          if (envName === this.envName) {
            this.mode = "text";
            this.envName = null;
            return result;
          }
          continue;
        } else {
          new Error("{ expected after \\end");
        }
      }
      result += this.lexer.readChar();
    }
  }
}

export const latexToBlocks = (latex: string): LatexBlock[] => {
  latex = replaceAll(latex, "\\[", "\\begin{equation*}");
  latex = replaceAll(latex, "\\]", "\\end{equation*}");
  return new Parser(latex).parse();
};

const replaceAll = (text: string, target: string, replacement: string) => {
  return text.split(target).join(replacement);
};
