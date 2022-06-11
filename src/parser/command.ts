import { Font } from "../font";

export const LETTER1: { [key: string]: string } = {
  "\\alpha": "α",
  "\\beta": "β",
  "\\chi": "χ",
  "\\delta": "δ",
  "\\epsilon": "ϵ",
  "\\varepsilon": "ε",
  "\\eta": "η",
  "\\gamma": "γ",
  "\\iota": "ι",
  "\\kappa": "κ",
  "\\lambda": "λ",
  "\\mu": "μ",
  "\\nu": "ν",
  "\\omega": "ω",
  "\\phi": "ϕ",
  "\\varphi": "φ",
  "\\pi": "π",
  "\\psi": "ψ",
  "\\rho": "ρ",
  "\\sigma": "σ",
  "\\varsigma": "ς",
  "\\tau": "τ",
  "\\theta": "θ",
  "\\vartheta": "ϑ",
  "\\upsilon": "υ",
  "\\xi": "ξ",
  "\\zeta": "ζ",
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

export const OP: { [key: string]: string } = {
  "\\sum": "∑",
  "\\int": "∫",
};

export const ACC: { [key: string]: string } = {
  "\\hat": "^",
  "\\tilde": "~",
};

export const fontMap: { [x: string]: Font } = {
  mathbf: "Main-B",
  mathrm: "Main-R",
  textit: "Main-I",
  mathit: "Main-I",
  mathnormal: "Math-I",
  mathbb: "AMS-R",
  mathcal: "Cal-R",
  mathfrak: "Frak-R",
  mathscr: "Script-R",
  mathsf: "San-R",
  mathtt: "Type-R",
};
