# typings typings typings typings

## Introduction

> Yo dawg so I heard you like validators so we put typings in your validators
> so you can type while you validate.

We have Typescript Types, we have some validators (like `ajv` or `io-ts`),
we want a contract for our API and we want generated documentation too.
So we need to describe the same data structures several times.

This very dirty PoC shows how to describe data structures only once and have

- Typescript Types
- `io-ts` validators
- JSON Schemas
- `OpenAPI` 3.0 contract
- `ReDoc` documentation

## Describe structures

In `src/schema` we describe structures as Typescript types or `io-ts` codecs
(and automagically have TS types from them!).

## Create JSON schemas

In `buildSchemas.js` we convert Typescript types to JSON Schemas with
`typescript-json-schema` package. Most types are supported as is. Some types
not supported at all (like `unknown`) but they most likely not appear in API.
Some types are converted, but incorrect. So for those properties you should
write some hints in JSDoc comments. Like for `io-ts` integer you need to create
hint `@TJS-type integer`.

## Create OpenAPI

`OpenAPI` uses JSON Shema but with own dialect. So we need to downgrade JSON Schemas
for `OpenAPI` with `json-schema-to-openapi-schema` package. But that's not enough, the schema is invalid. So we traverse over schema object and make some patches:

- remove `additionalItems` from subschemas
- downgrade tuples to just arrays
- move `definitions` from subschema to `#/components/schemas` and update `$ref`'s

Now we have a valid OpenAPI 3.0 schema.

## Create docs

With the help of `redoc-cli` we can create static `html` with documentation at build
time or just `redoc-cli serve`. Also, we can serve documentation as `react` app
with server-side and client-side rendering.

## Conclusion

So we describe data structure only one and have:

- Typescript Typings for the static analysis
- `io-ts` codecs for validations (native for `marblejs`!)
- JSON Schemas for validation with `ajv`, `fastify`, foreign language interfaces, etc
- OpenAPI 3.0 contract for client generation
- Human readable documentation
