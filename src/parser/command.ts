import { AtomKind, Font } from "../font";

export interface ThmData {
  label: string;
  italic: boolean;
  nonum?: boolean;
}

export const THM_ENV: { [x: string]: ThmData } = {
  theorem: { label: "Theorem", italic: true },
  proof: { label: "Proof", italic: false, nonum: true },
  corollary: { label: "Corollary", italic: true },
  lemma: { label: "Lemma", italic: true },
  definition: { label: "Definition", italic: true },
  proposition: { label: "Proposition", italic: true },
  example: { label: "Example", italic: false },
  assumption: { label: "Assumption", italic: true },
  exercise: { label: "Exercise", italic: false },
  remark: { label: "Remark", italic: true },
};

interface CommandData {
  kind: AtomKind;
  char: string;
  font: Font;
}

export const parseCommand = (command: string): CommandData | null => {
  if (LETTER1[command]) {
    return { kind: "ord", char: LETTER1[command], font: "Math-I" };
  }
  if (LETTER2[command]) {
    return { kind: "ord", char: LETTER2[command], font: "Main-R" };
  }
  if (LETTER3[command]) {
    return { kind: "ord", char: LETTER3[command], font: "Main-R" };
  }
  if (MISC[command]) {
    return { kind: "ord", char: MISC[command], font: "Main-R" };
  }
  if (OPEN[command]) {
    return { kind: "open", char: OPEN[command], font: "Main-R" };
  }
  if (CLOSE[command]) {
    return { kind: "close", char: CLOSE[command], font: "Main-R" };
  }
  if (INNER[command]) {
    return { kind: "close", char: INNER[command], font: "Main-R" };
  }
  if (PUNCT[command]) {
    return { kind: "punct", char: PUNCT[command], font: "Main-R" };
  }
  if (REL[command]) {
    return { kind: "rel", char: REL[command], font: "Main-R" };
  }
  if (BIN[command]) {
    return { kind: "bin", char: BIN[command], font: "Main-R" };
  }
  if (ARROW[command]) {
    return { kind: "rel", char: ARROW[command], font: "Main-R" };
  }
  if (AMS_ARROW[command]) {
    return { kind: "rel", char: AMS_ARROW[command], font: "AMS-R" };
  }
  if (AMS_BIN[command]) {
    return { kind: "bin", char: AMS_BIN[command], font: "AMS-R" };
  }
  if (AMS_NBIN[command]) {
    return { kind: "bin", char: AMS_NBIN[command], font: "AMS-R" };
  }
  if (AMS_MISC[command]) {
    return { kind: "ord", char: AMS_MISC[command], font: "AMS-R" };
  }
  if (AMS_REL[command]) {
    if (command === "\\Join") {
      return { kind: "rel", char: AMS_REL[command], font: "Main-R" };
    }
    return { kind: "rel", char: AMS_REL[command], font: "AMS-R" };
  }
  if (AMS_NREL[command]) {
    return { kind: "rel", char: AMS_NREL[command], font: "AMS-R" };
  }
  if (SPACE[command]) {
    //temporary implementation
    return { kind: "ord", char: SPACE[command], font: "Main-R" };
  }
  return null;
};
export const LETTER1: { [key: string]: string } = {
  "\\alpha": "α",
  "\\beta": "β",
  "\\chi": "χ",
  "\\delta": "δ",
  "\\epsilon": "ϵ",
  "\\eta": "η",
  "\\gamma": "γ",
  "\\iota": "ι",
  "\\kappa": "κ",
  "\\lambda": "λ",
  "\\mu": "μ",
  "\\nu": "ν",
  "\\omega": "ω",
  "\\phi": "ϕ",
  "\\pi": "π",
  "\\psi": "ψ",
  "\\rho": "ρ",
  "\\sigma": "σ",
  "\\tau": "τ",
  "\\theta": "θ",
  "\\upsilon": "υ",
  "\\xi": "ξ",
  "\\omicron": "ο",
  "\\zeta": "ζ",
  "\\varepsilon": "ε",
  "\\vartheta": "ϑ",
  "\\varpi": "ϖ",
  "\\varrho": "ϱ",
  "\\varsigma": "ς",
  "\\varphi": "φ",
};

