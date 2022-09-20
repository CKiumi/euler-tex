import {
  AccentAtom,
  Atom,
  DelimMap,
  Delims,
  FracAtom,
  MathGroup,
  LRAtom,
  MatrixAtom,
  OverlineAtom,
  SqrtAtom,
  SupSubAtom,
  SymAtom,
  TextGroup,
  MidAtom,
  MathAtom,
} from "../atom/atom";
import {
  Align,
  Block,
  Char,
  Display,
  Inline,
  Ref,
  Section,
  Theorem,
} from "../atom/block";
import { OpAtom } from "../atom/op";
import { AtomKind, Font } from "../font";
import { randStr } from "../util";
import { ACC, BLOCKOP, FontMap, OP, parseCommand, THM_ENV } from "./command";
import { Escape, Lexer, Token } from "./lexer";

export class Parser {
  lexer: Lexer;
  font: Font | null = null;
  mathFont: string | null = null;
  theorem: keyof typeof THM_ENV | null = null;
  italic = false;
  lastSect: Section | null = null;
  thmLabel: string | null = null;
  constructor(latex: string, public editable = false) {
    this.lexer = new Lexer(latex);
  }

  parseSingle(atoms: MathAtom[], token: Token) {
    const style = this.mathFont ? { font: this.mathFont } : undefined;
    if (/[A-Za-z]/.test(token))
      return new SymAtom("ord", token, token, ["Math-I", this.font], style);
    if (/[0-9]/.test(token))
      return new SymAtom("ord", token, token, ["Main-R", this.font], style);
    const cmd = parseCommand(token);
    if (cmd) {
      const { char, font } = cmd;
      const kind = cmd.kind === "bin" ? binOrOrd(atoms) : cmd.kind;
      return new SymAtom(kind, char, token, [font, this.font], style);
    }
    // console.error(`Single token ${token} not supported`);
    return new SymAtom("ord", token, token, ["Main-R"]);
  }

  parse(end: Token): (Char | Block)[] {
    const atoms: (Char | Block)[] = [];
    for (;;) {
      const token = this.lexer.tokenize(false);
      if (this.theorem && token === Escape.End) {
        if (this.parseEnvName() === this.theorem) break;
        throw new Error(`Expected \\end{${this.theorem}}`);
      }
      if (token === Escape.Begin) {
        const envName = this.parseEnvName();
        if (envName === "align" || envName === "align*") {
          atoms.push(this.parseEnv(envName) as Align);
          continue;
        } else if (envName === "equation*" || envName === "equation") {
          atoms.push(this.parseDisplay(envName));
          continue;
        } else if (envName in THM_ENV) {
          atoms.push(this.parseThm(envName as keyof typeof THM_ENV));
          continue;
        }
        throw new Error("Unsupported environment " + envName);
      }
      if (this.theorem && token === "\\label") {
        this.thmLabel = this.parseTextArg();
        continue;
      }
      if (this.lastSect && token === "\\label") {
        this.lastSect.label = this.parseTextArg();
        continue;
      }
      if (token === Escape.Inline) {
        atoms.push(this.parseInline());
        continue;
      }
      if (token === Escape.DisplayStart) {
        atoms.push(this.parseDisplay(null));
        continue;
      }
      if (token === end) break;
      if (token === Escape.EOF) throw new Error(`Expected ${end}`);
      if (token === "\\ref") {
        const label = this.parseTextArg();
        atoms.push(new Ref(label, null));
        continue;
      }
      if (token === "\\cite") {
        this.parseTextArg();
        continue;
      }
      if (FontMap[token]) {
        this.font = FontMap[token];
        if (token.startsWith("\\text")) {
          atoms.push(...(this.parseTextFont(FontMap[token], "text") as Char[]));
          this.font = null;
        }
        continue;
      }
      if (/\\section|\\subsection|\\subsubsection/.test(token)) {
        const title = Array.from(this.parseTextArg()).map(
          (char) => new Char(char, null)
        );
        this.lastSect = new Section(title, token.slice(1) as "section");
        atoms.push(this.lastSect);
        continue;
      }
      atoms.push(new Char(token, null));
    }
    return atoms;
  }

  parseTextFont(font: Font, mode: "text" | "math"): (Atom | Char)[] {
    const atoms: (Atom | Char)[] = [];
    this.lexer.tokenize();
    for (;;) {
      const token = this.lexer.tokenize(false);
      if (token === Escape.RCurly) break;
      if (token === Escape.EOF) break;
      if (mode === "text") atoms.push(new Char(token, font));
      else atoms.push(new SymAtom(null, token, token, [font]));
    }
    return atoms;
  }

  parseInline() {
    const atoms: MathAtom[] = [];
    for (;;) {
      const token = this.lexer.tokenize();
      if (token === Escape.Inline) break;
      if (token === Escape.EOF) throw new Error("Expected $ to end inline");
      atoms.push(this.parseSingleMath(token, atoms));
    }
    return new Inline(atoms);
  }

