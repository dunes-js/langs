import type { lex } from "@dunes/lang";


export type TokenType = lex.TknType<(  
  | "Ampersand"
  | "AmpersandEquals"
  | "Arrow"
  | "As"
  | "Asterisk"
  | "AsteriskEquals"
  | "AsteriskSlash"
  | "Async"
  | "Await"
  | "BackQuote"
  | "BackSlash"
  | "Br"
  | "Break"
  | "Case"
  | "Catch"
  | "Class"
  | "Colon"
  | "Comma"
  | "Const"
  | "Continue"
  | "Dash"
  | "DashEquals"
  | "Default"
  | "Do"
  | "DoubleAmpersand"
  | "DoubleDash"
  | "DoubleEquals"
  | "DoublePipe"
  | "DoublePlus"
  | "DoubleSlash"
  | "Else"
  | "Equals"
  | "Exclamation"
  | "Export"
  | "Extends"
  | "Finally"
  | "For"
  | "From"
  | "Function"
  | "Hash"
  | "Identifier"
  | "If"
  | "Import"
  | "In"
  | "InstanceOf"
  | "LessThan"
  | "LessThanEqual"
  | "Let"
  | "MoreThan"
  | "MoreThanEqual"
  | "New"
  | "Number"
  | "Of"
  | "OpenTemplate"
  | "Optional"
  | "Percent"
  | "PercentEquals"
  | "Period"
  | "Pipe"
  | "PipeEquals"
  | "Plus"
  | "PlusEquals"
  | "Question"
  | "Return"
  | "Semicolon"
  | "Slash"
  | "SlashAsterisk"
  | "SlashEquals"
  | "Space"
  | "Spread"
  | "String"
  | "Switch"
  | "Tab"
  | "Throw"
  | "TripleEquals"
  | "Try"
  | "TypeOf"
  | "Undefined"
  | "Using"
  | "Var"
  | "Void"
  | "While"
  | "With"

  | "OpenParen" 
  | "CloseParen"
  | "OpenBracket" 
  | "CloseBracket"
  | "OpenSquare" 
  | "CloseSquare"
)>
export type TokenTag = lex.TagType<(
  | "Word"
)>