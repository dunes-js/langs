import { Par } from "@dunes/lang/par";
import type { TokenTag, TokenType } from "../lexer/index.js";
import type { 
  AnyNode, 
  Attribute, 
  CDataElement, 
  Child, 
  Element, 
  ParOptions,
  SpecialElement,
  StringLit,
} from "./types.js";

export class Parser extends Par<TokenType, AnyNode, ParOptions, TokenTag> {

	protected override parse(): AnyNode {
    return this.parseChild();
  }

  protected parseElement(): Element {
    this.eat();
    const name = this.expect("Identifier",
      "Expected tag name after open tag"
    ).value;

    const self = ["input", "link", "meta"].includes(name);
    this.trim();
    let attributes: Attribute[] | null = null;
    if (this.willContinue() && this.isntAny("EndTag", "EndSelfTag")) {
      attributes = [];
      while (this.willContinue() && this.isntAny("EndTag", "EndSelfTag")) {
        attributes.push(this.parseAttribute())
        this.trim();
      }
    }
    if (this.is("EndSelfTag") || (self && this.is("EndTag"))) {
      this.eat();
      return this.new("Element", {
        name,
        attributes,
        children: null
      })
    }
    this.expect("EndTag", "Expected tag to close tag");
    this.trim();

    let children: Child[] | null = null;
    if (this.willContinue() && this.isntAny("StartClosingTag")) {
      children = [];
      while (this.willContinue() && this.isntAny("StartClosingTag")) {
        children.push(this.parseChild());
      }
    }

    this.expect("StartClosingTag", "Expected closing tag to close tag");
    this.trim();
    this.expect("Identifier",
      "Expected tag name after closing tag"
    ).value;
    this.trim();
    this.expect("EndTag", "Expected tag to close tag");

    return this.new("Element", {
      name,
      attributes,
      children
    })

  }

  protected parseSpecialElement(): SpecialElement {
    this.eat();
    this.eat();
    const name = this.expect("Identifier",
      "Expected tag name after exclamation tag"
    ).value;
    this.trim();
    let attributes: Attribute[] | null = null;
    if (this.willContinue() && this.isntAny("EndTag", "EndSelfTag")) {
      attributes = [];
      while (this.willContinue() && this.isntAny("EndTag", "EndSelfTag")) {
        attributes.push(this.parseAttribute())
        this.trim();
      }
    }
    this.expectAny(["EndTag", "EndSelfTag"],
      "Expected tag to close special tag"
    );
    return this.new("SpecialElement", {
      name,
      attributes,
      children: null
    })
  }

  protected parseCDataElement(): CDataElement {
    this.eat();
    this.eat();
    this.eat();
    if (this.expect("Identifier",
      "Expected tag name after exclamation tag"
    ).value !== "CDATA") {
      throw "Expected name to be CDATA"
    }
    this.expect("OpenSquare",
      "Expected open square after CDATA"
    );
    let content = "";
    while (this.willContinue() && (this.isnt("CloseSquare") || this.isnt("CloseSquare", 1))) {
      content += this.eat().value;
    }
    this.expect("CloseSquare",
      "Expected close square after CDATA"
    );
    this.expect("CloseSquare",
      "Expected double close square after CDATA"
    );
    this.expectAny(["EndTag", "EndSelfTag"],
      "Expected tag to close CDATA tag"
    );
    return this.new("CDataElement", {
      content
    })
  }

  protected parseAttribute(): Attribute {
    const name = this.expect(
      "Identifier", 
      "Expected id as attr name"
    ).value;
    this.trim();
    if (this.if("Equals")) {
      this.trim();
      let value = this.parseString();
      return this.new("Attribute", {name, value})
    }
    return this.new("Attribute", {name, value: null})
  }

  protected cdataComing(): boolean {
    return this.is("StartTag") && this.is("Exclamation", 1) && this.is("OpenSquare", 2);
  }

  protected specialTagComing(): boolean {
    return this.is("StartTag") && this.is("Exclamation", 1);
  }

  protected openTagComing(): boolean {
    return this.is("StartTag") && this.is("Identifier", 1);
  }

  protected anyTagComing(): boolean {
    return this.isAny("StartTag", "StartClosingTag") && this.is("Identifier", 1);
  }

  protected parseChild(): Child {
    if (this.cdataComing()) {
      return this.parseCDataElement();
    }
    if (this.specialTagComing()) {
      return this.parseSpecialElement();
    }
    if (this.openTagComing()) {
      return this.parseElement();
    }
    let {value} = this.eat();
    while (this.willContinue() && !this.anyTagComing()) {
      value += this.eat().value;
    }
    return this.new("Text", {value})
  }

  protected parseString(): StringLit {
    if (this.is("Identifier")) {
      const raw = this.eat().value;
      return this.new("StringLit", {raw, value: raw});
    }
    else {
      const raw = this.expect(
        "String", "Expected string for attr value"
      ).value
      return this.new("StringLit", {value: raw.slice(1, -1), raw});
    }
  }

}