import { Par } from "@dunes/lang/par";
import type { TokenTag, TokenType } from "../lexer/index.js";
import type { 
  AnyDeclaration,
  AnyExportDeclaration,
  AnyForStatement, 
  AnyIdentifier, 
  AnyImportSpecifier, 
  AnyNode, 
  ArrayExpression, 
  ArrayPattern,
  ArrowFunctionExpression, 
  Assignee, 
  BlockComment, 
  BlockStatement,
  CallExpression, 
  ClassBody, 
  ClassDeclaration, 
  ClassMethod,
  ClassProperty, 
  ClassProp, 
  Consequent, 
  DoWhileStatement, 
  ExportAllDeclaration, 
  ExportDefaultDeclaration, 
  ExportNamedDeclaration, 
  ExportSpecifier, 
  Expression, 
  ExpressionStatement, 
  ForInStatement, 
  ForOfStatement, 
  ForStatement, 
  FunctionDeclaration, 
  FunctionExpression, 
  Identifier, 
  IfStatement, 
  ImportDeclaration, 
  LineComment, 
  NumericLiteral, 
  ObjectExpression, 
  ObjectPattern, 
  PrivateIdentifier, 
  PropExpression,
  PropPattern, 
  RegExpLiteral, 
  RestElement, 
  SourceType, 
  SpreadElement, 
  StringLiteral, 
  SwitchCase, 
  SwitchStatement, 
  TemplateElement, 
  TemplateStringLiteral, 
  TryStatement, 
  VariableDeclaration, 
  VariableDeclarator, 
  WhileStatement,
  ClassExpression,
  WithStatement,
  UsingDeclaration,
  ParOptions,
  VarType, 
} from "./types.js";

/**
 * @TODO
 * - optional
 * */

export class Parser extends Par<TokenType, AnyNode, ParOptions, TokenTag> {

  protected override onLoad() {
    if (!this.hasProperty("sourceType")) this.setProperty("sourceType", "cjs");
  }

	protected override parse(): AnyNode {
		this.trim();
    let stmt;

		switch (this.type()) {
			case "Var":
			case "Let":
			case "Const":
			case "Async":
			case "Function":
      case "Using":
			case "Class":  stmt = this.parseDeclaration(); break;

			case "If":     stmt = this.parseIfStatement(); break;
      case "With":   stmt = this.parseWithStatement(); break;
      case "Try":    stmt = this.parseTryStatement(); break;
      case "For":    stmt = this.parseAnyForStatement(); break;
      case "Do":     stmt = this.parseDoWhileStatement(); break;
      case "While":  stmt = this.parseWhileStatement(); break;
      case "Switch": stmt = this.parseSwitchStatement(); break;

      case "SlashAsterisk": stmt = this.parseBlockComment(); break;

      case "Import": {
        this.setProperty("sourceType", "esm");
        stmt = this.parseImportDeclaration(); break;
      }

      case "Export": {
        this.setProperty("sourceType", "esm");
        stmt = this.parseExportDeclaration(); break;
      }

      case "Return": {
        this.eatTrim();
        stmt = this.new("ReturnStatement", {node: this.parseExpression()});
        break;
      }

      case "Throw": {
        this.eatTrim();
        stmt = this.new("ThrowStatement", {node: this.parseExpression()});
        break;
      }

			case "OpenBracket": {
				stmt = this.parseBlock();
        break;
			}

			default: {
        if (this.is("Await") && this.lookAhead(tokens => {
          tokens.shift();
          while (["Br", "Tab", "Space"].includes(tokens[0]!.type)) 
            tokens.shift();
          return tokens[0]!.type === "Using";
        })) {
          this.eatTrim();
          return this.parseUsingDeclaration(false);
        }

				return this.parseExpressionStatement();
      }
		}

    this.trimsemi();

    return stmt;
	}

  // ===== GENERAL =====

  // ----- Comment

  protected parseBlockComment(): BlockComment {
    this.eat();
    let content = "";
    while (this.willContinue() && this.type() !== "AsteriskSlash") {
      content += this.eat().value;
    }
    this.expect("AsteriskSlash", "Expected asterisk slash to end Block comment.")
    this.trim();
    return this.new("BlockComment", {content});
  }

  protected parseLineComment(): LineComment {
    this.eat();
    let content = "";
    while (this.willContinue() && this.type() !== "Br") {
      content += this.eat().value;
    }
    this.expect("Br", "Expected break to end line comment.")
    this.trim();
    return this.new("LineComment", {content});
  }

  // ===== DECLARATION =====

  protected parseDeclaration(): AnyDeclaration {
    switch(this.type()) {
      case "Using": {
        return this.parseUsingDeclaration(false);
      }
      case "Var":
      case "Let":
      case "Const": {
        return this.parseVariableDeclaration();
      }
      case "Class": {
        return this.parseClassDeclaration();
      }
      case "Function": {
        return this.parseFunctionDeclaration(false);
      }
      case "Async": {
        this.eat();
        this.trim();
        if (!this.is("Function")) throw "Expected function keyword after async.";
        return this.parseFunctionDeclaration(true);
      }
      default: throw `Unexpected type ${this.type()}`;
    }
  }

