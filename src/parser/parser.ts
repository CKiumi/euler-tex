import {
  AccentAtom,
  ArticleAtom,
  Atom,
  CharAtom,
  DelimMap,
  Delims,
  FirstAtom,
  FracAtom,
  GroupAtom,
  LRAtom,
  MathBlockAtom,
  MatrixAtom,
  OverlineAtom,
  SqrtAtom,
  SupSubAtom,
  SymAtom,
} from "../atom/atom";
import { OpAtom } from "../atom/op";
import { AtomKind, Font } from "../font";
import { ACC, BLOCKOP, FontMap, OP, parseCommand, THM_ENV } from "./command";
import { Escape, Lexer, Token } from "./lexer";

export class Parser {
  lexer: Lexer;
  font: Font | null = null;
  theorem: keyof typeof THM_ENV | null = null;
  italic = false;
  lastSection: MathBlockAtom | null = null;
  thmLabel: string | null = null;
  constructor(latex: string, public editable = false) {
    this.lexer = new Lexer(latex);
  }

  parseSingle(atoms: Atom[], token: Token) {
    if (/[A-Za-z]/.test(token))
      return new SymAtom("ord", token, token, ["Math-I", this.font]);
    if (/[0-9]/.test(token))
      return new SymAtom("ord", token, token, ["Main-R", this.font]);
    const cmd = parseCommand(token);
    if (cmd) {
      const { char, font } = cmd;
      const kind = cmd.kind === "bin" ? binOrOrd(atoms) : cmd.kind;
      return new SymAtom(kind, char, token, [font, this.font]);
    }
    console.error(`Single token ${token} not supported`);
    return new SymAtom("close", "?", token, ["Main-R"]);
  }

