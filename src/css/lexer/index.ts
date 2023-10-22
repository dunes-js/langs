import { lex } from "@dunes/lang";
import type { TokenTag, TokenType } from "./types.js";
export type { TokenType, TokenTag }

export class Lexer extends lex.Lex<TokenType, TokenTag> {

	protected override read() {

    if (this.is('"')) {
      const chars: lex.Char[] = [this.eat()];

      while (!this.finished() && !this.is('"')) {
        const val = this.eat();
        chars.push(val);
        if (val.value === '\\') {
          if (this.finished()) {
            throw "Expected character after escape";
          }
          chars.push(this.eat());
        }
      }
      return this.new("String", ...chars, this.eat());
    }

    if (this.is("'")) {
      const chars: lex.Char[] = [this.eat()];

      while (!this.finished() && !this.is("'")) {
        const val = this.eat();
        chars.push(val);
        if (val.value === '\\') {
          if (this.finished()) {
            throw "Expected character after escape";
          }
          chars.push(this.eat());
        }
      }
      return this.new("String", ...chars, this.eat());
    }

    if (this.isLetter()) {
      const chars: lex.Char[] = [this.eat()];
      while (!this.finished() && (
        this.isLetter() || this.match(/[0-9]|_|-/)
      )) {
        chars.push(this.eat());
      }
      return this.new("Identifier", ...chars).setTag("Word");
    }

    if (this.is("@")) {
      const at = this.eat();
      if (this.isLetter()) {
        const chars: lex.Char[] = [at];
        while (!this.finished() && (
          this.isLetter() || this.match(/[0-9]|_|-/)
        )) {
          chars.push(this.eat());
        }
        const value = chars.map(({value}) => value).join("");
        switch (value) {
          case "@media": return this.new("Media", ...chars).setTag("KeyWord");
          case "@keyframes": return this.new("KeyFrames", ...chars).setTag("KeyWord");
          
          default: return this.new("Identifier", ...chars).setTag("KeyWord");
        }
      }
      return this.new("At", at)
    }

    if (this.is(".")) {
      const period = this.eat();
      if (this.isLetter()) {
        const chars: lex.Char[] = [period];
        while (!this.finished() && (
          this.isLetter() || this.match(/[0-9]|_|-/)
        )) {
          chars.push(this.eat());
        }
        return this.new("ClassName", ...chars);
      }
      return this.new("Period", period)
    }

    if (this.match(/[0-9]/)) {
      const chars: lex.Char[] = [this.eat()];
      while (!this.finished() && this.match(/[0-9]/)) {
        chars.push(this.eat());
      }
      return this.new("Number", ...chars);
    }


    switch(this.value()) {
      case '@': return this.new("At", this.eat());
      case '*': return this.new("Wildcard", this.eat());
      case '%': return this.new("Percent", this.eat());

      case " ": return this.new("Space", this.eat()).setTag("WhiteSpace");
      case"\n": return this.new("Br",    this.eat()).setTag("WhiteSpace");
      case"\t": return this.new("Tab",   this.eat()).setTag("WhiteSpace");
      case'\\': return this.new("BackSlash", this.eat());

      case "!": return this.new("Exclamation", this.eat());
      case "#": return this.new("Hash", this.eat());

      case ";": return this.new("Semicolon", this.eat());
      case ":": return this.new("Colon", this.eat());
      case ",": return this.new("Comma", this.eat());

      case "(": return this.new("OpenParen", this.eat());
      case ")": return this.new("CloseParen", this.eat());

      case "{": return this.new("OpenBracket", this.eat());
      case "}": return this.new("CloseBracket", this.eat());

      case "[": return this.new("OpenSquare", this.eat());
      case "]": return this.new("CloseSquare", this.eat());
      default:
        return this.new("Unknown", this.eat());
    }
	}

}