  // ----- Using

  protected parseUsingDeclaration(awaits: boolean): UsingDeclaration {
		this.eatTrim();
    const declarators = this.parseVarDeclarators("Using");
		const use = this.new("UsingDeclaration", {
      kind: "Using", 
      declarators,
      await: awaits
    });
    this.trimsemi();
    return use;
	}

  // ----- Variable

  protected parseVariableDeclaration(): VariableDeclaration {
    const kind = this.eat<"Const" | "Var" | "Let">().type;
    this.trim();
    const declarators = this.parseVarDeclarators(kind);
    return this.new("VariableDeclaration", {kind, declarators});
  }

  protected parseVarDeclarators(kind: VarType): VariableDeclarator[] {
    const declarators: VariableDeclarator[] = [];
    while(this.willContinue() && !this.isAny("Comma", "Semicolon")) {
      const id = this.parseAssignee();
      this.trim();
      if (this.is("Semicolon")) {
        declarators.push(this.new("VariableDeclarator", {id, init: null}));
        break;
      }
      this.expect("Equals", `Expected Equals after identifier in ${kind} declaration`);
      this.trim();
      declarators.push(this.new("VariableDeclarator", {id, init: this.parseExpression()}));
      this.trim();
      if (this.is("Comma")) this.eatTrim();
      else break;
    }
    return declarators;
  }

  // ----- Import

  protected parseImportDeclaration(): ImportDeclaration {
    this.eatTrim();
    const specifiers = this.parseImportSpecifiers();
    this.trim();
    this.expect("From", "Expected from after import specifiers.")
    this.trim();
    if (!this.is("String")) throw `Expected string after for`;
    const source = this.parseString();
    return this.new("ImportDeclaration", {specifiers, source});
  }

  protected parseImportSpecifiers(): AnyImportSpecifier[] {
    const specifiers: AnyImportSpecifier[] = [];
    while(this.willContinue() && !this.isAny("From", "Comma")) {
      if (this.is("Identifier")) {
        specifiers.push(this.new("ImportDefaultSpecifier", {
          local: this.parseAnyIdentifier()
        }))
        this.trim();
      }
      else if (this.is("Asterisk")) {
        this.eat();
        this.trim();
        this.expect("As", "Expected as for namespace specifier");
        this.trim();
        specifiers.push(this.new("ImportNamespaceSpecifier", {
          local: this.parseAnyIdentifier()
        }));
        this.trim();
      }
      else {
        this.expect("OpenBracket", "Expected bracket to list imports");
        this.trim();
        specs:
        while (this.willContinue() && this.isnt("CloseBracket")) {
          const imported = this.parseAnyIdentifier();
          let local = imported;
          this.trim();
          if (this.is("As")) {
            this.eat();
            this.trim()
            local = this.parseAnyIdentifier();
            this.trim()
          }
          specifiers.push(this.new("ImportSpecifier", {local, imported}))
          if (this.isnt("Comma")) break specs;
          this.eatTrim();
        }
        this.trim();
        this.expect("CloseBracket", "Expected bracket to end import list");
        this.trim();
      }
      if (this.isnt("Comma")) break;
      this.eat();
      this.trim();
    }

    return specifiers;
  }

  // ----- Export

  protected parseExportDeclaration(): AnyExportDeclaration {
    this.eatTrim();
    if (this.is("Default")) {
      return this.parseExportDefaultDeclaration();
    }
    else if (this.is("Asterisk")) {
      return this.parseExportAllDeclaration();
    }
    else if (this.is("OpenBracket")) {
      return this.parseExportAllDeclaration();
    }
    else {
      return this.new("ExportNamedDeclaration", {
        declaration: this.parseDeclaration(),
        source: null,
        specifiers: []
      })
    }
  }

  protected parseExportDefaultDeclaration(): ExportDefaultDeclaration {
    this.eatTrim();
    return this.new("ExportDefaultDeclaration", {declaration: this.parseDeclaration()});
  }

  protected parseExportAllDeclaration(): ExportAllDeclaration {
    this.eatTrim();
    let exported: Identifier | null = null;
    if (this.if("As")) {
      this.trim();
      exported = this.parseIdentifier();
      this.trim();
    }
    if (!this.if("From")) {
      throw `Expected From after identifier in export all`;
    }
    this.trim();
    if (!this.is("String")) throw `Expected string after from in export all`;
    const source = this.parseString();
    return this.new("ExportAllDeclaration", {exported, source});
  }

  protected parseExportNamedDeclaration(): ExportNamedDeclaration {
    const specifiers: ExportSpecifier[] = [];
    while (this.willContinue() && this.isnt("CloseBracket")) {
      const exported = this.parseAnyIdentifier();
      let local = exported;
      this.trim();
      if (this.is("As")) {
        this.eat();
        this.trim()
        local = this.parseAnyIdentifier();
        this.trim()
      }
      specifiers.push(this.new("ExportSpecifier", {local, exported}))
      if (this.isnt("Comma")) break;
      this.eat();
      this.trim();
    }
    let source: StringLiteral | null = null;
    if (this.if("From")) {
      this.trim();
      if (this.isnt("String")) {
        throw `Expected string after export from`
      }
      source = this.parseString();
    }

    return this.new("ExportNamedDeclaration", {
      specifiers, source, declaration: null
    });
  }

