import type { par } from "@dunes/lang";
import type { TokenType } from "../lexer/index.js";

export type NodeType = (
  | "FunctionDeclaration"
  | "ClassDeclaration"
  | "FunctionDeclaration"
  | "VariableDeclaration"
  | "UsingDeclaration"
  | "VariableDeclarator"
  | "BlockStatement"
  | "IfStatement"

  | "TemplateStringExpression"
  
  | "ImportDeclaration"
  | "ImportSpecifier"
  | "ImportDefaultSpecifier"
  | "ImportNamespaceSpecifier"

  | "ExportNamedDeclaration"
  | "ExportDefaultDeclaration"
  | "ExportAllDeclaration"
  
  | "ExportSpecifier"
  | "LabeledStatement"
  | "WithStatement"
  | "ConditionalExpression"

	| "BinaryExpression"
  | "CallExpression"
  | "AssignmentExpression"
  | "MemberExpression"
  | "SequenceExpression"
  | "DoWhileStatement"
  | "WhileStatement"
  
  | "BlockComment"
  | "LineComment"

  | "ObjectExpression"
  | "ObjectPattern"
  
  | "ArrayExpression"
  | "ArrayPattern"
  | "AssignmentPattern"
  | "EmptyExpression"

	| "PropertyExpression"
  | "Identifier"
  | "PrivateIdentifier"
  | "UnaryExpression"
  
  | "TryStatement"
  | "CatchClause"
  
  | "UpdateExpression"
  | "ForInStatement"
	| "ForOfStatement"
  | "ForStatement"

  | "SwitchStatement"
  | "PropertyPattern"
  | "SwitchCase"
  
  | "ClassBody"
  | "ClassMethod"
  | "ClassProperty"

	| "FunctionExpression"
  | "ClassExpression"
  | "ArrowFunctionExpression"
  | "BreakStatement"
  | "ContinueStatement"

  | "RestElement"
  | "SpreadElement"

  | "ReturnStatement"
  | "ThrowStatement"
	| "NewExpression"
  | "AwaitExpression"
  | "ExpressionStatement"

  | "NumericLiteral"
  | "StringLiteral"
  | "RegExpLiteral"
  | "TemplateStringLiteral"
  | "TemplateElement"
  | "PropertyMethod"
)

export type SourceType = "cjs" | "esm"
export type VarType = "Const" | "Var" | "Let" | "Using"

export type AnyNode = (
  | FunctionDeclaration
  | ClassDeclaration
  | FunctionDeclaration
  | UsingDeclaration
  | VariableDeclaration
  | VariableDeclarator
  | BlockStatement
  | IfStatement
  | WithStatement
  | ConditionalExpression

  | BinaryExpression
  | CallExpression
  | AssignmentExpression
  | MemberExpression
  | SequenceExpression
  
  | BlockComment
  | LineComment
  | EmptyExpression

  | RegExpLiteral
  | StringLiteral
  | NumericLiteral
  | TemplateStringLiteral
  | TemplateElement
  | PropertyPattern
  | PropertyMethod

  | ImportDeclaration
  | ImportSpecifier
  | ImportDefaultSpecifier
  | ImportNamespaceSpecifier

  | TryStatement
  | CatchClause

  | RestElement
  | SpreadElement
  | ObjectPattern
  | DoWhileStatement
  | WhileStatement

  | ExportSpecifier
  | ExportDefaultDeclaration
  | ExportAllDeclaration
  | ExportNamedDeclaration

  | UpdateExpression
  | UnaryExpression
  | ForInStatement
  | ForOfStatement
  | ForStatement

  | ArrayExpression
  | LabeledStatement
  | BreakStatement
  | ContinueStatement
  | ObjectExpression
  | PropertyExpression
  | Identifier
  | PrivateIdentifier
  
  | AssignmentPattern
  | TemplateStringExpression
  | ArrayPattern
  
  | ClassBody
  | ClassMethod
  | ClassProperty

  | FunctionExpression
  | ClassExpression
  | ArrowFunctionExpression
  | ExpressionStatement

  | SwitchStatement
  | SwitchCase

  | ReturnStatement
  | ThrowStatement
  | NewExpression
  | AwaitExpression
)