  parseDisplay(mode: "equation" | "equation*" | null) {
    const atoms: MathAtom[] = [];
    let label: string | null = null;
    if (mode === "equation") label = randStr();
    for (;;) {
      const token = this.lexer.tokenize();
      if (!mode && token === Escape.DisplayEnd) break;
      if (mode && token === Escape.End) {
        if (this.parseEnvName() === mode) break;
        throw new Error(`Expected \\end{${mode}}`);
      }
      if (mode === "equation" && token === "\\label") {
        label = this.parseTextArg();
        continue;
      }
      if (token === Escape.EOF)
        throw new Error("Expected \\] to end display mode");
      atoms.push(this.parseSingleMath(token, atoms));
    }
    return new Display(new MathGroup(atoms), label);
  }

  parseThm(envName: keyof typeof THM_ENV): Theorem {
    if (envName in THM_ENV) {
      this.theorem = envName;
      if (THM_ENV[envName].italic) this.italic = true;
      const atom = new Theorem(
        this.parse(Escape.EOF),
        THM_ENV[this.theorem],
        this.thmLabel ?? randStr()
      );
      this.theorem = null;
      this.italic = false;
      return atom;
    }
    throw new Error("Unsupported theorem " + envName);
  }

  parseTextArg(): string {
    const token = this.lexer.tokenize();
    if (token === Escape.LCurly) {
      const label = this.lexer.readLabel();
      if (this.lexer.tokenize() != Escape.RCurly) throw new Error("Expected }");
      return label;
    }
    return "";
  }

  parseSingleMath(token: string, atoms: MathAtom[]): MathAtom {
    if (token.length === 1) return this.parseSingle(atoms, token);
    if (token === Escape.Space) return new SymAtom("ord", "\u00A0", "\\ ", []);
    if (token === Escape.Left) return this.parseLR();
    if (token === Escape.Circumfix) {
      const body = atoms.pop();
      if (!body) throw new Error("body must exist");
      if (body instanceof SupSubAtom) {
        if (!body.sub) throw new Error("sub must exist");
        return new SupSubAtom(body.nuc, this.parseMathArg(), body.sub);
      } else return new SupSubAtom(body, this.parseMathArg(), undefined);
    }
    if (token === Escape.UnderScore) {
      const body = atoms.pop();
      if (!body) throw new Error("body must exist");
      if (body instanceof SupSubAtom) {
        if (!body.sup) throw new Error("sup must exist");
        return new SupSubAtom(body.nuc, body.sup, this.parseMathArg());
      } else return new SupSubAtom(body, undefined, this.parseMathArg());
    }
    if (token === Escape.Begin) {
      const envName = this.parseEnvName();
      return this.parseEnv(envName) as MatrixAtom;
    }
    if (token === Escape.LCurly) {
      for (;;) {
        const token = this.lexer.tokenize();
        if (token === Escape.RCurly) break;
        if (token === Escape.EOF) throw new Error("Expected }");
        atoms.push(this.parseSingleMath(token, atoms));
      }
      const atom = atoms.pop();
      return atom ? atom : this.parseSingle(atoms, this.lexer.tokenize());
    }
    if (token.startsWith("\\")) {
      if (token === "\\ref") {
        const label = this.parseTextArg();
        return new SymAtom(null, label, label, ["Main-R"], { ref: true });
      }
      if (FontMap[token]) {
        if (token.startsWith("\\text")) {
          const atom = new TextGroup(
            this.parseTextFont(FontMap[token], "math") as MathAtom[]
          );
          return atom;
        }
        this.font = FontMap[token];
        this.mathFont = token;
        const { body } = this.parseMathArg();
        atoms.push(...body.slice(1, -1));
        this.font = null;
        this.mathFont = null;
        return body[body.length - 1];
      }
      if (BLOCKOP[token]) {
        return new SymAtom("op", BLOCKOP[token], token, ["Size2"], {}, false);
      }

      if (token === "\\bra") return new LRAtom("<", "|", this.parseMathArg());
      if (token === "\\ket") return new LRAtom("|", ">", this.parseMathArg());
      if (token === "\\braket")
        return new LRAtom("<", ">", this.parseMathArg());
      if (OP.includes(token)) return new OpAtom(token.slice(1));
      if (token === "\\sqrt") return new SqrtAtom(this.parseMathArg());
      if (token === "\\frac") {
        return new FracAtom(this.parseMathArg(), this.parseMathArg());
      }
      if (token === "\\overline") {
        return new OverlineAtom(this.parseMathArg());
      }
      if (ACC[token]) {
        const acc = new SymAtom(
          "ord",
          ACC[token],
          token,
          ["Main-R"],
          {},
          false
        );
        return new AccentAtom(this.parseMathArg(), acc);
      }

      if (token === "\\neq" || token === "\\ne") {
        return new SymAtom("rel", "=", "\\neq", ["Main-R"], {});
      }
      if (token === "\\notin") {
        return new SymAtom("rel", "∈", token, ["Main-R"], {});
      }
      if (token === "\\notni") {
        return new SymAtom("rel", "∋", token, ["Main-R"], {});
      }
      const cmd = parseCommand(token);
      if (cmd) {
        const { char, font } = cmd;
        const kind = cmd.kind === "bin" ? binOrOrd(atoms) : cmd.kind;
        return new SymAtom(
          kind,
          char,
          token,
          [font, this.font],
          this.mathFont
            ? {
                font: this.mathFont,
              }
            : undefined
        );
      }
    }
    console.error("Unexpected token: " + token);
    return new SymAtom("close", "?", token, ["Main-R"]);
  }

