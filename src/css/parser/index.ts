import { Par } from "@dunes/lang/par";
import type { TokenTag, TokenType } from "../lexer/index.js";
import type { 
  AnyNode, 
  AnySelector, 
  AtRule, 
  RuleBlock, 
  Dimension, 
  NumberValue, 
  ParOptions,
  Rule,
  Selector,
  SelectorList,
  ValueChild,
  MediaBlock,
  AtRulePrelude,
  MediaSelector,
  MediaQueryList,
  PseudoClassSelector,
  Raw,
  RuleChild,
  AttributeSelector,
} from "./types.js";

export class Parser extends Par<TokenType, AnyNode, ParOptions, TokenTag> {

	protected override parse(): AnyNode {
    this.trim();
    switch(this.type()) {

      case "ClassName":
      case "IdName":
      case "Identifier": return this.parseRule();

      case "Media": return this.parseMediaQuery();
      case "KeyFrames": return this.parseKeyFrames();

      default: throw `Expected rule`;
    }
  }

  protected parseRule(): Rule {
    const prelude = this.parseSelectorList();
    this.trim();
    const block = this.parseRuleBlock();
    return this.new("Rule", {prelude, block});
  }
  
  protected parseSelectorList(): SelectorList {
    const children: Selector[] = [];
    while (this.willContinue() && this.isnt("OpenBracket")) {
      children.push(this.parseSelector());
      if (this.isnt("Comma")) break;
      this.eatTrim();
    }
    return this.new("SelectorList", {children});
  }
  
  protected parseSelector(): Selector {
    const children: AnySelector[] = [];
    while (this.willContinue() && this.isntAny("Comma", "OpenBracket")) {
      
      if (this.is("Identifier")) {
        children.push(this.new("TypeSelector", {
          name: this.eat().value
        }));
      }
      else if (this.is("IdName")) {
        children.push(this.new("IdSelector", {
          name: this.eat().value.slice(1)
        }));
      }
      else if (this.is("ClassName")) {
        children.push(this.new("ClassSelector", {
          name: this.eat().value.slice(1)
        }));
      }
      else if (this.is("Colon")) {
        children.push(this.parsePseudoClassSelector());
      }
      else if (this.is("OpenSquare")) {
        children.push(this.parseAttributeSelector());
      }
      else if (this.has("Operator")) {
        children.push(this.new("Combinator", {
          name: this.eat().value
        }));
      }
      else 
        children.push(this.new("Raw", {
          value: this.eat().value
        }));

      if (this.has("WhiteSpace")) {
        this.trim();
        if (this.lookAhead(tokens => {
          while (tokens.willContinue() && tokens.has("WhiteSpace")) tokens.eat();
          return tokens.willContinue() && tokens.has("Operator");
        })) {
          children.push(this.new("Combinator", {name: this.eat().value}));
          this.trim();
        }
        else {
          children.push(this.new("Combinator", {name: " "}));
        }
      }
    }
    if (children[children.length-1]?.type === "Combinator") {
      children.pop();
    }
    return this.new("Selector", {children});
  }


  
  protected parseRuleBlock(): RuleBlock {
    this.eatTrim();
    const children: RuleChild[] = [];
    while (this.willContinue() && this.isntAny("Semicolon", "CloseBracket")) {
      
      if (this.is("Identifier")) {
        const property = this.eat().value;
        this.trim();
        this.expect("Colon", "Expected colon after property name");
        this.trim();
          const value = this.new("Value", {
            children: this.parseGroupChildren(
              "Exclamation", "Semicolon", "CloseBracket"
            )
          });
        this.trim();
        const important = !!this.if("Exclamation");
        if (important) this.trim();
        children.push(this.new("Declaration", {
          property,
          value,
          important,
        }))
      }
      else {
        children.push(this.new("Raw", {value: this.eat().value}))
      }
      this.trim();
      if (this.isnt("Semicolon")) break;
      this.eatTrim();
    }
    this.eat();
    return this.new("RuleBlock", {children});
  }

  protected parseMediaQuery(): AtRule {
    this.eatTrim();
    const prelude = this.parseAtRulePrelude();
    this.trim();
    const block = this.parseMediaBlock();
    return this.new("AtRule", {prelude, block});
  }
  