export const LETTER2: { [key: string]: string } = {
  "\\Delta": "Δ",
  "\\Gamma": "Γ",
  "\\Lambda": "Λ",
  "\\Omega": "Ω",
  "\\Phi": "Φ",
  "\\Pi": "Π",
  "\\Psi": "Ψ",
  "\\Sigma": "Σ",
  "\\Theta": "Θ",
  "\\Upsilon": "Υ",
  "\\Xi": "Ξ",
};

export const LETTER3: { [key: string]: string } = {
  "\\#": "#",
  "\\&": "&",
  "\\aleph": "ℵ",
  "\\forall": "∀",
  "\\hbar": "ℏ",
  "\\exists": "∃",
  "\\nabla": "∇",
  "\\flat": "♭",
  "\\ell": "ℓ",
  "\\natural": "♮",
  "\\clubsuit": "♣",
  "\\wp": "℘",
  "\\sharp": "♯",
  "\\diamondsuit": "♢",
  "\\Re": "ℜ",
  "\\heartsuit": "♡",
  "\\Im": "ℑ",
  "\\spadesuit": "♠",
  "\\S": "§",
  "\\P": "¶",
  // Math and Text
  "\\dag": "†",
  "\\ddag": "‡",
  "\\ ": " ",
  // need to set kern
  "\\vdots": "⋮",
};

export const INNER: { [key: string]: string } = {
  "\\mathellipsis": "…",
  "\\ldots": "…",
  "\\cdots": "⋯",
  "\\ddots": "⋱",
  "\\dotsc": "…",
  "\\dots": "…",
};

export const OPEN: { [key: string]: string } = {
  "\\lgroup": "⟮",
  "\\lmoustache": "⎰",
  "\\langle": "⟨",
  "\\lvert": "∣",
  "\\lVert": "∥",
  //
  "(": "(",
  "[": "[",
  "⌈": "⌈",
  "⌉": "⌉",
  "\\{": "{",
  "\\lbrace": "{",
  "\\lbrack": "[",
  "\\lparen": "(",
  "\\rparen": "(",
  "\\lfloor": "⌊",
  "\\lceil": "⌈",
};

export const CLOSE: { [key: string]: string } = {
  "?": "?",
  "!": "!",
  "\\rgroup": "⟯",
  "\\rmoustache": "⎱",
  "\\rangle": "⟩",
  "\\rvert": "∣",
  "\\rVert": "∥",
  //
  ")": ")",
  "]": "]",
  "\\}": "}",
  "\\rbrace": "}",
  "\\rbrack": "]",
  "\\rparen": "",
  "\\rfloor": "⌋",
  "\\rceil": "⌉",
};

export const REL: { [key: string]: string } = {
  "\\equiv": "≡",
  "\\prec": "≺",
  "\\succ": "≻",
  "\\sim": "∼",
  "\\perp": "⊥",
  "\\preceq": "⪯",
  "\\succeq": "⪰",
  "\\simeq": "≃",
  "\\mid": "∣",
  "\\ll": "≪",
  "\\gg": "≫",
  "\\asymp": "≍",
  "\\parallel": "∥",
  "\\bowtie": "⋈",
  "\\smile": "⌣",
  "\\sqsubseteq": "⊑",
  "\\sqsupseteq": "⊒",
  "\\doteq": "≐",
  "\\frown": "⌢",
  "\\ni": "∋",
  "\\propto": "∝",
  "\\vdash": "⊢",
  "\\dashv": "⊣",
  "\\owns": "∋",
  //
  "=": "=",
  ":": ":",
  "<": "<",
  ">": ">",
  "\\approx": "≈",
  "\\cong": "≅",
  "\\ge": "≥",
  "\\geq": "≥",
  "\\gets": "←",
  "\\gt": ">",
  "\\in": "∈",
  "\\not": "",
  "\\subset": "⊂",
  "\\supset": "⊃",
  "\\subseteq": "⊆",
  "\\supseteq": "⊇",
  "\\models": "⊨",
  "\\leftarrow": "←",
  "\\le": "≤",
  "\\leq": "≤",
  "\\lt": "<",
  "\\rightarrow": "→",
  "\\to": "→",
  //
  "\\uparrow": "↑",
  "\\Uparrow": "⇑",
  "\\downarrow": "↓",
  "\\Downarrow": "⇓",
  "\\updownarrow": "↕",
  "\\Updownarrow": "⇕",
};

