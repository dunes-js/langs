import type { par } from "@dunes/lang";

export type NodeType = (
  | "Element"
  | "Text"
  | "StringLit"
  | "Attribute"
  | "SpecialElement"
  | "CDataElement"
)


export type AnyNode = (
  | Element
  | Text
  | StringLit
  | Attribute
  | SpecialElement
  | CDataElement
)

export type Child = (
  | Element 
  | Text
  | CDataElement
  | SpecialElement
)

export interface ParOptions extends par.ParserOptions {
  ast: {
    programProps: ProgProps
  }
}

export interface ProgProps extends par.ProgramProps {}

export interface Node extends par.Node<NodeType> {}

// ===== GENERAL =====

// ----- Element

export interface Element extends Node {
  type: "Element"
  name: string
  attributes: Attribute[] | null
  children: Child[] | null
}

export interface SpecialElement extends Node {
  type: "SpecialElement"
  name: string
  attributes: Attribute[] | null
  children: Child[] | null
}

export interface CDataElement extends Node {
  type: "CDataElement"
  content: string
}

export interface Attribute extends Node {
  type: "Attribute"
  name: string
  value: StringLit | null
}

export interface Text extends Node {
  type: "Text"
  value: string | null
}

export interface StringLit extends Node {
  type: "StringLit"
  value: string
  raw: string
}
