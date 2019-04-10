import * as t from "io-ts";

export const arrayValidator = t.type({
  /**
   * Array of nulls
   */
  null: t.array(t.null),
  /**
   * Array of undefined
   */
  // undefined: t.array(t.undefined),
  /**
   * Array of strings
   */
  string: t.array(t.string),
  /**
   * Array of numbers
   */
  number: t.array(t.number),
  /**
   * Array of booleans
   */
  boolean: t.array(t.boolean),
  /**
   * Array of objects
   */
  object: t.array(t.object),
  /**
   * Array of any
   */
  any: t.array(t.any),
  /**
   * Array of literal string
   */
  literalString: t.array(t.literal('literal')),
  /**
   * Array of literal number
   */
  literalNumber: t.array(t.literal(123)),
  /**
   * Readonly array
   */
  readonlyArray: t.readonlyArray(t.string),
  /**
   * Tuple
   * @maxItems 2
   */
  tuple: t.tuple([t.string, t.number]),
  /**
   * triple
   * @maxItems 3
   */
  triple: t.tuple([t.string, t.number, t.boolean]),
});

export type Array = t.TypeOf<typeof arrayValidator>;