export type AnyDeclaration = (
  | FunctionDeclaration
  | ClassDeclaration
  | VariableDeclaration
  | UsingDeclaration
)

export type AnyExportDeclaration = (
  | ExportDefaultDeclaration
  | ExportAllDeclaration
  | ExportNamedDeclaration
)

export type AnyImportSpecifier = (
  | ImportSpecifier
  | ImportDefaultSpecifier
  | ImportNamespaceSpecifier
)

export type AnyIdentifier = (
  | Identifier
  | PrivateIdentifier
)

export type AnyComment = (
  | LineComment
  | BlockComment
)

export type Assignee = (
  | AnyIdentifier
  | ObjectPattern
  | ArrayPattern
  | AssignmentPattern
  | RestElement
)

export type Literal = (
  | RegExpLiteral
  | StringLiteral
  | NumericLiteral
  | TemplateStringLiteral
)

export type PropPattern = (
  | PropertyPattern
  | RestElement
)

export type PropExpression = (
  | PropertyExpression
  | PropertyMethod
  | SpreadElement
)

export type AnyForStatement = (
  | ForStatement
  | ForOfStatement
  | ForInStatement
)

export type ClassProp = (
  | ClassMethod 
  | ClassProperty
)

export type Consequent = (
  | BlockStatement 
  | ExpressionStatement
  | EmptyExpression
)

export interface ParOptions extends par.ParserOptions {
  ast: {
    programProps: ProgProps
  }
}

export interface ProgProps extends par.ProgramProps {
  sourceType: SourceType
}

export interface Expression extends par.Node<NodeType> {}

export interface Statement extends Expression {}

// ===== GENERAL =====

// ----- Comment

export interface LineComment extends Expression {
  type: "LineComment"
  content: string
}

export interface BlockComment extends Statement {
  type: "BlockComment"
  content: string
}

// ----- Body

export interface BlockStatement extends Statement {
  type: "BlockStatement"
  body: AnyNode[];
}

export interface ExpressionStatement extends Statement {
	type: "ExpressionStatement"
	expression: AnyNode;
}

export interface EmptyExpression extends Expression {
  type: "EmptyExpression"
}

// ===== Declaration

// ----- Variable

export interface VariableDeclaration extends Statement {
  type: "VariableDeclaration"
  kind: Exclude<VarType, "Using">
  declarators: VariableDeclarator[]
}

export interface VariableDeclarator extends Expression {
  type: "VariableDeclarator"
  id: Assignee
  init: AnyNode | null
}


export interface UsingDeclaration extends Statement {
  type: "UsingDeclaration"
  kind: "Using"
  await: boolean
  declarators: VariableDeclarator[]
}
// ----- Import

export interface ImportDeclaration extends Statement {
  type: "ImportDeclaration"
  specifiers: AnyImportSpecifier[]
  source: StringLiteral
}

export interface ImportSpecifier extends Expression {
  type: "ImportSpecifier"
  imported: AnyIdentifier
  local: AnyIdentifier
}

export interface ImportDefaultSpecifier extends Expression {
  type: "ImportDefaultSpecifier"
  local: AnyIdentifier
}

export interface ImportNamespaceSpecifier extends Expression {
  type: "ImportNamespaceSpecifier"
  local: AnyIdentifier
}

// ----- Export

export interface ExportSpecifier extends Expression {
  type: "ExportSpecifier"
  exported: AnyIdentifier
  local: AnyIdentifier
}

export interface ExportDefaultDeclaration extends Expression {
  type: "ExportDefaultDeclaration"
  declaration: AnyNode
}

export interface ExportAllDeclaration extends Expression {
  type: "ExportAllDeclaration"
  source: StringLiteral
  exported: AnyIdentifier | null
}

