import type { par } from "@dunes/lang";

export type NodeType = (
  | "AtRule"
  | "Rule"
  | "AtRulePrelude"
  | "Block"
  | "SelectorList"
)


export type AnyNode = (
  | AtRule
  | Rule
  | AtRulePrelude
  | Block
  | SelectorList
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

export interface Block extends Node {
  type: "Block"
  children: AnyNode[]
}

// ----- At Rule

export interface AtRule extends Node {
  type: "AtRule"
  prelude: AtRulePrelude
  block: Block
}

export interface AtRulePrelude extends Node {
  type: "AtRulePrelude"
  children: AnyNode[]
}

// ----- Rule

export interface Rule extends Node {
  type: "Rule"
  prelude: AtRulePrelude
}

export interface SelectorList extends Node {
  type: "SelectorList"
  content: string
}