
import { Lang } from "@dunes/lang"

import { Parser } from "./parser/index.js"
import { Lexer, type TokenTag, type TokenType } from "./lexer/index.js"
import { Interpreter } from "./interpreter/index.js"
import type { AnyValue } from "./interpreter/types.js";
import type { AnyNode, ParOptions } from "./parser/types.js";

export const js = new Lang<
  TokenType,
  AnyNode,
  ParOptions,
  TokenTag,
  AnyValue
>(
  new Lexer(),
  new Parser(),
  new Interpreter(),
);