  // ----- Function

  protected parseFunctionDeclaration(async: boolean): FunctionDeclaration {
		this.eatTrim();
		const generator = !!this.if("Asterisk");
		if (generator) this.trim();
		const id = this.parseAnyIdentifier();
		this.trim();
		this.expect("OpenParen", "Expected parenthesis after function identifier");
		this.trim();
		const params = this.parseParameters();
		this.trim();
		const body = this.parseBlock();
		this.trim();
		return this.new("FunctionDeclaration", {async, generator, id, params, body});
	}

  // ----- Class

  protected parseClassDeclaration(): ClassDeclaration {
		this.eatTrim();
		const id = this.parseAnyIdentifier();
		this.trim();
		let extend: AnyNode | null = null;
		if (this.is("Extends")) {
			this.eat();
			this.trim();
			extend = this.parseExpression();
			this.trim();
		}
		this.expect("OpenBracket", "Expected bracket to open class body");
		this.trim();
		const body = this.parseClassBody();
		this.trim();
		return this.new("ClassDeclaration", {id, body, extend});
	}

  protected parseClassBody(): ClassBody {
    this.trim();
		const props: ClassProp[] = [];
		while(this.willContinue() && this.isnt("CloseBracket")) {
			const id = this.parseAnyIdentifier(true);
			this.trim();
			if (this.is("OpenParen"))
				props.push(this.parseClassMethod(id));
			else
				props.push(this.parseClassProperty(id));
			this.trim();
		}
		this.expect("CloseBracket", "Expected bracket to close class body");
		this.trim();
		return this.new("ClassBody", {props});
	}
	
  protected parseClassMethod(id: AnyIdentifier): ClassMethod {
		this.eatTrim();
		const params = this.parseParameters();
		this.trim();
		if (!this.is("OpenBracket")) throw (
			"Expected bracket to open class method body"
		)
		this.trim();
		const body = this.parseBlock();
		return this.new("ClassMethod", {id, params, body})
	}
	
  protected parseClassProperty(id: AnyIdentifier): ClassProperty {
		
		let init: AnyNode | null = null;
		if (this.is("Equals")) {
			this.eat();
			this.trim();

			init = this.parseExpression();
			this.trim();
		}

		this.trimsemi();

		return this.new("ClassProperty", {
			id,
			init
		})
	}

  // ===== STATEMENT =====

  // ----- Body

  protected parseBlock(): BlockStatement {
    this.eatTrim();
    const body: AnyNode[] = [];
    while (this.willContinue() && this.isnt("CloseBracket")) {
      body.push(this.parse());
      this.trim();
    }
    this.expect("CloseBracket", "Expected bracket to end block");
    this.trimsemi();
    return this.new("BlockStatement", {body: body});
  }

  protected parseExpressionStatement(): ExpressionStatement {
    let stmt = this.new("ExpressionStatement", {expression: this.parseExpression()});
    this.trimsemi();
    return stmt;
  }

  // ----- For Loop
  
  protected parseAnyForStatement(): AnyForStatement {
    this.eatTrim();
    const awaits = this.is("Await");

    if (awaits) {
      this.eatTrim();
    }

    this.expect("OpenParen", "Expected parenthesis after 'for'");
    this.trim();

    if (this.is("Semicolon")) {
      return this.parseForStatement(null);
    }

    let init;
    if (this.isAny("Const", "Var", "Let")) {
      const kind = this.eat<"Const" | "Var" | "Let">().type;
      this.trim();
      init = this.new("VariableDeclaration", {
        kind, 
        declarators: [
          this.new("VariableDeclarator", {
            id: this.parseAssignee(),
            init: null
          })
        ]
      })
    }
    else {
      init = this.parseExpression();
    }
    this.trim();

    if (awaits) {
      return this.parseForOfStatement(init, true);
    }
    if (this.is("Of")) {
      return this.parseForOfStatement(init, false);
    }
    if (this.is("In")) {
      return this.parseForInStatement(init);
    }
    else {
      return this.parseForStatement(init);
    }
  }
  
  protected parseForOfStatement(left: AnyNode, awaits: boolean): ForOfStatement {
    this.eatTrim();

    const right = this.parseExpression();
    this.trim();

    this.expect("CloseParen", "Expected closing parenthesis in for expression");
    this.trim();

    const body = this.parseConsequent();
    this.trim();

    return this.new("ForOfStatement", {left, right, await: awaits, body});
  }
  
  protected parseForInStatement(left: AnyNode): ForInStatement {
    this.eatTrim();

    const right = this.parseExpression();
    this.trim();

    this.expect("CloseParen", "Expected closing parenthesis in for expression");
    this.trim();

    const body = this.parseConsequent();
    this.trim();
  
    return this.new("ForInStatement", {left, right, body});
  }
  
