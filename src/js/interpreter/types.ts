import type { int } from "@dunes/lang";


export type ValueType = (
  | "Undefined"
  | "Number"
  | "String"
  | "Boolean"
  | "NaN"
);

export type AnyValue = (
  | UndefinedValue
  | NumberValue
  | StringValue
  | BooleanValue
  | NaNValue
);

export type RealValue = (
  | NumberValue
  | StringValue
  | BooleanValue
);


export interface RuntimeValue extends int.Value<ValueType> {}

export interface UndefinedValue extends RuntimeValue {
  type: "Undefined"
}
export interface NaNValue extends RuntimeValue {
  type: "NaN"
}

export interface NumberValue extends RuntimeValue {
  type: "Number"
  value: number
}

export interface StringValue extends RuntimeValue {
  type: "String"
  value: string
}

export interface BooleanValue extends RuntimeValue {
  type: "Boolean"
  value: boolean
}