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
  MatrixAtom,
  OverlineAtom,
  SectionAtom,
  SqrtAtom,
  SupSubAtom,
  SymAtom,
} from "../atom/atom";
import { OpAtom } from "../atom/op";
import { AtomKind, Font } from "../font";
import { ACC, BLOCKOP, fontMap, OP, parseCommand, THM_ENV } from "./command";
import { Escape, Lexer, Token } from "./lexer";

export class Parser {
  lexer: Lexer;
  font: Font | null = null;
  theorem: keyof typeof THM_ENV | null = null;
  italic = false;
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
      const token = this.lexer.tokenize();
      if (this.theorem && token === "\\end") {
        const envName = this.parseEnvName();
        if (envName === this.theorem) break;
        throw new Error(`Expected \\end{${this.theorem}}`);
      }
      if (token === end) break;
      if (token === Escape.EOF) throw new Error(`Expected ${end}`);
      atoms.push(this.parseOne(token, atoms));
    }
    return atoms;
  }

  parseText(italic = false, bold = false, font: Font | null = null): Atom[] {
    const atoms: Atom[] = [];
    for (;;) {
      const token = this.lexer.tokenize(false);
      if (token === Escape.RCurly) break;
      if (token === Escape.EOF) break;
      if (token === "\\ref") {
        const label = this.parseTextArg();
        atoms.push(new CharAtom(label, false, false, false, undefined, true));
        continue;
      }
      if (fontMap[token.slice(1)]) {
        this.font = fontMap[token.slice(1)];
        if (token.slice(1).startsWith("text")) {
          atoms.push(...this.parseTextFont(token));
          this.font = null;
        }
        continue;
      }
      if (/\\section|\\subsection|\\subsubsection/.test(token)) {
        atoms.push(
          new SectionAtom(
            [new CharAtom(this.parseTextArg(), false, false, true, "Main-B")],
            token.slice(1) as "section",
            this.editable
          )
        );
        continue;
      }
      if (token === "\\begin") {
        const envName = this.parseEnvName() as keyof typeof THM_ENV;
        if (envName in THM_ENV) {
          this.theorem = envName;
          if (THM_ENV[envName].italic) this.italic = true;
          atoms.push(
            new ArticleAtom(
              this.parse(Escape.EOF),
              "theorem",
              THM_ENV[this.theorem].label
            )
          );
          this.theorem = null;
          this.italic = false;
        }
        continue;
      }
      atoms.push(new CharAtom(token, false, italic || this.italic, bold, font));
    }
    return atoms;
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
  parseOne(token: string, atoms: Atom[]): Atom {
    if (token.length === 1) return this.parseSingle(atoms, token);
    if (token === Escape.Space) return new SymAtom("ord", "&nbsp;", "\\ ", []);
    if (token === Escape.Left) return this.parseLR();
    if (token === Escape.Circumfix) {
      const body = atoms.pop();
      if (!body) throw new Error("body must exist");
      if (body instanceof SupSubAtom) {
        if (!body.sub) throw new Error("sub must exist");
        return new SupSubAtom(body.nuc, this.parseArg(atoms), body.sub);
      } else return new SupSubAtom(body, this.parseArg(atoms), undefined);
    }
    if (token === Escape.UnderScore) {
      const body = atoms.pop();
      if (!body) throw new Error("body must exist");
      if (body instanceof SupSubAtom) {
        if (!body.sup) throw new Error("sup must exist");
        return new SupSubAtom(body.nuc, body.sup, this.parseArg(atoms));
      } else return new SupSubAtom(body, undefined, this.parseArg(atoms));
    }
    if (token.startsWith("\\")) {
      if (token === "\\text") {
        this.lexer.tokenize();
        return new GroupAtom(this.parseText());
      }
      if (fontMap[token]) {
        this.font = fontMap[token];
        if (token.startsWith("text")) {
          const atom = new GroupAtom(this.parseTextFont(token));
          this.font = null;
          return atom;
        }
        const { body } = this.parseArg(atoms);
        const atom = new GroupAtom(
          body.slice(body[0] instanceof FirstAtom ? 1 : 0)
        );
        this.font = null;
        return atom;
      }
      if (BLOCKOP[token]) {
        return new SymAtom("op", BLOCKOP[token], token, ["Size2"], false);
      }

      if (token === "\\bra") return new LRAtom("<", "|", this.parseArg(atoms));
      if (token === "\\ket") return new LRAtom("|", ">", this.parseArg(atoms));
      if (token === "\\braket")
        return new LRAtom("<", ">", this.parseArg(atoms));
      if (OP.includes(token)) return new OpAtom(token.slice(1));
      if (token === "\\sqrt") return new SqrtAtom(this.parseArg(atoms));
      if (token === "\\frac") {
        return new FracAtom(this.parseArg(atoms), this.parseArg(atoms));
      }
      if (token === "\\overline") {
        return new OverlineAtom(this.parseArg(atoms));
      }
      if (ACC[token]) {
        const acc = new SymAtom("ord", ACC[token], token, ["Main-R"], false);
        return new AccentAtom(this.parseArg(atoms), acc);
      }
      if (token === "\\begin") {
        const envName = this.parseEnvName();
        return this.parseMatrix(envName);
      }
      const cmd = parseCommand(token);
      if (cmd) {
        const { char, font } = cmd;
        const kind = cmd.kind === "bin" ? binOrOrd(atoms) : cmd.kind;
        return new SymAtom(kind, char, token, [font, this.font]);
      }
    }
    throw new Error("Unexpected token: " + token);
  }

  private parseLR(): Atom {
    const left = this.assertDelim(this.lexer.tokenize());
    const body = this.parse(Escape.Right);
    const right = this.assertDelim(this.lexer.tokenize());
    return new LRAtom(left, right, new GroupAtom(body, this.editable));
  }

  private assertDelim(token: Token): Delims {
    if (token in DelimMap) return token as Delims;
    throw new Error("Unsupported Left Right Delimiter " + token);
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
      return envName;
    } else throw new Error("{ expected after \\begin and \\end");
  }

  parseMatrix(envName: string) {
    const element: GroupAtom[][] = [[new GroupAtom([], this.editable)]];
    const labels = [];
    let curLabel = null;
    for (;;) {
      let row = element[element.length - 1];
      const token = this.lexer.tokenize();
      if (token === Escape.EOF) throw new Error("\\end expected");
      if (token === "\\end") {
        if (row.length === 1 && row[0].body.length === 0) {
          element.pop();
        }
        const envName = this.parseEnvName();
        labels.push(curLabel);
        return new MatrixAtom(
          element,
          envName as "pmatrix",
          labels.reverse(),
          this.editable
        );
      }
      if (token === Escape.And) {
        row.push(new GroupAtom([], this.editable));
        continue;
      }
      if (token === Escape.Newline) {
        row = [new GroupAtom([], this.editable)];
        element.push(row);
        labels.push(curLabel);
        curLabel = null;
        continue;
      }
      if (envName === "align") {
        if (token === "\\label") {
          const token = this.lexer.tokenize();
          if (token === Escape.LCurly) {
            const label = this.lexer.readLabel();
            if (this.lexer.tokenize() != Escape.RCurly)
              throw new Error("Expected }");
            curLabel = label;
          }
        }
        continue;
      }
      row[row.length - 1].body.push(
        this.parseOne(token, row[row.length - 1].body)
      );
    }
  }

  parseTextFont(token: string) {
    this.lexer.tokenize();
    if (/\\textrm|\\textnormal|\\textmd|\\textup/.test(token)) {
      return this.parseText(false, false);
    }
    if (token === "\\textit") return this.parseText(true, false);
    if (token === "\\textbf") return this.parseText(false, true);
    if (token === "\\textsf" || token === "\\texttt") {
      return this.parseText(false, false, this.font);
    }
    return [];
  }
}

export const binOrOrd = (atoms: Atom[]): AtomKind => {
  const lastAtom = atoms[atoms.length - 1];
  const kind = /bin|op|rel|open|punct/.test(lastAtom?.kind ?? "bin")
    ? "ord"
    : "bin";
  return kind;
};

export const parse = (latex: string, editable = false): Atom[] => {
  return new Parser(latex, editable).parse(Escape.EOF);
};

export const parseText = (latex: string, editable = false): Atom[] => {
  return new Parser(latex, editable).parseText();
};
