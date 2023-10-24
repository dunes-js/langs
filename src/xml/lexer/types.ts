import type { lex } from "@dunes/lang";


export type TokenType = lex.TknType<(
  | "Other"
  | "Identifier"
  | "String"
  | "Equals"

  | "Br"
  | "Tab"
  | "Space"
  | "BackSlash"
  | "Slash"
  | "Exclamation"
  | "OpenParen"
  | "CloseParen"
  | "OpenBracket"
  | "CloseBracket"
  | "OpenSquare"
  | "CloseSquare"

  | "StartTag"
  | "EndTag"
  | "StartClosingTag"
  | "EndSelfTag"
)>

export type TokenTag = lex.TagType<never>