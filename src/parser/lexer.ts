export enum Escape {
  Space = "<space>",
  EOF = "EOF",
  Left = "<left>",
  Right = "<right>",
  Circumfix = "<^>",
  UnderScore = "<_>",
  LCurly = "<{>",
  RCurly = "<}>",
  And = "<&>",
  Newline = "<\\\\>",
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
  tokenize(): Token {
    this.skipSpaces();
    const cur = this.readChar();
    if (cur === null) return Escape.EOF;
    if (cur === "^") return Escape.Circumfix;
    if (cur === "_") return Escape.UnderScore;
    if (cur === "{") return Escape.LCurly;
    if (cur === "}") return Escape.RCurly;
    if (cur === "&") return Escape.And;
    if (cur === "\\") {
      let command = "\\";
      if (this.peek() === "\\") {
        this.readChar();
        return Escape.Newline;
      }
      while (!this.end() && /^[a-zA-Z*]+/.test(this.peek())) {
        this.readChar();
        command += this.cur();
      }
      if (command === "\\left") return Escape.Left;
      if (command === "\\right") return Escape.Right;
      return command;
    } else return cur;
  }
}