  protected parseAtRulePrelude(): AtRulePrelude {
    const children: MediaQueryList[] = [];
    while (this.willContinue() && this.isntAny("OpenBracket")) {
      const sel: MediaSelector[] = [];
      while (this.willContinue() && this.isntAny("Comma", "OpenBracket")) {

        if (this.is("Identifier")) {
          sel.push(this.new("Identifier", {
            name: this.eat().value
          }));
        }
        else if (this.if("OpenParen")) {
          this.trim();
          const name = this.expect(
            "Identifier", 
            "Expected id for media feature property"
          ).value;
          this.trim();
          this.expect("Colon", "Expected colon to declare value");
          this.trim();
          const value = this.new("Value", {
            children: this.parseGroupChildren("CloseParen")
          });
          this.trim();
          this.expect(
            "CloseParen", 
            "Expected parenthesis to close media feature"
          )
          sel.push(this.new("MediaFeature", {name, value}));
        }
        else {
          throw `Unexpected media selector ${this.type()}`;
        }
        this.trim();
      }
      children.push(this.new("MediaQueryList", {
        children: sel
      }))
      this.trim();
      if (this.isnt("Comma")) break;
      this.eatTrim();
    }
    return this.new("AtRulePrelude", {children});

  }
  
  protected parseMediaBlock(): MediaBlock {
    this.eatTrim();
    const children: Rule[] = [];
    while (this.willContinue() && this.isntAny("CloseBracket")) {
      children.push(this.parseRule())
      this.trim();
    }
    this.eat();
    return this.new("MediaBlock", {children});
  }
  
  protected parseKeyFrames(): AtRule {
    return {} as any
  }

  protected parseGroupChildren(...types: TokenType[]): ValueChild[] {

    const values: ValueChild[] = []
    while (this.willContinue() && this.isntAny(...types)) {
      values.push(this.parseValueChild());
      this.trim();
    }
    return values;
  }
  
  protected parseAttributeSelector(): AttributeSelector {
    this.eatTrim();
    const name = this.expect(
      "Identifier", 
      "Expected identifier for pseudo selector"
    ).value
    this.trim();
    if (this.is("CloseSquare")) {
      return this.new("AttributeSelector", {
        name,
        value: null,
        matcher: null,
        flags: null
      })
    }
    if (this.isntAny(
      "Equals", "PipeEquals", "CaretEquals", 
      "TildeEquals", "DollarEquals", "AsteriskEquals"
    )) {
      throw `Expected matcher`
    }
    const matcher = this.eat().type;
    this.trim();
    let value
    if (this.is("String")) {
      value = this.new("StringValue", {value: this.eat().value});
    }
    else if (this.is("Identifier")) {
      value = this.new("Identifier", {name: this.eat().value});
    }
    else {
      throw `Expected string or id as value`
    }
    this.trim();
    const flags = this.if("Identifier")?.value || null;
    return this.new("AttributeSelector", {name, value, matcher, flags})
  }
  
  protected parsePseudoClassSelector(): PseudoClassSelector {
    this.eat();
    const name = this.expect(
      "Identifier", 
      "Expected identifier for pseudo selector"
    ).value
    let children: Raw[] | null = null;
    if (this.if("OpenParen")) {
      this.trim();
      children = [this.parseRaw()];
      this.expect("CloseParen", "Expected parenthesis to close pseudo val");
    }

    return this.new("PseudoClassSelector", {name, children});
  }
  
  protected parseValueChild(): ValueChild {
    switch(this.type()) {
      case "Identifier": {
        const name = this.eat().value;
        if (this.if("OpenParen")) {
          this.eatTrim();
          const func = this.new("FunctionValue", {
            name,
            children: this.parseGroupChildren("CloseParen")
          });
          this.trim();
          this.expect("CloseParen", "Expected close paren for function arguments");
          return func;
        }
        return this.new("Identifier", { name });
      }
      case "OpenParen": {
        this.eatTrim();
        const group = this.new("GroupValue", {
          children: this.parseGroupChildren("CloseParen")
        });
        this.trim();
        this.expect("CloseParen", "Expected close paren for group value");
        return group;
      }
      case "Number": {
        return this.parseDimension();
      }
      case "Comma": {
        const operator = this.new("Operator", { value: this.eat().value })
        this.trim();
        return operator;
      }
      case "String": {
        return this.new("StringValue", { value: this.eat().value })
      }
      case "HashValue": 
      case "IdName": {
        return this.new("HashValue", { value: this.eat().value.slice(1) })
      }
      default:
        return this.parseRaw();
    }
  }
  
  protected parseRaw(): Raw {
    let value = this.eat().value;
    while (this.willContinue() && this.isntAny("CloseParen", "Semicolon")) {
      value += this.eat().value;
    }
    return this.new("Raw", {value});
  }
  
  protected parseDimension(): Dimension | NumberValue {
    const value = parseFloat(this.eat().value);
    if (this.isAny("Identifier", "Percent")) {
      const unit = this.eat().value;
      return this.new("Dimension", {value, unit});
    }
    return this.new("NumberValue", {value});
  }

}