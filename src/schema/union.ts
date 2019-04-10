import * as t from "io-ts";

/**
 * Error
 */
const error = t.type({ kind: t.literal("error"), message: t.string }, 'Error');

/**
 * Result
 */
const result = t.type({ kind: t.literal("result"), count: t.number }, 'Result');

/**
 * Coool
 */
export const unionValidator = t.strict({
  /**
   * Union
   */
  union: t.union([t.string, t.null]),
  /**
   * Union of literals
   */
  unionOfLiterals: t.union([t.literal(1), t.literal(2), t.literal(3)]),
  /**
   * keyOf
   */
  keyOf: t.keyof({
    foo: null,
    bar: null,
    baz: null,
  }),
  /**
   * Tagged union // TODO: ugly
   */
  taggedUnion: t.taggedUnion("type", [error, result], 'taggedUnion'),
});

type UnionIntermediate = t.TypeOf<typeof unionValidator>;

/**
 * This is description
 * @id Union#
 * @title Union
 */
export interface Union extends UnionIntermediate {}

// const some: Union = {
//   taggedUnion: {
//     kind: 'error',
//     message: 'ef'
//   }
// }
