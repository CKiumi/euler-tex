import {
  AccentAtom,
  Atom,
  LRAtom,
  OverlineAtom,
  SqrtAtom,
  SymAtom,
} from "../atom/atom";
import { FracAtom } from "../atom/frac";
import { MatrixAtom } from "../atom/matrix";
import { SupSubAtom } from "../atom/supsub";
import { Escape, Lexer, Token } from "./lexer";
import { AtomKind } from "/font/src/sigma";

export class Parser {
  lexer: Lexer;
  constructor(lexer: Lexer) {
    this.lexer = lexer;
  }
  parseSingle(atoms: Atom[], token: Token) {
    if (/[A-Za-z]/.test(token)) return new SymAtom("ord", token, "Math-I");
    if (/[0-9]/.test(token)) return new SymAtom("ord", token, "Main-R");
    if (token === "+") return new SymAtom(binOrOrd(atoms), "+", "Main-R");
    if (token === "-") return new SymAtom(binOrOrd(atoms), "−", "Main-R");
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
      this.parseOne(token, atoms);
    }
    return atoms;
  }

  parseOne(token: string, atoms: Atom[]) {
    if (token.length === 1) atoms.push(this.parseSingle(atoms, token));
    if (token === Escape.Left) atoms.push(this.parseLR());
    if (token === Escape.Circumfix) {
      const body = atoms.pop();
      if (!body) throw new Error("body must exist");
      if (body instanceof SupSubAtom) {
        if (!body.sub) throw new Error("sub must exist");
        atoms.push(new SupSubAtom(body.nuc, this.parseArg(atoms), body.sub));
      } else atoms.push(new SupSubAtom(body, this.parseArg(atoms), undefined));
    }
    if (token === Escape.UnderScore) {
      const body = atoms.pop();
      if (!body) throw new Error("body must exist");
      if (body instanceof SupSubAtom) {
        if (!body.sup) throw new Error("sup must exist");
        atoms.push(new SupSubAtom(body.nuc, body.sup, this.parseArg(atoms)));
      } else atoms.push(new SupSubAtom(body, undefined, this.parseArg(atoms)));
    }
    if (token.startsWith("\\")) {
      if (token === "\\sum") atoms.push(new SymAtom("op", "∑", "Size2"));
      if (token === "\\int") atoms.push(new SymAtom("op", "∫", "Size2"));
      if (token === "\\sqrt") atoms.push(new SqrtAtom(this.parseArg(atoms)));
      if (token === "\\frac") {
        atoms.push(new FracAtom(this.parseArg(atoms), this.parseArg(atoms)));
      }
      if (token === "\\overline")
        atoms.push(new OverlineAtom(this.parseArg(atoms)));
      if (token === "\\hat") {
        const hat = new SymAtom("ord", "^", "Main-R");
        atoms.push(new AccentAtom(this.parseArg(atoms), hat));
      }
      if (token === "\\tilde") {
        const tilde = new SymAtom("ord", "~", "Main-R");
        atoms.push(new AccentAtom(this.parseArg(atoms), tilde));
      }
      if (token === "\\begin") {
        this.parseEnvName();
        atoms.push(new LRAtom("(", ")", [this.parseMatrix()]));
      }
      const key = Object.keys(LETTER).find((l) => token === l);
      if (key) atoms.push(new SymAtom("ord", LETTER[key], "Math-I"));
    }
  }

  private parseLR(): Atom {
    const left = this.lexer.tokenize();
    const body = this.parse(Escape.Right);
    this.lexer.tokenize();
    return new LRAtom(left, ")", body) as Atom;
  }
  parseArg(atoms: Atom[]) {
    const token = this.lexer.tokenize();
    if (token === Escape.LCurly) return this.parse(Escape.RCurly);
    else return [this.parseSingle(atoms, token)];
  }

  parseEnvName(): string {
    let envName = "";
    const token = this.lexer.tokenize();
    if (token === Escape.LCurly) {
      for (;;) {
        const token = this.lexer.tokenize();
        if (token === Escape.RCurly) break;
        if (token === Escape.EOF) throw new Error("} Expected");
        if (token.length !== 1) {
          throw new Error("Invalid environment in \\begin");
        }
        envName += token;
      }
      if (envName === "pmatrix") return envName;
      else throw new Error("Unknown environment name");
    } else throw new Error("{ expected after \\begin");
  }

  parseMatrix() {
    const element: Atom[][][] = [[[]]];
    for (;;) {
      let row = element[element.length - 1];
      const token = this.lexer.tokenize();
      if (token === Escape.EOF) throw new Error("\\end expected");
      if (token === "\\end") {
        if (row.length === 1 && row[0].length === 0) {
          element.pop();
        }
        this.parseEnvName();
        return new MatrixAtom(element);
      }
      if (token === Escape.And) row.push([]);
      if (token === Escape.Newline) {
        row = [[]];
        element.push(row);
      }
      this.parseOne(token, row[row.length - 1]);
    }
  }
}

const binOrOrd = (atoms: Atom[]): AtomKind => {
  const kind = /bin|op|rel|open|punct/.test(
    atoms[atoms.length - 1].kind ?? "bin"
  )
    ? "ord"
    : "bin";
  return kind;
};

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