  protected parseForStatement(init: AnyNode | null): ForStatement {
    this.expect("Semicolon", "Expected semicolon after 'init'");
    this.trim();

    let test;

    if (this.is("Semicolon")) {
      this.eatTrim();
      test = null;
    }
    else {
      test = this.parseExpression();
      this.trim();
    }
    this.expect("Semicolon", "Expected semicolon after 'test'");
    this.trim();

    let update;

    if (this.is("CloseParen")) {
      update = null;
    }
    else {
      update = this.parseExpression();
      this.trim();
    }
    this.expect("CloseParen", "Expected closing parenthesis in for expression");
    this.trim();

    const body = this.parseConsequent();
    this.trim();
  
    return this.new("ForStatement", {init, test, update, body});
  }

  // ----- While Statement
  
  protected parseWhileStatement(): WhileStatement {
    this.eatTrim();
    this.expect("OpenParen", "Expected parenthesis after while keyword");
    this.trim();
    const test = this.parseExpression();
    this.trim();
    this.expect("CloseParen", "Expected parenthesis after while condition");
    this.trim();
    const body = this.parseConsequent();
    return this.new("WhileStatement", {test, body})
  }

  // ----- Do While Statement
  
  protected parseDoWhileStatement(): DoWhileStatement {
    this.eat();
    this.trim();
    const body = this.parseBlock();
    this.trim();
    this.expect("While", "Expected while after do");
    this.trim();
    const test = this.parseExpression();
    return this.new("DoWhileStatement", {test, body});
  }
  
  // ----- If Statement
  
  protected parseIfStatement(): IfStatement {
		this.eat();
		this.trim();
		this.expect("OpenParen", (
			"Expected parenthesis after If keyword"
		))
		this.trim();
		const test = this.parseExpression();
		this.trim();
		this.expect("CloseParen", (
			"Expected parenthesis after If condition"
		))
		this.trim();
		const consequent = this.parseConsequent();
    this.trim();
		const if_stmt = this.new("IfStatement", {
			test,
			consequent,
      alternate: null
		})
    this.trim();

    if (this.isnt("Else")) return if_stmt;
    this.eat();
    this.trim();
    if (this.is("If")) {
      if_stmt.alternate = this.parseIfStatement();
    }
    else {
      if_stmt.alternate = this.parseConsequent();
    }
    this.trim();
    return if_stmt;
	}

  // ----- With Statement
  
  protected parseWithStatement(): WithStatement {
    this.eatTrim();
    this.expect("OpenParen", "Expected parenthesis after with keyword");
    this.trim();
    const namespace = this.parseExpression();
    this.trim();
    this.expect("CloseParen", "Expected parenthesis after with namespace");
    this.trim();
    const body = this.parseConsequent();
    return this.new("WithStatement", {namespace, body});
  }

  // ----- Try Statement
  
  protected parseTryStatement(): TryStatement {
    this.eat();
    this.trim();
    const block = this.parseBlock();
    let handler;
    if (this.is("Catch")) {
      this.eatTrim();
      this.expect("OpenParen", "Expected open parenthesis after catch");
      this.trim();
      const param = this.parseAnyIdentifier();
      this.trim();
      this.expect("CloseParen", "Expected close parenthesis after catch");
      this.trim();
      handler = this.new("CatchClause", {param, body: this.parseBlock()});
    }
    else {
      handler = null;
    }
    let finalizer;
    if (this.is("Finally")) {
      this.eatTrim();
      finalizer = this.parseBlock();
    }
    else {
      finalizer = null;
    }

    return this.new("TryStatement", {block, handler, finalizer});
  }
  
  // ----- Switch Statement

  protected parseSwitchStatement(): SwitchStatement {
    this.eat();
    this.trim();
    this.expect("OpenParen", (
      "Expected parenthesis after switch keyword"
    ))
    this.trim();
    const discriminant = this.parseExpression();
    this.trim();
    this.expect("CloseParen", (
      "Expected parenthesis after switch discriminant expression"
    ))
    this.trim();

    const cases: SwitchCase[] = [];
    
    this.expect("OpenBracket", (
      "Expected OpenBracket after switch discriminant"
    ))
    this.trim();

    while (this.willContinue() && this.isnt("CloseBracket")) {

      if (this.is("Case")) {
        this.eatTrim();
        const test = this.parseExpression();
        this.expect("Colon", "Expected colon after switch case expression");
        this.trim();
        let consequent;
        if (this.is("Case")) {
          consequent = null;
        } 
        else {
          consequent = this.parseConsequent();
          this.trim();
        }
        cases.push(this.new("SwitchCase", {consequent, test}))
      }
      else if (this.is("Default")) {
        this.eatTrim();
        this.expect("Colon", "Expected colon after switch default case");
        this.trim();
        const consequent = this.parseConsequent();
        cases.push(this.new("SwitchCase", {consequent, test: null}))
      }
      else {
        throw `Unexpected token ${this.type()} inside switch body`;
      }
      this.trim();

    }

    return this.new("SwitchStatement", {
      discriminant,
      cases
    })
  }

  // ===== EXPRESSION =====

  protected parseExpression(): AnyNode {
		return this.parseAssignment();
	}

