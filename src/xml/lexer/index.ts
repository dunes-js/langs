import { lex } from "@dunes/lang";
import type { TokenTag, TokenType } from "./types.js";
export type { TokenType, TokenTag }

export class Lexer extends lex.Lex<TokenType, TokenTag> {

	protected override read() {

    if (this.is('"')) {
      const chars: lex.Char[] = [this.eat()];

      while (this.willContinue() && !this.is('"')) {
        const val = this.eat();
        chars.push(val);
        if (val.value === '\\') {
          if (!this.willContinue()) {
            throw "Expected character after escape";
          }
          chars.push(this.eat());
        }
      }
      return this.new("String", ...chars, this.eat());
    }

    if (this.is("'")) {
      const chars: lex.Char[] = [this.eat()];

      while (this.willContinue() && !this.is("'")) {
        const val = this.eat();
        chars.push(val);
        if (val.value === '\\') {
          if (!this.willContinue()) {
            throw "Expected character after escape";
          }
          chars.push(this.eat());
        }
      }
      return this.new("String", ...chars, this.eat());
    }

    if (this.isLetter()) {
      const chars: lex.Char[] = [this.eat()];
      while (this.willContinue() && (
        this.isLetter() || this.match(/[0-9]|_|-/)
      )) {
        chars.push(this.eat());
      }
      return this.new("Identifier", ...chars);

    }

    if (this.is("<")) {
      const start = this.eat();
      if (this.is("/"))
        return this.new("StartClosingTag", start, this.eat());
      return this.new("StartTag", start);
    }

    if (this.is("/")) {
      const slash = this.eat();
      if (this.is(">"))
        return this.new("EndSelfTag", slash, this.eat());
      return this.new("Slash", slash);
    }


    switch(this.value()) {
      case '=': return this.new("Equals", this.eat());

      case " ": return this.new("Space", this.eat()).setTag("WhiteSpace");
      case"\n": return this.new("Br",    this.eat()).setTag("WhiteSpace");
      case"\t": return this.new("Tab",   this.eat()).setTag("WhiteSpace");
      case'\\': return this.new("BackSlash", this.eat());

      case "!": return this.new("Exclamation", this.eat());
      
      case ">": return this.new("EndTag", this.eat());

      case "(": return this.new("OpenParen", this.eat());
      case ")": return this.new("CloseParen", this.eat());

      case "{": return this.new("OpenBracket", this.eat());
      case "}": return this.new("CloseBracket", this.eat());

      case "[": return this.new("OpenSquare", this.eat());
      case "]": return this.new("CloseSquare", this.eat());
      default:
        return this.new("Other", this.eat());
    }
	}

}