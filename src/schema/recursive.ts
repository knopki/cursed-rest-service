import * as t from "io-ts";

export interface Recursive1 {
  type: 'Recursive1'
  b: Recursive2 | undefined
}

export interface Recursive2 {
  type: 'Recursive2'
  a: Recursive1 | undefined
}

export const Recursive1: t.Type<Recursive1> = t.recursion('Recursive1', () =>
  t.interface({
    type: t.literal('Recursive1'),
    b: t.union([Recursive2, t.undefined])
  })
)

export const Recursive2: t.Type<Recursive2> = t.recursion('Recursive2', () =>
  t.interface({
    type: t.literal('Recursive2'),
    a: t.union([Recursive1, t.undefined])
  })
)
