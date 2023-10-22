import { Par } from "@dunes/lang/par";
import type { TokenTag, TokenType } from "../lexer/index.js";
import type { 
  AnyNode, 
  AtRule, 
  ParOptions,
  Rule,
} from "./types.js";

/**
 * @TODO
 * - optional
 * */

export class Parser extends Par<TokenType, AnyNode, ParOptions, TokenTag> {

	protected override parse(): AnyNode {
    switch(this.type()) {
      case "Identifier": return this.parseRule();
      case "Media": return this.parseMediaQuery();
    }
  }

  protected parseRule(): Rule {}

  protected parseMediaQuery(): AtRule {}

}