  private parseLR(): MathAtom {
    const left = this.asrtDelim(this.lexer.tokenize());
    const body: MathAtom[] = [];
    for (;;) {
      const token = this.lexer.tokenize();
      if (token === Escape.Right) break;
      if (token === "\\middle") {
        const atom = this.parseSingleMath(
          this.asrtDelim(this.lexer.tokenize()),
          body
        ) as SymAtom;
        body.push(new MidAtom(this.asrtDelim(atom.command)));
        continue;
      }
      if (token === Escape.EOF) throw new Error("Expected \\right");
      body.push(this.parseSingleMath(token, body));
    }
    const right = this.asrtDelim(this.lexer.tokenize());
    return new LRAtom(left, right, new MathGroup(body));
  }

  private asrtDelim(token: Token): Delims {
    if (token in DelimMap) return token as Delims;
    console.error("Unexpected Delim: " + token);
    return "|";
  }

  parseMathArg(): MathGroup {
    const atoms: MathAtom[] = [];
    const token = this.lexer.tokenize();
    if (token === Escape.LCurly) {
      for (;;) {
        const token = this.lexer.tokenize();
        if (token === Escape.RCurly) break;
        if (token === Escape.EOF) throw new Error("Expected }");
        atoms.push(this.parseSingleMath(token, atoms));
      }
      return new MathGroup(atoms);
    } else return new MathGroup([this.parseSingleMath(token, atoms)]);
  }

  parseEnvName(): string {
    const token = this.lexer.tokenize();
    if (token === Escape.LCurly) {
      const envName = this.lexer.readEnvName();
      if (this.lexer.tokenize() != Escape.RCurly) throw new Error("Expected }");
      return envName;
    } else throw new Error("{ expected after \\begin and \\end");
  }

  parseEnv(envName: string) {
    const elems: MathGroup[][] = [[new MathGroup([])]];
    const labels = [];
    let curLabel = null;
    for (;;) {
      let row = elems[elems.length - 1];
      const token = this.lexer.tokenize();
      if (token === Escape.EOF) throw new Error("\\end expected");
      if (token === Escape.End) {
        if (row.length === 1 && row[0].body.length === 0) {
          elems.pop();
        }
        const envName = this.parseEnvName();
        labels.push(curLabel ?? randStr());
        const mat = new MatrixAtom(
          elems,
          envName as "pmatrix",
          envName === "align" ? labels : []
        );
        if (envName === "align" || envName === "align*") {
          return new Align(mat, labels);
        }
        return mat;
      }
      if (token === Escape.And) {
        row.push(new MathGroup([]));
        continue;
      }
      if (token === Escape.Newline) {
        row = [new MathGroup([])];
        elems.push(row);
        labels.push(curLabel ?? randStr());
        curLabel = null;
        continue;
      }
      if (envName === "align" && token === "\\label") {
        const token = this.lexer.tokenize();
        if (token === Escape.LCurly) {
          const label = this.lexer.readLabel();
          if (this.lexer.tokenize() != Escape.RCurly)
            throw new Error("Expected }");
          curLabel = label;
          continue;
        }
      }
      row[row.length - 1].body.push(
        this.parseSingleMath(token, row[row.length - 1].body)
      );
    }
  }
}

export const binOrOrd = (atoms: MathAtom[]): AtomKind => {
  const lastAtom = atoms[atoms.length - 1];
  const kind = /bin|op|rel|open|punct/.test(lastAtom?.kind ?? "bin")
    ? "ord"
    : "bin";
  return kind;
};

export const parse = (latex: string, editable = true): (Char | Block)[] => {
  return new Parser(latex, editable).parse(Escape.EOF);
};

export const prarseMath = (latex: string, editable = true): MathAtom[] => {
  const parser = new Parser(latex, editable);
  const atoms: MathAtom[] = [];
  for (;;) {
    const token = parser.lexer.tokenize();
    if (token === Escape.EOF) break;
    atoms.push(parser.parseSingleMath(token, atoms));
  }
  return atoms;
};