export interface ExportNamedDeclaration extends Statement {
  type: "ExportNamedDeclaration"
  specifiers: ExportSpecifier[]
  source: StringLiteral | null
  declaration: AnyDeclaration | null
}

// ----- Function

export interface FunctionDeclaration extends Statement {
  type: "FunctionDeclaration"
  id: AnyIdentifier
  params: Assignee[]
  async: boolean
  generator: boolean
  body: BlockStatement
}

// ----- Class

export interface ClassDeclaration extends Statement {
  type: "ClassDeclaration"
  id: AnyIdentifier
  extend: AnyNode | null
  body: ClassBody
}

export interface ClassBody extends Expression {
  type: "ClassBody"
  props: ClassProp[]
}

interface ClassVar extends Expression {
  id: AnyIdentifier
}

export interface ClassMethod extends ClassVar {
  type: "ClassMethod"
  params: Assignee[]
  body: BlockStatement
}

export interface ClassProperty extends ClassVar {
  type: "ClassProperty"
  init: AnyNode | null
}

// ===== STATEMENT =====

// ----- Flow

export interface ReturnStatement extends Statement {
  type: "ReturnStatement"
  node: AnyNode
}

export interface ThrowStatement extends Statement {
  type: "ThrowStatement"
  node: AnyNode
}

// ----- For Loop

export interface ForInStatement extends Statement {
  type: "ForInStatement"
  left: AnyNode
  right: AnyNode
  body: Consequent
}

export interface ForOfStatement extends Statement {
  type: "ForOfStatement"
  left: AnyNode
  right: AnyNode
  body: Consequent
  await: boolean
}

export interface ForStatement extends Statement {
  type: "ForStatement"
  init: AnyNode | null
  test: AnyNode | null
  update: AnyNode | null
  body: Consequent
}

// ----- While Loop

export interface DoWhileStatement extends Statement {
  type: "DoWhileStatement"
  test: AnyNode
  body: BlockStatement
}

export interface WhileStatement extends Statement {
  type: "WhileStatement"
  test: AnyNode
  body: Consequent
}

// ----- If Statement

export interface IfStatement extends Statement {
  type: "IfStatement"
  test: AnyNode
  consequent: Consequent
  alternate: IfStatement | Consequent | null
}

// ----- With Statement

export interface WithStatement extends Statement {
  type: "WithStatement"
  namespace: AnyNode
  body: Consequent
}

// ----- Try Statement

export interface TryStatement extends Statement {
  type: "TryStatement"
  block: BlockStatement
  handler: CatchClause | null
  finalizer: BlockStatement | null
}

export interface CatchClause extends Statement {
  type: "CatchClause"
  param: AnyIdentifier
  body: BlockStatement
}

// ----- Switch Statement

export interface SwitchStatement extends Statement {
  type: "SwitchStatement"
  discriminant: AnyNode
  cases: SwitchCase[]
}

export interface SwitchCase extends Expression {
  type: "SwitchCase"
  consequent: Consequent | null
  test: AnyNode | null
}

// ===== EXPRESSION =====

export interface TemplateStringExpression extends Expression {
	type: "TemplateStringExpression"
	quasi: TemplateStringLiteral
	tag: AnyNode
}

export interface CallExpression extends Expression {
  type: "CallExpression"
  args: AnyNode[]
  caller: AnyNode
  optional: boolean
}

// ----- Conditional Expression

export interface ConditionalExpression extends Statement {
  type: "ConditionalExpression"
  test: AnyNode
  consequent: AnyNode
  alternate: AnyNode
}

// ----- Binary

export interface AssignmentExpression extends Expression {
	type: "AssignmentExpression"
	operator: TokenType
	assigne: AnyNode
	value: AnyNode
}

export interface MemberExpression extends Expression {
	type: "MemberExpression"
  object: AnyNode
  property: AnyNode
  computed: boolean
  optional: boolean
}

export interface BinaryExpression extends Expression {
  type: "BinaryExpression"
  kind: "add" | "mul" | "com"
	operator: TokenType
	left: AnyNode
	right: AnyNode
}