export const PUNCT: { [key: string]: string } = {
  ",": ",",
  ";": ";",
  "\\ldotp": ".",
  "\\cdotp": "⋅",
};

export const BLOCKOP: { [key: string]: string } = {
  "\\sum": "∑",
  "\\int": "∫",
  "\\coprod": "∐",
  "\\bigvee": "⋁",
  "\\bigwedge": "⋀",
  "\\biguplus": "⨄",
  "\\bigcap": "⋂",
  "\\bigcup": "⋃",
  "\\intop": "∫",
  "\\iint": "∬",
  "\\iiint": "∭",
  "\\prod": "∏",
  "\\bigotimes": "⨂",
  "\\bigoplus": "⨁",
  "\\bigodot": "⨀",
  "\\oint": "∮",
  "\\oiint": "∯",
  "\\oiiint": "∰",
  "\\bigsqcup": "⨆",
  "\\smallint": "∫",
};

export const LIMIT = [
  "\\coprod",
  "\\bigvee",
  "\\bigwedge",
  "\\biguplus",
  "\\bigcap",
  "\\bigcup",
  "\\intop",
  "\\prod",
  "\\sum",
  "\\bigotimes",
  "\\bigoplus",
  "\\bigodot",
  "\\bigsqcup",
  "\\smallint",
];

export const BIN: { [key: string]: string } = {
  "\\mp": "∓",
  "\\ominus": "⊖",
  "\\uplus": "⊎",
  "\\sqcap": "⊓",
  "\\ast": "∗",
  "\\sqcup": "⊔",
  "\\bigcirc": "◯",
  "\\bullet": "∙",
  "\\ddagger": "‡",
  "\\wr": "≀",
  "\\amalg": "⨿",
  "\\And": "&",
  //
  "*": "∗",
  "+": "+",
  "-": "−",
  "/": "/",
  "\\cdot": "⋅",
  "\\circ": "∘",
  "\\div": "÷",
  "\\pm": "±",
  "\\times": "×",
  "\\cap": "∩",
  "\\cup": "∪",
  "\\setminus": "∖",
  "\\land": "∧",
  "\\lor": "∨",
  "\\wedge": "∧",
  "\\vee": "∨",
  //
  "\\odot": "⊙",
  "\\oplus": "⊕",
  "\\otimes": "⊗",
  //
  "\\oslash": "⊘",
  "\\bigtriangleup": "△",
  "\\bigtriangledown": "▽",
  "\\dagger": "†",
  "\\diamond": "⋄",
  "\\star": "⋆",
  "\\triangleleft": "◃",
  "\\triangleright": "▹",
};

