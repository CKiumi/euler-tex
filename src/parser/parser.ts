import {
  AccentAtom,
  Atom,
  LRAtom,
  OverlineAtom,
  SqrtAtom,
  SymAtom,
  FracAtom,
  MatrixAtom,
  SupSubAtom,
  GroupAtom,
} from "../atom/atom";
import { Escape, Lexer, Token } from "./lexer";
import { AtomKind, Font } from "../font";
import {
  ACC,
  fontMap,
  LETTER1,
  LETTER2,
  BLOCKOP,
  OP,
  LETTER3,
  AMS_REL,
  AMS_BIN,
  AMS_ARROW,
  ARROW,
  REL,
  PUNCT,
  BIN,
  AMS_NBIN,
  AMS_NREL,
  AMS_MISC,
  MISC,
  OPEN,
  CLOSE,
  INNER,
} from "./command";
import { OpAtom } from "../atom/op";

export class Parser {
  lexer: Lexer;
  font: Font | null = null;
  constructor(latex: string, public editable = false) {
    this.lexer = new Lexer(latex);
  }
  parseSingle(atoms: Atom[], token: Token) {
    if (/[A-Za-z]/.test(token))
      return new SymAtom("ord", token, ["Math-I", this.font]);
    if (/[0-9]/.test(token))
      return new SymAtom("ord", token, ["Main-R", this.font]);
    if (token === "+") return new SymAtom(binOrOrd(atoms), "+", ["Main-R"]);
    if (token === "-") return new SymAtom(binOrOrd(atoms), "−", ["Main-R"]);
    if (token === "*") return new SymAtom(binOrOrd(atoms), "∗", ["Main-R"]);
    if (token === "/") return new SymAtom(binOrOrd(atoms), "/", ["Main-R"]);
    if (token === "=") return new SymAtom("rel", "=", ["Main-R"]);
    if (token === ",") return new SymAtom("punct", ",", ["Main-R"]);
    if (token === ".") return new SymAtom("ord", ".", ["Main-R"]);
    if (token === ";") return new SymAtom("punct", ";", ["Main-R"]);
    if (token === ":") return new SymAtom("rel", ":", ["Main-R"]);
    if (token === "<") return new SymAtom("rel", "<", ["Main-R"]);
    if (token === ">") return new SymAtom("rel", ">", ["Main-R"]);
    if (token === "?") return new SymAtom("close", "?", ["Main-R"]);
    if (token === "!") return new SymAtom("close", "!", ["Main-R"]);
    // eslint-disable-next-line quotes
    if (token === '"') return new SymAtom("ord", '"', ["Main-R"]);
    console.error(`Single token ${token} not supported`);
    return new SymAtom("close", "?", ["Main-R"]);
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
    if (token === "(") {
      atoms.push(
        new LRAtom("(", ")", new GroupAtom(this.parse(")"), this.editable))
      );
      return;
    }
    if (token === "\\{") {
      atoms.push(
        new LRAtom("{", "}", new GroupAtom(this.parse("\\}"), this.editable))
      );
      return;
    }
    if (token === "[") {
      atoms.push(
        new LRAtom("[", "]", new GroupAtom(this.parse("]"), this.editable))
      );
      return;
    }
    if (token === Escape.Fence) {
      atoms.push(
        new LRAtom(
          "∣",
          "∣",
          new GroupAtom(this.parse(Escape.Fence), this.editable)
        )
      );
      return;
    }

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
      if (fontMap[token.slice(1)]) {
        this.font = fontMap[token.slice(1)];
        atoms.push(...this.parseArg(atoms).body);
        this.font = null;
      }
      if (BLOCKOP[token]) {
        atoms.push(new SymAtom("op", BLOCKOP[token], ["Size2"], false));
      }
      if (OP.includes(token)) atoms.push(new OpAtom(token.slice(1)));
      if (token === "\\sqrt") atoms.push(new SqrtAtom(this.parseArg(atoms)));
      if (token === "\\frac") {
        atoms.push(new FracAtom(this.parseArg(atoms), this.parseArg(atoms)));
      }
      if (token === "\\overline") {
        atoms.push(new OverlineAtom(this.parseArg(atoms)));
      }
      if (ACC[token]) {
        const acc = new SymAtom("ord", ACC[token], ["Main-R"], false);
        atoms.push(new AccentAtom(this.parseArg(atoms), acc));
      }
      if (token === "\\begin") {
        this.parseEnvName();
        atoms.push(this.parseMatrix());
      }
      if (LETTER1[token]) {
        atoms.push(new SymAtom("ord", LETTER1[token], ["Math-I", this.font]));
      }

      if (LETTER2[token]) {
        atoms.push(new SymAtom("ord", LETTER2[token], ["Main-R"]));
      }
      if (LETTER3[token]) {
        atoms.push(new SymAtom("ord", LETTER3[token], ["Main-R"]));
      }
      if (MISC[token]) {
        atoms.push(new SymAtom("ord", MISC[token], ["Main-R"]));
      }
      if (OPEN[token]) {
        atoms.push(new SymAtom("open", OPEN[token], ["Main-R"]));
      }
      if (CLOSE[token]) {
        atoms.push(new SymAtom("close", CLOSE[token], ["Main-R"]));
      }
      if (INNER[token]) {
        atoms.push(new SymAtom("close", INNER[token], ["Main-R"]));
      }
      if (PUNCT[token]) {
        atoms.push(new SymAtom("punct", PUNCT[token], ["Main-R"]));
      }
      if (REL[token]) {
        atoms.push(new SymAtom("rel", REL[token], ["Main-R"]));
      }
      if (BIN[token]) {
        atoms.push(new SymAtom(binOrOrd(atoms), BIN[token], ["Main-R"]));
      }
      if (ARROW[token]) {
        atoms.push(new SymAtom("rel", ARROW[token], ["Main-R"]));
      }
      if (AMS_ARROW[token]) {
        atoms.push(new SymAtom("rel", AMS_ARROW[token], ["AMS-R"]));
      }
      if (AMS_BIN[token]) {
        atoms.push(new SymAtom(binOrOrd(atoms), AMS_BIN[token], ["AMS-R"]));
      }
      if (AMS_NBIN[token]) {
        atoms.push(new SymAtom(binOrOrd(atoms), AMS_NBIN[token], ["AMS-R"]));
      }
      if (AMS_MISC[token]) {
        atoms.push(new SymAtom("ord", AMS_MISC[token], ["AMS-R"]));
      }
      if (AMS_REL[token]) {
        if (token === "\\Join") {
          atoms.push(new SymAtom("rel", AMS_REL[token], ["Main-R"]));
          return;
        }
        atoms.push(new SymAtom("rel", AMS_REL[token], ["AMS-R"]));
      }
      if (AMS_NREL[token]) {
        atoms.push(new SymAtom("rel", AMS_NREL[token], ["AMS-R"]));
      }
      // console.log(atoms.map((x) => [x.char, x.fonts]));
    }
  }

  private parseLR(): Atom {
    const left = this.lexer.tokenize();
    if (left === "(") {
      const body = this.parse(Escape.Right);
      this.lexer.tokenize();
      return new LRAtom("(", ")", new GroupAtom(body, this.editable)) as Atom;
    } else if (left === "\\{") {
      const body = this.parse(Escape.Right);
      this.lexer.tokenize();
      return new LRAtom("{", "}", new GroupAtom(body, this.editable)) as Atom;
    } else if (left === "[") {
      const body = this.parse(Escape.Right);
      this.lexer.tokenize();
      return new LRAtom("[", "]", new GroupAtom(body, this.editable)) as Atom;
    } else if (left === Escape.Fence) {
      const body = this.parse(Escape.Right);
      this.lexer.tokenize();
      return new LRAtom("∣", "∣", new GroupAtom(body, this.editable)) as Atom;
    } else if (left === "\\|") {
      const body = this.parse(Escape.Right);
      this.lexer.tokenize();
      return new LRAtom("∥", "∥", new GroupAtom(body, this.editable)) as Atom;
    } else if (left === "<") {
      const body = this.parse(Escape.Right);
      this.lexer.tokenize();
      return new LRAtom("⟨", "⟩", new GroupAtom(body, this.editable)) as Atom;
    } else {
      throw new Error("Unsupported Left Right");
    }
  }

  parseArg(atoms: Atom[]): GroupAtom {
    const token = this.lexer.tokenize();
    if (token === Escape.LCurly)
      return new GroupAtom(this.parse(Escape.RCurly), this.editable);
    else return new GroupAtom([this.parseSingle(atoms, token)], this.editable);
  }

  parseEnvName(): string {
    const token = this.lexer.tokenize();
    if (token === Escape.LCurly) {
      const envName = this.lexer.readEnvName();
      if (this.lexer.tokenize() != Escape.RCurly) throw new Error("Expected }");
      if (
        [
          "matrix",
          "pmatrix",
          "bmatrix",
          "Bmatrix",
          "vmatrix",
          "Vmatrix",
          "aligned",
          "cases",
        ].includes(envName)
      )
        return envName;
      else throw new Error("Unknown environment name");
    } else throw new Error("{ expected after \\begin and \\end");
  }

  parseMatrix() {
    const element: GroupAtom[][] = [[new GroupAtom([], this.editable)]];
    for (;;) {
      let row = element[element.length - 1];
      const token = this.lexer.tokenize();
      if (token === Escape.EOF) throw new Error("\\end expected");
      if (token === "\\end") {
        if (row.length === 1 && row[0].body.length === 0) {
          element.pop();
        }
        const envName = this.parseEnvName();
        return new MatrixAtom(element, envName as "pmatrix");
      }
      if (token === Escape.And) row.push(new GroupAtom([], this.editable));
      if (token === Escape.Newline) {
        row = [new GroupAtom([], this.editable)];
        element.push(row);
      }
      this.parseOne(token, row[row.length - 1].body);
    }
  }
}

export const binOrOrd = (atoms: Atom[]): AtomKind => {
  const kind = /bin|op|rel|open|punct/.test(
    atoms[atoms.length - 1]?.kind ?? "bin"
  )
    ? "ord"
    : "bin";
  return kind;
};

export const parse = (latex: string, editable = false): Atom[] => {
  return new Parser(latex, editable).parse(Escape.EOF);
};
