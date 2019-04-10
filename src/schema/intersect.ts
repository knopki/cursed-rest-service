import * as t from "io-ts";

export const intersectValidator = t.intersection([
  t.type({
    /**
     * Requered property
     */
    required: t.string,
  }),
  t.partial({
    /**
     * Optional property
     */
    optional: t.string
  })
]);

export type IntersectIntermediate = t.TypeOf<typeof intersectValidator>;

export interface Intersect extends IntersectIntermediate {};
