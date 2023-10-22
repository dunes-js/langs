import { par, int } from "@dunes/lang";
import type { TokenType } from "../lexer/types.js";
import type { AnyNode, BinaryExpression, Identifier, NumericLiteral, StringLiteral } from "../parser/types.js";
import type { AnyValue, NumberValue, RealValue, StringValue, UndefinedValue } from "./types.js";

export class Interpreter extends int.Int<AnyValue, AnyNode, par.ParserOptions> {
  
  override globalEnvironment(): int.Environment<AnyValue> {
    return new int.Environment(null).with({
      true:  this.new("Boolean", {value: true }),
      false: this.new("Boolean", {value: false}),
      undefined: this.new("Undefined", {}),
    });
  }

  override emptyValue(): UndefinedValue {
    return this.new("Undefined", {});
  }
  
  override evaluate(node: AnyNode, env: int.Environment<AnyValue>): AnyValue {
    
    switch(node.type) {

      case "ExpressionStatement": {
        return this.evaluate(node.expression, env);
      }

      case "NumericLiteral": {
        return this.evaluateNumber(node);
      }

      case "StringLiteral": {
        return this.evaluateString(node);
      }

      case "Identifier": {
        return this.evaluateIdentifier(node, env);
      }

      case "BinaryExpression": {
        return this.evaluateBinaryExpression(node, env);
      }

      default: {
        throw `Don't know how to evaluate '${node.type}'`;
      }

    }
  }

  protected isReal(node: AnyValue): node is RealValue {
    return node.type !== "Undefined" && node.type !== "NaN";
  }

  protected evaluateBinaryExpression(node: BinaryExpression, env: int.Environment<AnyValue>): AnyValue {

    const lhs = this.evaluate(node.left, env);
    const rhs = this.evaluate(node.right, env);

    if (lhs.type === "Number") {
      if (rhs.type === "Number") {
        return this.doOperation(lhs.value, rhs.value, node.operator);
      }
      if (rhs.type === "Boolean") {
        return this.doOperation(lhs.value, rhs.value? 1: 0, node.operator);
      }
      if (this.isReal(rhs) && node.operator === "Plus") {
        return this.concatenate(lhs, rhs);
      }
    }
    else if (lhs.type === "String") {
      if (rhs.type === "Undefined") {
        return this.concatenateValue(lhs, "undefined");
      }
      if (rhs.type === "NaN") {
        return this.concatenateValue(lhs, "NaN");
      }
      if (node.operator === "Plus") {
        return this.concatenate(lhs, rhs);
      }
    }
    else if (lhs.type === "Boolean") {
      if (rhs.type === "Number") {
        return this.doOperation(lhs.value? 1: 0, rhs.value, node.operator);
      }
      if (rhs.type === "Boolean") {
        return this.doOperation(lhs.value? 1: 0, rhs.value? 1: 0, node.operator);
      }
      if (this.isReal(rhs) && node.operator === "Plus") {
        return this.concatenate(lhs, rhs);
      }
    }
    else if (this.isReal(lhs) && this.isReal(rhs) && node.operator === "Plus") {
      return this.concatenate(lhs, rhs);
    }

    return this.new("NaN", {});
  }

  protected doOperation(lhsValue: number, rhsValue: number, operator: TokenType): NumberValue {
    let value: number
    switch(operator) {
      case "Plus": value = lhsValue + rhsValue; break;
      case "Dash": value = lhsValue - rhsValue; break;
      case "Asterisk": value = lhsValue * rhsValue; break;
      case "Slash": value = lhsValue / rhsValue; break;
      case "Percent": value = lhsValue % rhsValue; break;
      default: {
        throw `Operator ${operator} is not allowed.`
      }
    }
    return this.new("Number", {value});
  }

  protected concatenate(lhs: RealValue, rhs: RealValue): StringValue {
    const value = String(lhs.value) + String(rhs.value);
    return this.new("String", {value});
  }

  protected concatenateValue(lhs: RealValue, rhs: string): StringValue {
    const value = String(lhs.value) + rhs;
    return this.new("String", {value});
  }

  protected evaluateIdentifier(node: Identifier, env: int.Environment<AnyValue>): AnyValue {
    return env.find(node.symbol);
  }

  protected evaluateNumber(node: NumericLiteral): NumberValue {
    return this.new("Number", {value: node.value});
  }

  protected evaluateString(node: StringLiteral): StringValue {
    return this.new("String", {value: node.value});
  }

}