export const AMS_NREL: { [key: string]: string } = {
  "\\nless": "≮",
  "\\nleqslant": "",
  "\\nleqq": "",
  "\\lneq": "⪇",
  "\\lneqq": "≨",
  "\\lvertneqq": "",
  "\\lnsim": "⋦",
  "\\lnapprox": "⪉",
  "\\nprec": "⊀",
  "\\npreceq": "⋠",
  "\\precnsim": "⋨",
  "\\precnapprox": "⪹",
  "\\nsim": "≁",
  "\\nshortmid": "",
  "\\nmid": "∤",
  "\\nvdash": "⊬",
  "\\nvDash": "⊭",
  "\\ntriangleleft": "⋪",
  "\\ntrianglelefteq": "⋬",
  "\\subsetneq": "⊊",
  "\\varsubsetneq": "",
  "\\subsetneqq": "⫋",
  "\\varsubsetneqq": "",
  "\\ngtr": "≯",
  "\\ngeqslant": "",
  "\\ngeqq": "",
  "\\gneq": "⪈",
  "\\gneqq": "≩",
  "\\gvertneqq": "",
  "\\gnsim": "⋧",
  "\\gnapprox": "⪊",
  "\\nsucc": "⊁",
  "\\nsucceq": "⋡",
  "\\succnsim": "⋩",
  "\\succnapprox": "⪺",
  "\\ncong": "≆",
  "\\nshortparallel": "",
  "\\nparallel": "∦",
  "\\nVDash": "⊯",
  "\\ntriangleright": "⋫",
  "\\ntrianglerighteq": "⋭",
  "\\nsupseteqq": "",
  "\\supsetneq": "⊋",
  "\\varsupsetneq": "",
  "\\supsetneqq": "⫌",
  "\\varsupsetneqq": "",
  "\\nVdash": "⊮",
  "\\precneqq": "⪵",
  "\\succneqq": "⪶",
  "\\nsubseteqq": "",
};

export const AMS_NBIN: { [key: string]: string } = {
  "\\unlhd": "⊴",
  "\\unrhd": "⊵",
};

export const OP: string[] = [
  "\\arcsin",
  "\\arccos",
  "\\arctan",
  "\\arctg",
  "\\arcctg",
  "\\arg",
  "\\ch",
  "\\cos",
  "\\cosec",
  "\\cosh",
  "\\cot",
  "\\cotg",
  "\\coth",
  "\\csc",
  "\\ctg",
  "\\cth",
  "\\deg",
  "\\dim",
  "\\exp",
  "\\hom",
  "\\ker",
  "\\lg",
  "\\ln",
  "\\log",
  "\\sec",
  "\\sin",
  "\\sinh",
  "\\sh",
  "\\tan",
  "\\tanh",
  "\\tg",
  "\\th",
  //
  "\\det",
  "\\sgn",
  "\\limsup",
  "\\liminf",
];

export const ACC: { [key: string]: string } = {
  "\\hat": "^",
  "\\tilde": "~",
  "\\grave": "ˋ",
  "\\ddot": "¨",
  "\\bar": "ˉ",
  "\\breve": "˘",
  "\\check": "ˇ",
  "\\vec": "⃗",
  "\\dot": "˙",
  "\\mathring": "˚",
};

export const FontMap: { [x: string]: Font } = {
  //work both in math and text mode
  "\\text": "Main-R",
  "\\textrm": "Main-R",
  "\\textnormal": "Main-R",
  "\\textsf": "San-R",
  "\\textbf": "Main-B",
  "\\textmd": "Main-R",
  "\\texttt": "Type-R",
  "\\textit": "Main-I",
  "\\textup": "Main-R",
  //only in math mode
  "\\mathbf": "Math-BI",
  "\\mathrm": "Main-R",
  "\\mathit": "Math-I",
  "\\mathnormal": "Math-I",
  "\\mathbb": "AMS-R",
  "\\mathcal": "Cal-R",
  "\\mathfrak": "Frak-R",
  "\\mathscr": "Script-R",
  "\\mathsf": "San-R",
  "\\mathtt": "Type-R",
  "\\boldsymbol": "Math-BI",
  "\\bm": "Math-BI",
};