  protected parseAssignment(): AnyNode {
    const assigne = this.parseConditional();
    this.trim();

    if (this.willContinue() && this.isAny(
      "Equals", "PlusEquals", "DashEquals",
      "PercentEquals", "SlashEquals", "AsteriskEquals"
    )) {
      const operator = this.eat().type;
      this.trim();
      const value = this.parseExpression();
      this.trim();

      return this.new("AssignmentExpression", {
        assigne, operator, value
      })
    }

    return assigne;
  }

  // ----- Conditional

  protected parseConditional(): AnyNode {
    const test = this.parseAdditive();
    this.trim();
    if (this.willContinue() && this.is("Question")) {
      this.eatTrim();
      const consequent = this.parseExpression();
      this.trim();
      this.expect("Colon", "Expected colon to finalize ternary expression");
      this.trim();
      const alternate = this.parseExpression();
      return this.new("ConditionalExpression", {test, consequent, alternate});
    }
    return test;
  }

  // ----- Binary

  protected parseAdditive(): AnyNode {

    const left = this.parseMultiplicative();

    this.trim();
    if (this.willContinue() && this.isAny("Dash", "Plus")) {
      const operator = this.eat().type;
      this.trim();
      return this.new("BinaryExpression", {
        kind: "add",
        left,
        operator,
        right: this.parseExpression(),
      })
    }

    return left;
  }

  protected parseMultiplicative(): AnyNode {

		const left = this.parseComparative();

		this.trim();
		if (this.willContinue() && this.isAny("Asterisk", "Slash", "Percent")) {
			const operator = this.eat().type;
			this.trim();
			return this.new("BinaryExpression", {
        kind: "mul",
				operator,
				left,
				right: this.parseExpression(),
			})
		}

		return left;
	}

  protected parseComparative(): AnyNode {

    const left = this.parseMemberCall();

    this.trim();
    if (this.willContinue() && this.isAny(
      "DoublePipe", "DoubleAmpersand", 
      "DoubleEquals",
      "TripleEquals",
      "MoreThanEqual", "MoreThan",
      "LessThanEqual", "LessThan",
      "InstanceOf", "In"
    )) {
      const operator = this.eat().type;
      this.trim();
      return this.new("BinaryExpression", {
        kind: "com",
        operator,
        left,
        right: this.parseExpression(),
      })
    }

    return left;
  }

  // ----- Member, Call

  protected parseMemberCall(): AnyNode {
		let member: AnyNode = this.parseMember(null, false);
		this.trim();
		if (this.is("OpenParen")) {
			member = this.parseCall(member, false);
		}
    if (this.is("BackQuote")) {
      member = this.new("TemplateStringExpression", {
        tag: member,
        quasi: this.parseTemplateString()
      });
    }
    if (this.is("Period")) {
      member = this.parseMember(member, false);
    }
		return member;
	}

  protected parseMember(parent: AnyNode | null, optional: boolean): AnyNode {
		let object = parent || this.parsePrimary();
		this.trim();
		while (this.willContinue() && this.isAny("Period", "OpenSquare")) {
			const computed = this.is("OpenSquare");
			this.eatTrim();
			let property;
      if (computed) {
        property = this.parseExpression();
      }
      else property = this.parseAnyIdentifier(true);
			this.trim();
			if (computed) {
				this.expect("CloseSquare", (
					"Expected closing square bracket in member expression"
				))
				this.trim();
			}
			object = this.new("MemberExpression", {
				object,
				computed,
				property,
        optional,
			})

		}
		return object;
	}

  protected parseCall(caller: AnyNode, optional: boolean): CallExpression {
		this.eat();
		this.trim();
		const args: AnyNode[] = [];
		while(this.willContinue() && this.isnt("CloseParen")) {
			args.push(this.parseArgument());
			this.trim();
			
			if (this.type() === "Comma") {
				this.eat()
				this.trim();
			}
		}
		this.expect("CloseParen", (
			"Expected closing parenthesis to end argument list"
		))
		this.trim();
		let callExpr = this.new("CallExpression", {
			caller,
			args,
      optional
		})
		if (this.is("OpenParen")) {
			callExpr = this.parseCall(callExpr, optional);
			this.trim();
		}
		return callExpr;
	}

  // ----- Primary Expression

