import type { lex } from "@dunes/lang";


export type TokenType = lex.TType<(
  | "At"
  | "Unknown"
  | "Identifier"
  | "ClassName"
  | "Wildcard"
  | "Number"
  | "String"
  
  | "Media"
  | "KeyFrames"

  | "Br"
  | "Period"
  | "Percent"
  | "Tab"
  | "Space"
  | "BackSlash"
  | "Exclamation"
  | "Hash"
  | "Semicolon"
  | "Colon"
  | "Comma"
  | "OpenParen"
  | "CloseParen"
  | "OpenBracket"
  | "CloseBracket"
  | "OpenSquare"
  | "CloseSquare"
)>
export type TokenTag = (
  | "Word"
  | "WhiteSpace"
  | "KeyWord"
)