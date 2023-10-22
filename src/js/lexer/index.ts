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

    if (this.is("$") && this.is("{", 1)) {
      return this.new("OpenTemplate", this.eat(), this.eat());
    }

		if (this.isLetter() || this.is("$")) {
			const chars: lex.Char[] = [this.eat()];
			while (!this.finished() && (
        this.isLetter() || this.is("$") || this.match(/[0-9]|_/)
      )) {
				chars.push(this.eat());
			}

			const value = chars.map(({value}) => value).join("");
			switch (value) {
				case "let": return this.new("Let", ...chars).setTag("Word");
				case "var": return this.new("Var", ...chars).setTag("Word");
				case "switch": return this.new("Switch", ...chars).setTag("Word");
        case "try": return this.new("Try", ...chars).setTag("Word");
        case "catch": return this.new("Catch", ...chars).setTag("Word");
        case "finally": return this.new("Finally", ...chars).setTag("Word");
        case "case": return this.new("Case", ...chars).setTag("Word");
        case "break": return this.new("Break", ...chars).setTag("Word");
        case "continue": return this.new("Continue", ...chars).setTag("Word");
        case "const": return this.new("Const", ...chars).setTag("Word");
        case "for": return this.new("For", ...chars).setTag("Word");
				case "if": return this.new("If", ...chars).setTag("Word");
        case "of": return this.new("Of", ...chars).setTag("Word");
        case "using": return this.new("Using", ...chars).setTag("Word");
        case "in": return this.new("In", ...chars).setTag("Word");
				case "else": return this.new("Else", ...chars).setTag("Word");
        case "as": return this.new("As", ...chars).setTag("Word");
        case "do": return this.new("Do", ...chars).setTag("Word");
        case "while": return this.new("While", ...chars).setTag("Word");
        case "with": return this.new("With", ...chars).setTag("Word");

				case "new": return this.new("New", ...chars).setTag("Word");
				case "void": return this.new("Void", ...chars).setTag("Word");
				case "async": return this.new("Async", ...chars).setTag("Word");
				case "return": return this.new("Return", ...chars).setTag("Word");
        case "throw": return this.new("Throw", ...chars).setTag("Word");
				case "instanceof": return this.new("InstanceOf", ...chars).setTag("Word");
				case "typeof": return this.new("TypeOf", ...chars).setTag("Word");
        case "await": return this.new("Await", ...chars).setTag("Word");
				
				case "from": return this.new("From", ...chars).setTag("Word");
        case "default": return this.new("Default", ...chars).setTag("Word");
        case "import": return this.new("Import", ...chars).setTag("Word");
        case "export": return this.new("Export", ...chars).setTag("Word");
        case "function": return this.new("Function", ...chars).setTag("Word");
				case "class": return this.new("Class", ...chars).setTag("Word");
				case "extends": return this.new("Extends", ...chars).setTag("Word");
				default: 
					return this.new("Identifier", ...chars).setTag("Word");
			}
		}

		if (this.match(/[0-9]/)) {
			const chars: lex.Char[] = [this.eat()];
			while (!this.finished() && this.match(/[0-9]/)) {
				chars.push(this.eat());
			}
			return this.new("Number", ...chars);
		}

		if (this.is(".")) {
			const period = this.eat();
			if (this.is(".") && this.is(".", 1)) {
				return this.new("Spread", period, this.eat(), this.eat());
			}
			
			return this.new("Period", period);

		}

		if (this.is("/")) {
			const slash = this.eat();
			if (this.is("*")) {
				return this.new("SlashAsterisk", slash, this.eat());
			}
			if (this.is("=")) {
				return this.new("SlashEquals", slash, this.eat());
			}
			if (this.is("/")) {
				return this.new("DoubleSlash", slash, this.eat());
			}
			return this.new("Slash", slash);
		}

		if (this.is("?")) {
			const mark = this.eat();
			if (this.is("."))
				return this.new("Optional", mark, this.eat());
			return this.new("Question", mark);
		}

    if (this.is("*")) {
      const ast = this.eat();
      if (this.is("="))
        return this.new("AsteriskEquals", ast, this.eat());
      if (this.is("/"))
        return this.new("AsteriskSlash", ast, this.eat());
      return this.new("Asterisk", ast);
    }

		if (this.is("+")) {
			const plus = this.eat();
			if (this.is("+"))
				return this.new("DoublePlus", plus, this.eat());
      if (this.is("="))
        return this.new("PlusEquals", plus, this.eat());
			return this.new("Plus", plus);
		}

		if (this.is("-")) {
			const dash = this.eat();
      if (this.is("-"))
        return this.new("DoubleDash", dash, this.eat());
			if (this.is("="))
				return this.new("DashEquals", dash, this.eat());
			return this.new("Dash", dash);
		}

		if (this.is("%")) {
			const percent = this.eat();
			if (this.is("="))
				return this.new("PercentEquals", percent, this.eat());
			return this.new("Percent", percent);
		}

    if (this.is("&")) {
      const amp = this.eat();
      if (this.is("&"))
        return this.new("DoubleAmpersand", amp, this.eat());
      if (this.is("="))
        return this.new("AmpersandEquals", amp, this.eat());
      return this.new("Ampersand", amp);
    }

    if (this.is("|")) {
      const pipe = this.eat();
      if (this.is("|"))
        return this.new("DoublePipe", pipe, this.eat());
      if (this.is("="))
        return this.new("PipeEquals", pipe, this.eat());
      return this.new("Pipe", pipe);
    }

    if (this.is(">")) {
      const more = this.eat();
      if (this.is("="))
        return this.new("MoreThanEqual", more, this.eat());
      return this.new("MoreThan", more);
    }

    if (this.is("<")) {
      const less = this.eat();
      if (this.is("="))
        return this.new("LessThanEqual", less, this.eat());
      return this.new("LessThan", less);
    }

    if (this.is("=")) {
      const equals = this.eat();
      if (this.is("=")) {
        const equals2 = this.eat();
        if (this.is("="))
          return this.new("TripleEquals", equals, equals2, this.eat());
        return this.new("DoubleEquals", equals, equals2);
      }
      if (this.is(">")) {
        const point = this.eat();
        return this.new("Arrow", equals, point);
      }
      return this.new("Equals", equals);
    }


		switch(this.value()) {
			case"\n": return this.new("Br", this.eat()).setTag("WhiteSpace");
			case"\t": return this.new("Tab", this.eat()).setTag("WhiteSpace");
			case " ": return this.new("Space", this.eat()).setTag("WhiteSpace");
			case '`': return this.new("BackQuote", this.eat());
      case '\\': return this.new("BackSlash", this.eat());

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
				return this.new("Undefined", this.eat());
		}
	}

}