  protected parsePrimary(): AnyNode {
    switch(this.type()) {
      case "Async": {
        this.eat();
        this.trim()
        if (this.is("OpenParen")) {
          return this.parseArrowFunctionExpression(true);
        }
        if (!this.is("Function")) {
          throw "Expected function keyword after async."
        }

        return this.parseFunctionExpression(true);
      }

      case "Function": {
        return this.parseFunctionExpression(false);
      }

      case "Class": {
        return this.parseClassExpression();
      }

      case "DoubleSlash": {
        return this.parseLineComment();
      }

      case "String": {
        return this.parseString();
      }

      case "BackQuote": {
        return this.parseTemplateString();
      }

      case "New": {
        this.eatTrim();
        return this.new("NewExpression", {caller: this.parseExpression()});
      }

      case "Await": {
        this.eatTrim();
        return this.new("AwaitExpression", {node: this.parseExpression()});
      }

      case "OpenBracket": {
        return this.parseObjectExpression();
      }

      case "OpenSquare": {
        return this.parseArrayExpression();
      }

      case "OpenParen": {
        const arrow = this.lookAhead((tokens) => {
          let depth = 0;

          while (tokens.length) {
            if (tokens[0]!.type === "OpenParen") {
              depth++;
            }
            else if (tokens[0]!.type === "CloseParen") {
              tokens.shift();
              if (depth === 1) {
                while (tokens.length && ["Br", "Tab", "Space"].includes(tokens[0]!.type))  {
                  tokens.shift();
                }
                return (tokens[0] as any)!.type === "Arrow";
              }
              else depth--;
            }
            tokens.shift();
          }

          return false;
        })
        if (arrow) {
          return this.parseArrowFunctionExpression(false);
        }

        this.eat();
        this.trim();
        const node = this.parseExpression();
        this.trim();

        if (this.if("CloseParen")) {
          this.trim();
          return node;
        }

        this.expect("Comma", "Expected comma for sequence");
        this.trim();
        const nodes: AnyNode[] = [node];
        while (this.willContinue() && this.isnt("CloseParen")) {
          nodes.push(this.parseExpression())
          this.trim();
          if (this.is("Comma")) {
            this.eat();
            this.trim();
          }
          else break;
        }
        this.expect("CloseParen", 
          "Expected closing parenthesis to end group expression."
        )
        return this.new("SequenceExpression", {nodes})
      }

      case "Slash": {
        return this.parseRegExpLiteral();
      }

      case "Number": {
        return this.parseNumericLiteral();
      }

      case "Break": {
        this.eatTrim();
        let label: AnyIdentifier | null = null;
        if (this.isAny("Hash", "Identifier")) {
          label = this.parseIdentifier();
        }
        return this.new("BreakStatement", {label});
      }

      case "Continue": {
        this.eatTrim();
        let label: AnyIdentifier | null = null;
        if (this.isAny("Hash", "Identifier")) {
          label = this.parseIdentifier();
        }
        return this.new("ContinueStatement", {label});
      }

      case "Hash":
      case "Identifier": {
        const argument = this.parseAnyIdentifier();
        this.trim();
        if (this.isAny("DoublePlus", "DoubleDash")) {
          const operator = this.eat().type;
          return this.new("UpdateExpression", {
            argument,
            operator,
            prefix: false
          })
        }
        if (this.if("Colon")) {
          this.trim();
          return this.new("LabeledStatement", {
            body: this.parse()
          })
        }
        return argument;
      }

      case "Plus": 
      case "Exclamation": 
      case "TypeOf": 
      case "Void": 
      case "Dash": {
        const operator = this.eat().type;
        this.trim();
        const argument = this.parseExpression();
        return this.new("UnaryExpression", {
          argument,
          operator,
          prefix: true
        })
      }

      case "DoublePlus": 
      case "DoubleDash": {
        const operator = this.eat().type;
        this.trim();
        const argument = this.parseAnyIdentifier();
        return this.new("UpdateExpression", {
          argument,
          operator,
          prefix: true
        })
      }

      default: {
        throw "Expected expression";
      }
    }
  }

  // ----- Assignment

  protected parseAssignee(): Assignee {

    switch(this.type()) {

      case "OpenBracket": {
        return this.parseObjectPattern();
      }

      case "OpenSquare": {
        return this.parseArrayPattern();
      }

      case "Identifier": {
        return this.parseAnyIdentifier();
      }

      default: throw (
        `Unexpected assigne of type ${this.type()}`
      )
    }
  }

  protected parseRestPattern(): Assignee {
    
    if (this.is("Spread")) {
      this.eatTrim();
      return this.parseRestElement();
    }
    return this.parseAssignmentPattern();
  }

  protected parseAssignmentPattern(): Assignee {
    const left = this.parseAssignee();
    this.trim();
    if (this.willContinue() && this.is("Equals")) {
      this.eat().type;
      this.trim();
      const right = this.parseExpression();
      this.trim();

      return this.new("AssignmentPattern", {
        left, 
        right
      })
    }
    return left;
  }

  protected parseArgument(): AnyNode {
    if (this.is("Spread")) {
      this.eatTrim();
      return this.parseSpreadElement();
    }
    return this.parseExpression();
  }

  // ----- Identifier

  protected parseAnyIdentifier(len = false): AnyIdentifier {
    if (this.if("Hash")) {
      return this.parsePrivateIdentifier(len);
    }
    return this.parseIdentifier(len);
  }

  protected parsePrivateIdentifier(len = false): PrivateIdentifier {
    if (len) {
      const symbol = this.expectTag("Word", "Expected word").value;
      return this.new("PrivateIdentifier", {symbol});
    }
    const symbol = this.expect("Identifier", "Expected identifier").value;
    return this.new("PrivateIdentifier", {symbol});
  }

  protected parseIdentifier(len = false): Identifier {
    if (len) {
      const symbol = this.expectTag("Word", "Expected word").value;
      return this.new("Identifier", {symbol});
    }
    const symbol = this.expect("Identifier", "Expected identifier").value;
    return this.new("Identifier", {symbol});
  }