  parse(end: Token): Atom[] {
    const atoms: Atom[] = [];
    for (;;) {
      const token = this.lexer.tokenize(false);
      if (this.theorem && token === Escape.End) {
        if (this.parseEnvName() === this.theorem) break;
        throw new Error(`Expected \\end{${this.theorem}}`);
      }
      if (token === Escape.Begin) {
        const envName = this.parseEnvName();
        if (envName === "align" || envName === "align*") {
          atoms.push(this.parseEnv(envName));
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
      if (this.lastSection && token === "\\label") {
        this.lastSection.tag = this.parseTextArg();
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
        atoms.push(new SymAtom(null, label, label, [], { ref: true }));
        continue;
      }
      if (token === "\\cite") {
        this.parseTextArg();
        continue;
      }
      if (FontMap[token]) {
        this.font = FontMap[token];
        if (token.startsWith("\\text")) {
          atoms.push(...this.parseTextFont(FontMap[token], "text"));
          this.font = null;
        }
        continue;
      }
      if (/\\section|\\subsection|\\subsubsection/.test(token)) {
        const title = Array.from(this.parseTextArg()).map(
          (char) => new CharAtom(char, null)
        );
        this.lastSection = new MathBlockAtom(
          new GroupAtom(title),
          token.slice(1) as "section",
          undefined
        );
        atoms.push(this.lastSection);
        continue;
      }
      atoms.push(new CharAtom(token, null));
    }
    return atoms;
  }

  parseTextFont(font: Font, mode: "text" | "math"): Atom[] {
    const atoms: Atom[] = [];
    this.lexer.tokenize();
    for (;;) {
      const token = this.lexer.tokenize(false);
      if (token === Escape.RCurly) break;
      if (token === Escape.EOF) break;
      if (mode === "text") atoms.push(new CharAtom(token, font));
      else atoms.push(new SymAtom(null, token, token, [font]));
    }
    return atoms;
  }

  parseInline() {
    const atoms: Atom[] = [];
    for (;;) {
      const token = this.lexer.tokenize();
      if (token === Escape.Inline) break;
      if (token === Escape.EOF) throw new Error("Expected $ to end inline");
      atoms.push(this.parseSingleMath(token, atoms));
    }
    return new MathBlockAtom(new GroupAtom(atoms), "inline");
  }

  parseDisplay(mode: "equation" | "equation*" | null) {
    const atoms: Atom[] = [];
    let label: string | null | undefined = undefined;
    if (mode === "equation") label = null;
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
    return new MathBlockAtom(new GroupAtom(atoms), "display", label);
  }

  parseThm(envName: keyof typeof THM_ENV): ArticleAtom {
    if (envName in THM_ENV) {
      this.theorem = envName;
      if (THM_ENV[envName].italic) this.italic = true;
      const atom = new ArticleAtom(
        this.parse(Escape.EOF),
        "theorem",
        THM_ENV[this.theorem],
        this.thmLabel
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

  parseSingleMath(token: string, atoms: Atom[]): Atom {
    if (token.length === 1) return this.parseSingle(atoms, token);
    if (token === Escape.Space) return new SymAtom("ord", "&nbsp;", "\\ ", []);
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
      return this.parseEnv(envName);
    }
    if (token.startsWith("\\")) {
      if (token === "\\ref") {
        const label = this.parseTextArg();
        return new SymAtom(null, label, label, ["Main-R"], { ref: true });
      }
      if (FontMap[token]) {
        if (token.startsWith("\\text")) {
          const atom = new GroupAtom(
            this.parseTextFont(FontMap[token], "math")
          );
          return atom;
        }
        this.font = FontMap[token];
        const { body } = this.parseMathArg();
        const atom = new GroupAtom(
          body.slice(body[0] instanceof FirstAtom ? 1 : 0)
        );
        this.font = null;
        return atom;
      }
      if (BLOCKOP[token]) {
        return new SymAtom("op", BLOCKOP[token], token, ["Size2"], {}, false);
      }

      if (token === "\\bra")
        return new LRAtom("<", "|", this.parseMathArg(), []);
      if (token === "\\ket")
        return new LRAtom("|", ">", this.parseMathArg(), []);
      if (token === "\\braket")
        return new LRAtom("<", ">", this.parseMathArg(), []);
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
        return new SymAtom(kind, char, token, [font, this.font]);
      }
    }
    console.error("Unexpected token: " + token);
    return new SymAtom("close", "?", token, ["Main-R"]);
  }

  private parseLR(): Atom {
    const left = this.asrtDelim(this.lexer.tokenize());
    const body: Atom[] = [];
    const middle: number[] = [];
    for (;;) {
      const token = this.lexer.tokenize();
      if (token === Escape.Right) break;
      if (token === "\\middle") {
        body.push(
          this.parseSingleMath(this.asrtDelim(this.lexer.tokenize()), body)
        );
        middle.push(body.length);
        continue;
      }
      if (token === Escape.EOF) throw new Error("Expected \\right");
      body.push(this.parseSingleMath(token, body));
    }
    const right = this.asrtDelim(this.lexer.tokenize());
    return new LRAtom(left, right, new GroupAtom(body), middle);
  }

  private asrtDelim(token: Token): Delims {
    if (token in DelimMap) return token as Delims;
    console.error("Unexpected Delim: " + token);
    return "|";
  }

  parseMathArg(): GroupAtom {
    const atoms: Atom[] = [];
    const token = this.lexer.tokenize();
    if (token === Escape.LCurly) {
      for (;;) {
        const token = this.lexer.tokenize();
        if (token === Escape.RCurly) break;
        if (token === Escape.EOF) throw new Error("Expected }");
        atoms.push(this.parseSingleMath(token, atoms));
      }
      return new GroupAtom(atoms);
    } else return new GroupAtom([this.parseSingleMath(token, atoms)]);
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
    const elems: GroupAtom[][] = [[new GroupAtom([])]];
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
        labels.push(curLabel);
        return new MatrixAtom(elems, envName as "pmatrix", labels);
      }
      if (token === Escape.And) {
        row.push(new GroupAtom([]));
        continue;
      }
      if (token === Escape.Newline) {
        row = [new GroupAtom([])];
        elems.push(row);
        labels.push(curLabel);
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

export const binOrOrd = (atoms: Atom[]): AtomKind => {
  const lastAtom = atoms[atoms.length - 1];
  const kind = /bin|op|rel|open|punct/.test(lastAtom?.kind ?? "bin")
    ? "ord"
    : "bin";
  return kind;
};

export const parse = (latex: string, editable = true): Atom[] => {
  return new Parser(latex, editable).parse(Escape.EOF);
};

export const prarseMath = (latex: string, editable = true): Atom[] => {
  const parser = new Parser(latex, editable);
  const atoms: Atom[] = [];
  for (;;) {
    const token = parser.lexer.tokenize();
    if (token === Escape.EOF) break;
    atoms.push(parser.parseSingleMath(token, atoms));
  }
  return atoms;
};