export const AMS_BIN: { [key: string]: string } = {
  "\\gtrdot": "⋗",
  "\\lessdot": "⋖",
  "\\lhd": "⊲",
  "\\rhd": "⊳",
  "\\dotplus": "∔",
  "\\smallsetminus": "∖",
  "\\Cap": "⋒",
  "\\Cup": "⋓",
  "\\doublebarwedge": "⩞",
  "\\boxminus": "⊟",
  "\\boxplus": "⊞",
  "\\divideontimes": "⋇",
  "\\ltimes": "⋉",
  "\\rtimes": "⋊",
  "\\leftthreetimes": "⋋",
  "\\rightthreetimes": "⋌",
  "\\curlywedge": "⋏",
  "\\curlyvee": "⋎",
  "\\circleddash": "⊝",
  "\\circledast": "⊛",
  "\\centerdot": "⋅",
  "\\intercal": "⊺",
  "\\doublecap": "⋒",
  "\\doublecup": "⋓",
  "\\boxtimes": "⊠",
  //
  "\\barwedge": "⊼",
  "\\veebar": "⊻",
  "\\circledcirc": "⊚",
  "\\boxdot": "⊡",
};

export const AMS_REL: { [key: string]: string } = {
  "\\leqq": "≦",
  "\\leqslant": "⩽",
  "\\eqslantless": "⪕",
  "\\lesssim": "≲",
  "\\lessapprox": "⪅",
  "\\approxeq": "≊",
  "\\lll": "⋘",
  "\\lessgtr": "≶",
  "\\lesseqgtr": "⋚",
  "\\lesseqqgtr": "⪋",
  "\\doteqdot": "≑",
  "\\risingdotseq": "≓",
  "\\fallingdotseq": "≒",
  "\\backsim": "∽",
  "\\backsimeq": "⋍",
  "\\subseteqq": "⫅",
  "\\Subset": "⋐",
  "\\sqsubset": "⊏",
  "\\preccurlyeq": "≼",
  "\\curlyeqprec": "⋞",
  "\\precsim": "≾",
  "\\precapprox": "⪷",
  "\\vartriangleleft": "⊲",
  "\\trianglelefteq": "⊴",
  "\\vDash": "⊨",
  "\\Vvdash": "⊪",
  "\\smallsmile": "⌣",
  "\\smallfrown": "⌢",
  "\\bumpeq": "≏",
  "\\Bumpeq": "≎",
  "\\geqq": "≧",
  "\\geqslant": "⩾",
  "\\eqslantgtr": "⪖",
  "\\gtrsim": "≳",
  "\\gtrapprox": "⪆",
  "\\ggg": "⋙",
  "\\gtrless": "≷",
  "\\gtreqless": "⋛",
  "\\gtreqqless": "⪌",
  "\\eqcirc": "≖",
  "\\circeq": "≗",
  "\\triangleq": "≜",
  "\\thicksim": "∼",
  "\\thickapprox": "≈",
  "\\supseteqq": "⫆",
  "\\Supset": "⋑",
  "\\sqsupset": "⊐",
  "\\succcurlyeq": "≽",
  "\\curlyeqsucc": "⋟",
  "\\succsim": "≿",
  "\\succapprox": "⪸",
  "\\vartriangleright": "⊳",
  "\\trianglerighteq": "⊵",
  "\\Vdash": "⊩",
  "\\shortmid": "∣",
  "\\shortparallel": "∥",
  "\\between": "≬",
  "\\pitchfork": "⋔",
  "\\varpropto": "∝",
  "\\blacktriangle": "▲",
  "\\therefore": "∴",
  "\\backepsilon": "∍",
  "\\blacktriangleright": "▶",
  "\\because": "∵",
  "\\llless": "⋘",
  "\\gggtr": "⋙",
  "\\eqsim": "≂",
  "\\Join": "⋈",
  "\\Doteq": "≑",
};

