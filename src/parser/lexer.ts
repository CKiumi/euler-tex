export enum Escape {
  Space = "<space>",
  EOF = "EOF",
  Left = "<left>",
  Right = "<right>",
  Fence = "<|>",
  Circumfix = "<^>",
  UnderScore = "<_>",
  LCurly = "<{>",
  RCurly = "<}>",
  And = "<&>",
  Newline = "<\\\\>",
  Inline = "<$>",
}

export type Token = string | Escape;
export class Lexer {
  private s: string;
  private pos: number;
  constructor(s: string) {
    this.s = s;
    this.pos = -1;
  }
  end = (): boolean => this.pos === this.s.length - 1;
  cur = (): string | null => this.s[this.pos];
  peek = (): string => this.s[this.pos + 1];
  readChar = (): string | null =>
    this.pos < this.s.length - 1 ? this.s[++this.pos] : null;
  skipSpaces(): void {
    while (this.peek() === " ") {
      this.readChar();
    }
  }
  tokenize(skipSpace = true): Token {
    skipSpace && this.skipSpaces();
    const cur = this.readChar();
    if (cur === null) return Escape.EOF;
    if (cur === "$") return Escape.Inline;
    if (cur === "^") return Escape.Circumfix;
    if (cur === "_") return Escape.UnderScore;
    if (cur === "{") return Escape.LCurly;
    if (cur === "}") return Escape.RCurly;
    if (cur === "|") return Escape.Fence;
    if (cur === "&") return Escape.And;
    if (cur === "\\") {
      let command = "\\";
      if (this.peek() === "\\") {
        this.readChar();
        return Escape.Newline;
      }
      if (this.peek() === "{" || this.peek() === "}" || this.peek() === "|") {
        this.readChar();
        command += this.cur();
        return command;
      }
      while (!this.end() && /^[a-zA-Z*&#]+/.test(this.peek())) {
        this.readChar();
        command += this.cur();
      }

      if (command === "\\left") return Escape.Left;
      if (command === "\\right") return Escape.Right;
      return command;
    } else return cur;
  }

  peekToken() {
    const tmp = this.pos;
    const token = this.tokenize(false);
    this.pos = tmp;
    return token;
  }

  readEnvName() {
    let envName = "";
    while (!this.end() && /^[a-zA-Z*\s]+/.test(this.peek() ?? "")) {
      this.readChar();
      envName += this.cur();
    }
    return envName;
  }
}
