import type { par } from "@dunes/lang";
import type { TokenType } from "../lexer/types.js";

export type NodeType = (
  | "AtRule"
  | "Rule"
  | "AtRulePrelude"
  | "MediaBlock"
  | "RuleBlock"
  | "SelectorList"
  | "Selector"
  | "MediaFeature"
  | "TypeSelector"
  | "IdSelector"
  | "ClassSelector"
  | "Declaration"
  | "Dimension"
  | "Combinator"
  | "Operator"
  | "FunctionValue"
  | "PseudoClassSelector"
  | "GroupValue"
  | "MediaQueryList"
  | "Value"
  | "Identifier"
  | "AttributeSelector"
  | "StringValue"
  | "NumberValue"
  | "HashValue"
  | "Raw"
)


export type AnyNode = (
  | AtRule
  | Rule
  | GroupValue
  | AtRulePrelude
  | MediaBlock
  | NumberValue
  | Raw
  | HashValue
  | Combinator
  | StringValue
  | MediaFeature
  | PseudoClassSelector
  | MediaQueryList
  | Operator
  | FunctionValue
  | AttributeSelector
  | RuleBlock
  | SelectorList
  | Selector
  | TypeSelector
  | IdSelector
  | ClassSelector
  | Declaration
  | Dimension
  | Value
  | Identifier
)


export type AnySelector = (
  | TypeSelector
  | IdSelector
  | ClassSelector
  | PseudoClassSelector
  | AttributeSelector
  | Combinator
  | Raw
)

export type ValueChild = (
  | Identifier
  | Dimension
  | NumberValue
  | GroupValue
  | FunctionValue
  | StringValue
  | HashValue
  | Raw
  
  | Operator
)

export type RuleChild = (
  | Declaration
  | Raw
)

export type MediaSelector = (
  | Identifier
  | MediaFeature
)

export interface ParOptions extends par.ParserOptions {
  ast: {
    programProps: ProgProps
  }
}

export interface ProgProps extends par.ProgramProps {}

export interface Node extends par.Node<NodeType> {}

// ===== GENERAL =====

// ----- Block

export interface MediaBlock extends Node {
  type: "MediaBlock"
  children: Rule[]
}

export interface RuleBlock extends Node {
  type: "RuleBlock"
  children: RuleChild[]
}

// ----- At Rule

export interface AtRule extends Node {
  type: "AtRule"
  prelude: AtRulePrelude
  block: MediaBlock
}

export interface AtRulePrelude extends Node {
  type: "AtRulePrelude"
  children: MediaQueryList[]
}

export interface MediaQueryList extends Node {
  type: "MediaQueryList"
  children: MediaSelector[]
}

// ----- Rule

export interface Rule extends Node {
  type: "Rule"
  prelude: SelectorList
  block: RuleBlock
}

export interface SelectorList extends Node {
  type: "SelectorList"
  children: Selector[]
}

export interface Selector extends Node {
  type: "Selector"
  children: AnySelector[]
}

export interface TypeSelector extends Node {
  type: "TypeSelector"
  name: string
}

export interface IdSelector extends Node {
  type: "IdSelector"
  name: string
}

export interface ClassSelector extends Node {
  type: "ClassSelector"
  name: string
}

export interface MediaFeature extends Node {
  type: "MediaFeature"
  name: string
  value: Value
}

export interface Declaration extends Node {
  type: "Declaration"
  important: boolean
  property: string
  value: Value
}

export interface Value extends Node {
  type: "Value"
  children: ValueChild[]
}

export interface NumberValue extends Node {
  type: "NumberValue"
  value: number
}

export interface StringValue extends Node {
  type: "StringValue"
  value: string
}

export interface HashValue extends Node {
  type: "HashValue"
  value: string
}

export interface Dimension extends Node {
  type: "Dimension"
  value: number
  unit: string
}

export interface Identifier extends Node {
  type: "Identifier"
  name: string
}

export interface PseudoClassSelector extends Node {
  type: "PseudoClassSelector"
  name: string
  children: Raw[] | null
}

export interface Combinator extends Node {
  type: "Combinator"
  name: string
}

export interface Raw extends Node {
  type: "Raw"
  value: string
}

export interface Operator extends Node {
  type: "Operator"
  value: string
}

export interface FunctionValue extends Node {
  type: "FunctionValue"
  name: string
  children: ValueChild[]
}

export interface AttributeSelector extends Node {
  type: "AttributeSelector"
  name: string
  matcher: TokenType | null
  value: StringValue | Identifier | null
  flags: string | null

}

export interface GroupValue extends Node {
  type: "GroupValue"
  children: ValueChild[]
}