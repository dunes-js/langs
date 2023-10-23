import type { lex } from "@dunes/lang";


export type TokenType = lex.TknType<(
  | "At"
  | "Unknown"
  | "Identifier"
  | "ClassName"
  | "IdName"
  | "Number"
  | "HashValue"
  | "String"
  
  | "Media"
  | "KeyFrames"
  
  | "More"
  
  | "CaretEquals"
  | "AsteriskEquals"
  | "Plus"
  | "PipeEquals"
  | "DollarEquals"
  | "TildeEquals"
  | "Equals"

  | "Wildcard"
  | "Caret"
  | "Pipe"
  | "Dollar"
  | "Tilde"

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
export type TokenTag = lex.TagType<(
  | "Word"
  | "KeyWord"
  | "Operator"
)>