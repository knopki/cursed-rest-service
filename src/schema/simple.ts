import * as t from "io-ts";

export const simpleValidator = t.type({
  /**
   * Null type
   */
  null: t.null,
  /**
   * Undefined type
   */
  // undefined: t.undefined,
  /**
   * String type
   */
  string: t.string,
  /**
   * Number type
   */
  number: t.number,
  /**
   * Boolean type
   */
  boolean: t.boolean,
  /**
   * Object type
   */
  object: t.object,
  /**
   * Any type
   */
  any: t.any,
  /**
   * Literal string
   */
  literalString: t.literal('literal'),
  /**
   * Literal number
   */
  literalNumber: t.literal(123),
});

export type Simple = t.TypeOf<typeof simpleValidator>;