// ----- Pattern

export interface ArrayPattern extends Expression {
  type: "ArrayPattern"
  items: AnyNode[]
}

export interface PropertyPattern extends Property {
  kind: 'init'
  key: Assignee | StringLiteral
  type: "PropertyPattern"
  value: Assignee
}

export interface ObjectPattern extends Expression {
  type: "ObjectPattern"
  props: PropPattern[]
}

export interface Identifier extends Expression {
  type: "Identifier"
  symbol: string
}

export interface AssignmentPattern extends Expression {
  type: "AssignmentPattern"
  left: Assignee
  right: AnyNode
}

export interface RestElement extends ArgumentExpression {
  type: "RestElement"
}

export interface PrivateIdentifier extends Expression {
  type: "PrivateIdentifier"
  symbol: string
}

// ----- Complex

export interface BaseFunctionExpression extends Expression {
  async: boolean
  params: Assignee[]
}

export interface BaseFunction extends BaseFunctionExpression {
  body: BlockStatement
  generator: boolean
}

export interface ClassExpression extends Expression {
  type: "ClassExpression"
  id: AnyIdentifier | null
  extend: AnyNode | null
  body: ClassBody
}

export interface FunctionExpression extends BaseFunction {
  type: "FunctionExpression"
  id: AnyIdentifier | null
}

export interface ArrowFunctionExpression extends BaseFunctionExpression {
  type: "ArrowFunctionExpression"
  expression: boolean
  body: BlockStatement | Expression
}

export interface ArrayExpression extends Expression {
  type: "ArrayExpression"
  items: AnyNode[]
}

export interface ObjectExpression extends Expression {
  type: "ObjectExpression"
  props: PropExpression[]
}

export interface Property extends Expression {
  kind: 'init' | 'method'
  key: AnyNode
  shorthand: boolean
  method: boolean
  computed: boolean
}

export interface PropertyExpression extends Property {
  type: "PropertyExpression"
  kind: "init"
  value: AnyNode
}

export interface PropertyMethod extends Property, BaseFunction {
  type: "PropertyMethod"
  kind: "method"
}

export interface TemplateStringLiteral extends Expression {
  type: "TemplateStringLiteral"
  expressions: AnyNode[]
  quasis: TemplateElement[]
}

export interface TemplateElement extends Expression {
  type: "TemplateElement"
  value: {
    cooked: string
    raw: string
  }
  tail: boolean
}

// ----- Primary

export interface ContinueStatement extends Statement {
  type: "ContinueStatement"
  label: AnyIdentifier | null
}

export interface BreakStatement extends Statement {
  type: "BreakStatement"
  label: AnyIdentifier | null
}

export interface UpdateExpression extends Expression {
  type: "UpdateExpression"
  argument: AnyIdentifier
  operator: TokenType
  prefix: boolean
}

export interface ArgumentExpression extends Expression {
  argument: AnyNode
}

export interface UnaryExpression extends ArgumentExpression {
  type: "UnaryExpression"
  operator: TokenType
  prefix: boolean
}

export interface SpreadElement extends ArgumentExpression {
  type: "SpreadElement"
}

export interface LabeledStatement extends Statement {
  type: "LabeledStatement"
  body: AnyNode
}

export interface NewExpression extends Expression {
	type: "NewExpression"
	caller: AnyNode
}

export interface AwaitExpression extends Expression {
	type: "AwaitExpression"
	node: AnyNode
}

export interface SequenceExpression extends Expression {
  type: "SequenceExpression"
  nodes: AnyNode[]
}

// ----- Literal

export interface NumericLiteral extends Expression {
  type: "NumericLiteral"
  raw: string
  value: number
  float: boolean
}

export interface RegExpLiteral extends Expression {
  type: "RegExpLiteral"
  raw: string
  value: {}
  regex: {
    pattern: string
    flags: string | null
  }
}

export interface StringLiteral extends Expression {
  type: "StringLiteral"
  value: string
  raw: string
}
