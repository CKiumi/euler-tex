import { ENVNAMES } from "../atom/matrix";

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
  Inline = "<$>",
  DisplayStart = "<\\[>",
  DisplayEnd = "<\\]>",
  Begin = "<begin>",
  End = "<end>",
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
    if (cur === "&") return Escape.And;
    if (cur === "\\") {
      let command = "\\" + this.readChar();
      if (command === "\\\\") return Escape.Newline;
      if (command === "\\ ") return Escape.Space;
      if (command === "\\[") return Escape.DisplayStart;
      if (command === "\\]") return Escape.DisplayEnd;
      if (command === "\\}" || command === "\\{" || command === "\\|")
        return command;
      while (!this.end() && /^[a-zA-Z*&#]+/.test(this.peek())) {
        this.readChar();
        command += this.cur();
      }
      if (command === "\\left") return Escape.Left;
      if (command === "\\right") return Escape.Right;
      if (command === "\\begin") return Escape.Begin;
      if (command === "\\end") return Escape.End;
      return command;
    } else return cur;
  }

  peekToken() {
    const tmp = this.pos;
    const token = this.tokenize(false);
    this.pos = tmp;
    return token;
  }

  readEnvName(): typeof ENVNAMES[number] {
    let envName = "" as typeof ENVNAMES[number];
    while (!this.end() && /^[a-zA-Z*\s]+/.test(this.peek() ?? "")) {
      this.readChar();
      envName += this.cur();
    }

    return envName;
  }

  readLabel() {
    let envName = "";
    while (!this.end() && /^[a-zA-Z0-9*\s]+/.test(this.peek() ?? "")) {
      this.readChar();
      envName += this.cur();
    }
    return envName;
  }
}