  // ----- Pattern

  protected parseRestElement(): RestElement {
    return this.new("RestElement", {argument: this.parseExpression()});
  }

  protected parseArrayPattern(): ArrayPattern {

    this.eat();
    this.trim();
    const entries: AnyNode[] = [];
    while (this.willContinue() && this.type() !== "CloseSquare") {
      entries.push(this.parseRestPattern());
      this.trim();
      if (this.type() === "Comma") {
        this.eat()
        this.trim();
      }
    }
    const array = this.new("ArrayPattern", {items: entries})
    this.trim();
    this.expect("CloseSquare", 
      "Expected closing square bracket to end Array literal."
    )
    return array;
  }

  protected parseObjectPattern(): ObjectPattern {
    this.eat();
    this.trim();
    const props = this.parsePatternProps();
    const obj = this.new("ObjectPattern", {props})
    this.trim();
    this.expect("CloseBracket", 
      "Expected closing bracket to end Object pattern."
    )
    return obj;
  }

  protected parsePatternProps(): PropPattern[] {
    const props: PropPattern[] = [];
    while (this.willContinue() && this.type() !== "CloseBracket") {
     
      if (this.if("Spread")) {
        this.trim();
        props.push(this.parseRestElement());
      }
      else {
        let shorthand = false;
        let key: Assignee | StringLiteral
        let value: Assignee;
        const computed = this.is("OpenSquare");

        if (computed) {
          this.eatTrim();
          key = this.parseAssignee();
          this.trim();
          this.expect("CloseSquare", "Expected close square to end indexed type.")
        }
        else if (this.is("String")) {
          key = this.parseString();
        }
        else {
          key = this.parseAnyIdentifier(true);
        }

        this.trim();
        if (this.if("Colon")) {
          this.trim();
          value = this.parseAssignmentPattern();
          this.trim();
        }
        else {
          if (key.type !== "Identifier" && key.type !== "PrivateIdentifier") {
            throw `Expected initiation not ${key.type}`;
          }
          shorthand = true;
          value = key;
        }
        
        props.push(this.new("PropertyPattern", {
          key,
          value,
          kind: "init",
          method: false,
          shorthand,
          computed
        }));
      }

      if (this.isnt("Comma")) break;
      this.eatTrim();
    }
    return props;
  }

  // ----- Class Expression


  protected parseClassExpression(): ClassExpression {
    this.eatTrim();
    let id: AnyIdentifier | null = null;
    if (this.is("Identifier")) {
      id = this.parseAnyIdentifier();
    }
    this.trim();
    let extend: AnyNode | null = null;
    if (this.is("Extends")) {
      this.eat();
      this.trim();
      extend = this.parseExpression();
      this.trim();
    }
    this.expect("OpenBracket", "Expected bracket to open class body");
    this.trim();
    const body = this.parseClassBody();
    this.trim();
    return this.new("ClassExpression", {id, body, extend});
  }

  // ----- Function Expression

  protected parseFunctionExpression(async: boolean): FunctionExpression {
    this.eat();
    this.trim();
    const generator = !!this.if("Asterisk");
    if (generator) {
      this.trim();
    }

    let id: AnyIdentifier | null = null;

    if (this.is("Identifier")) {
      id = this.parseAnyIdentifier();
      this.trim();
    }
    this.expect("OpenParen", (
      "Expected parenthesis after function identifier"
    ))
    this.trim();

    const params = this.parseParameters();

    if (!this.is("OpenBracket")) throw (
      "Expected bracket to open function body"
    )
    this.trim();
    const body = this.parseBlock();
    this.trim();

    return this.new("FunctionExpression", {
      async, 
      generator,
      id,
      params, 
      body, 
    })
  }

  protected parseArrowFunctionExpression(async: boolean): ArrowFunctionExpression {
    this.eat();
    this.trim();

    const params = this.parseParameters();
    this.trim();
    this.expect("Arrow", "Expected arrow after parameters list");
    this.trim();

    let body: BlockStatement | Expression
    const expression = !this.is("OpenBracket");

    if (expression) {
      body = this.parseExpression();
    }
    else {
      body = this.parseBlock();
    }
    this.trim();

    return this.new("ArrowFunctionExpression", {
      async, 
      params, 
      body,
      expression
    })
  }

  // ----- Complex

  protected parseObjectExpression(): ObjectExpression {
    this.eatTrim();
    const props = this.parseExpressionProps();
    const obj = this.new("ObjectExpression", {props});
    this.trim();
    this.expect("CloseBracket", "Expected closing bracket to end Object literal.");
    return obj;
  }

