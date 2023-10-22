
import { Lang } from "@dunes/lang"

import { Parser } from "./parser/index.js"
import { Lexer, type TokenTag, type TokenType } from "./lexer/index.js"
import type { AnyNode, ParOptions } from "./parser/types.js";

export const css = new Lang<
  TokenType,
  AnyNode,
  ParOptions,
  TokenTag
>(
  new Lexer(),
  new Parser(),
);