export const ARROW: { [key: string]: string } = {
  "\\longleftarrow": "⟵",
  "\\Leftarrow": "⇐",
  "\\Longleftarrow": "⟸",
  "\\longrightarrow": "⟶",
  "\\Rightarrow": "⇒",
  "\\Longrightarrow": "⟹",
  "\\leftrightarrow": "↔",
  "\\longleftrightarrow": "⟷",
  "\\Leftrightarrow": "⇔",
  "\\Longleftrightarrow": "⟺",
  "\\mapsto": "↦",
  "\\longmapsto": "⟼",
  "\\nearrow": "↗",
  "\\hookleftarrow": "↩",
  "\\hookrightarrow": "↪",
  "\\searrow": "↘",
  "\\leftharpoonup": "↼",
  "\\rightharpoonup": "⇀",
  "\\swarrow": "↙",
  "\\leftharpoondown": "↽",
  "\\rightharpoondown": "⇁",
  "\\nwarrow": "↖",
  "\\rightleftharpoons": "⇌",
};

export const AMS_ARROW: { [key: string]: string } = {
  "\\dashrightarrow": "⇢",
  "\\dashleftarrow": "⇠",
  "\\leftleftarrows": "⇇",
  "\\leftrightarrows": "⇆",
  "\\Lleftarrow": "⇚",
  "\\twoheadleftarrow": "↞",
  "\\leftarrowtail": "↢",
  "\\looparrowleft": "↫",
  "\\leftrightharpoons": "⇋",
  "\\curvearrowleft": "↶",
  "\\circlearrowleft": "↺",
  "\\Lsh": "↰",
  "\\upuparrows": "⇈",
  "\\upharpoonleft": "↿",
  "\\downharpoonleft": "⇃",
  "\\multimap": "⊸",
  "\\leftrightsquigarrow": "↭",
  "\\rightrightarrows": "⇉",
  "\\rightleftarrows": "⇄",
  "\\twoheadrightarrow": "↠",
  "\\rightarrowtail": "↣",
  "\\looparrowright": "↬",
  "\\curvearrowright": "↷",
  "\\circlearrowright": "↻",
  "\\Rsh": "↱",
  "\\downdownarrows": "⇊",
  "\\upharpoonright": "↾",
  "\\downharpoonright": "⇂",
  "\\rightsquigarrow": "⇝",
  "\\leadsto": "⇝",
  "\\restriction": "↾",
};

export const AMS_MISC: { [key: string]: string } = {
  "\\varnothing": "∅",
  "\\nsubseteq": "⊈",
  "\\nsupseteq": "⊉",
  "\\ngeq": "≱",
  "\\nleq": "≰",
};

export const MISC: { [key: string]: string } = {
  ".": ".",
  /* eslint-disable quotes */
  '"': '"',
  // "\\$": "$",
  // "\\%": "%",
  // "\\_": "_",
  "\\angle": "∠",
  "\\infty": "∞",
  "\\prime": "′",
  "\\triangle": "△",
  // Α: "A",
  // Β: "B",
  // Ε: "E",
  // Ζ: "Z",
  // Η: "H",
  // Ι: "I",
  // Κ: "K",
  // Μ: "M",
  // Ν: "N",
  // Ο: "O",
  // Ρ: "P",
  // Τ: "T",
  // Χ: "X",
  "\\neg": "¬",
  "\\lnot": "¬",
  "\\top": "⊤",
  "\\bot": "⊥",
  "\\emptyset": "∅",
  "\\surd": "√",
  //
  "\\partial": "∂",
  "\\backslash": "\\",
  "|": "∣",
  "\\vert": "∣",
  "\\|": "∥",
  "\\Vert": "∥",
  "\\varvdots": "⋮",
  //
  // "\\imath": "",
  // "\\jmath": "",
  // ı: "ı",
  // ȷ: "ȷ",
  "\\degree": "°",
  "\\pounds": "£",
  "\\mathsterling": "£",
};

export const SPACE: { [key: string]: string } = {
  "\\ ": " ",
  "\\quad": " ",
  "\\qquad": "  ",
  "\\space": " ",
  "\\nobreakspace": " ",
  // '\\nobreak': 'null',
  // '\\allowbreak': 'null',
};