  protected parseExpressionProps(): PropExpression[] {
    const props: PropExpression[] = [];
    while (this.willContinue() && this.type() !== "CloseBracket") {
      
      if (this.if("Spread")) {
        this.trim();
        props.push(this.parseSpreadElement());
      }
      else {
        let shorthand = false;
        let value: AnyNode;
        let key: AnyNode
        const computed = this.is("OpenSquare");

        if (computed) {
          this.eatTrim();
          key = this.parseExpression();
          this.trim();
          this.expect("CloseSquare", "Expected close square to end indexed type.")
        }
        else if (this.is("String")) {
          key = this.parseString();
        }
        else {
          key = this.parseAnyIdentifier(true);
        }

        this.trim();
        if (this.if("Colon")) {
          this.trim();
          value = this.parseExpression();
          this.trim();
        }
        else if (this.if("OpenParen")) {
          this.trim();
          const params = this.parseParameters();
          this.trim();
          const body = this.parseBlock();
          this.trim();
          props.push(this.new("PropertyMethod", {
            key,
            params,
            body,
            kind: "method",
            method: true,
            shorthand,
            computed,
            async: false,
            generator: false
          }));
          continue;
        }
        else {
          if (key.type !== "Identifier" && key.type !== "PrivateIdentifier") {
            throw `Expected initiation not ${key.type}`;
          }
          shorthand = true;
          value = key;
        }
        
        props.push(this.new("PropertyExpression", {
          key,
          value,
          kind: "init",
          method: false,
          shorthand,
          computed
        }));
      }

      if (this.isnt("Comma")) break;
      this.eatTrim();
    }
    return props;
  }

  protected parseArrayExpression(): ArrayExpression {

    this.eat();
    this.trim();
    const entries: AnyNode[] = [];
    while (this.willContinue() && this.type() !== "CloseSquare") {
      entries.push(this.parseArgument());
      this.trim();
      if (this.type() === "Comma") {
        this.eat()
        this.trim();
      }
    }
    const array = this.new("ArrayExpression", {items: entries})
    this.trim();
    this.expect("CloseSquare", 
      "Expected closing square bracket to end Array literal."
    )
    return array;
  }

  protected parseSpreadElement(): SpreadElement {
    return this.new("SpreadElement", {argument: this.parseExpression()});
  }
 
  protected parseTemplateString(): TemplateStringLiteral {
    this.eatTrim();
    const quasis: TemplateElement[] = [];
    const expressions: AnyNode[] = [];
    while (this.willContinue() && this.isnt("BackQuote")) {

      let raw = "";
      while (this.willContinue() && this.isntAny("OpenTemplate", "BackQuote")) {
        if (this.is("BackSlash")) {
          const slash = this.eat();
          if (this.willContinue())
            raw += this.eat().value;
          else 
            raw += slash;
        }
        else
          raw += this.eat().value;
      }
      const tail = this.is("BackQuote");
      if (raw) {
        quasis.push(this.new("TemplateElement", {
          value: {raw, cooked: this.cook(raw)},
          tail,
        }))
      }
      if (this.if("OpenTemplate")) {
        this.trim();
        expressions.push(this.parseExpression());
        this.trim();
        this.expect("CloseBracket", "Expected close bracket to close expression");
      }
    }
    this.eatTrim();
    return this.new("TemplateStringLiteral", {quasis, expressions});
  }

  // ----- Literals

  protected parseString(): StringLiteral {
    const raw = this.eat().value;
    return this.new("StringLiteral", {
      value: this.cook(raw).slice(1, -1),
      raw,
    })
  }

  protected parseNumericLiteral(): NumericLiteral {
    let raw = this.eat().value;
    let float = this.type() === "Period";
    if (float) {
      raw += this.eat().value;
      raw += this.expect("Number", 
        "Expected number after decimal period"
      ).value;
    }
    return this.new("NumericLiteral", {
      value: parseInt(raw), raw, float
    });
  }

  protected parseRegExpLiteral(): RegExpLiteral {
    this.eatTrim();
    let pattern = "";
    while (this.willContinue() && this.isnt("Slash")) {
      pattern += this.eat().value;
    }
    this.eat();
    let flags = null;
    if (this.is("Identifier")) flags = this.eat().value;
    return this.new("RegExpLiteral", {
      value: {},
      raw: `/${pattern}/${flags||""}`,
      regex: {pattern, flags}
    })
  }

  // ----- Other

  protected parseParameters(): Assignee[] {
    const params: Assignee[] = [];
    while(this.willContinue() && this.isnt("CloseParen")) {
      params.push(this.parseRestPattern())
      this.trim(); 
      if (this.isnt("Comma")) break;
      this.eatTrim();
    }
    this.expect("CloseParen", "Expected parenthesis to close function params");
    this.trim();
    return params;
  }

  protected parseConsequent(): Consequent {
    if (this.is("OpenBracket")) {
      return this.parseBlock();
    }
    if (this.is("Semicolon")) {
      this.eat();
      return this.new("EmptyExpression", {});
    }
    return this.parseExpressionStatement();
  }


  // ===== TOOLS ===== 

  protected trim() {
    while (this.willContinue() && this.has("WhiteSpace")) this.eat();
  }

  protected trimsemi() {
    this.trim();
    while (this.willContinue() && this.is("Semicolon")) {
      this.eatTrim();
    }
  }

  protected eatTrim() {
    this.eat();
    this.trim()
  }

  protected cook(raw: string): string {
    return raw === "\\"? raw : raw.replace(/\\/g, "");
  }
}