import { Atom, LRAtom, SqrtAtom, SymAtom } from "./atom/atom";
import { SupSubAtom } from "./atom/supsub";
import { Escape, Lexer, Token } from "./lexer";

export class Parser {
  lexer: Lexer;
  constructor(lexer: Lexer) {
    this.lexer = lexer;
  }
  parseSingle(token: Token) {
    if (/[A-Za-z]/.test(token)) return new SymAtom("ord", token, "Math-I");
    if (/[0-9]/.test(token)) return new SymAtom("ord", token, "Main-R");
    if (token === "+") return new SymAtom("bin", "+", "Main-R");
    if (token === "-") return new SymAtom("bin", "−", "Main-R");
    if (token === "=") return new SymAtom("rel", "=", "Main-R");
    if (token === ",") return new SymAtom("punct", ",", "Main-R");
    throw new Error(`Single token ${token} not supported`);
  }
  parse(end: Token): Atom[] {
    const atoms: Atom[] = [];
    for (;;) {
      const token = this.lexer.tokenize();
      if (token === end) break;
      if (token === Escape.EOF) throw new Error(`Expected ${end}`);
      if (token.length === 1) atoms.push(this.parseSingle(token));
      if (token === Escape.Left) atoms.push(this.parseLR());
      if (token === Escape.Circumfix) {
        const body = atoms.pop();
        if (!body) throw new Error("body must exist");
        if (body instanceof SupSubAtom) {
          if (!body.sub) throw new Error("sub must exist");
          atoms.push(new SupSubAtom(body, this.parseArg(), body.sub.slice(1)));
        } else atoms.push(new SupSubAtom(body, this.parseArg(), undefined));
      }
      if (token === Escape.UnderScore) {
        const body = atoms.pop();
        if (!body) throw new Error("body must exist");
        if (body instanceof SupSubAtom) {
          if (!body.sup) throw new Error("sub must exist");
          atoms.push(new SupSubAtom(body, body.sup.slice(1), this.parseArg()));
        } else atoms.push(new SupSubAtom(body, undefined, this.parseArg()));
      }
      if (token.startsWith("\\")) {
        if (token === "\\sum") atoms.push(new SymAtom("op", "∑", "Size2"));
        if (token === "\\int") atoms.push(new SymAtom("op", "∫", "Size2"));
        if (token === "\\sqrt") atoms.push(new SqrtAtom(this.parseArg()));
        const key = Object.keys(LETTER).find((l) => token === l);
        if (key) atoms.push(new SymAtom("ord", LETTER[key], "Math-I"));
      }
    }
    return atoms;
  }
  private parseLR(): Atom {
    const left = this.lexer.tokenize();
    const body = this.parse(Escape.Right);
    this.lexer.tokenize();
    return new LRAtom(left, ")", body) as Atom;
  }
  parseArg() {
    const token = this.lexer.tokenize();
    if (token === Escape.LCurly) return this.parse(Escape.RCurly);
    else return [this.parseSingle(token)];
  }
}

export const parse = (latex: string): Atom[] => {
  return new Parser(new Lexer(latex)).parse(Escape.EOF);
};

export const LETTER: { [key: string]: string } = {
  "\\alpha": "α",
  "\\beta": "β",
  "\\gamma": "γ",
  "\\delta": "δ",
  "\\epsilon": "ε",
  "\\lambda": "λ",
  "\\zeta": "ζ",
  "\\eta": "η",
};
