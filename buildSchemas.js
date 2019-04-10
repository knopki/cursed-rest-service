const { promisify } = require("util");
const path = require("path");
const fs = require("fs");
const fsp = require("fs").promises;
const TJS = require("typescript-json-schema");
const toOpenApi = require("json-schema-to-openapi-schema");
const traverse = require("json-schema-traverse");
const oasValidator = require("oas-validator");
const YAML = require("yaml");

/**
 * Setup typescript to json schema (draft-07)
 */

// optionally pass argument to schema generator
const settings = {
  /** Create shared ref definitions. */
  refs: true,
  /** Create shared ref definitions for the type aliases. */
  aliasRefs: true,
  /** Create a top-level ref definition. */
  topRef: false,
  /** Creates titles in the output schema. */
  titles: false,
  /** Create default properties definitions. */
  defaultProps: false,
  /** Disable additional properties in objects by default. */
  noExtraProps: false,
  /** Create property order definitions. */
  propOrder: false,
  /** Create required array for non-optional properties. */
  required: true,
  /** Use `typeOf` keyword (https://goo.gl/DC6sni) for functions */
  useTypeOfKeyword: true,
  /** Provide additional validation keywords to include */
  validationKeywords: ["title"],
  /** Further limit tsconfig to include only matching files */
  include: [],
  /** Generate even if the program has errors. */
  ignoreErrors: false,
  /** Exclude private members from the schema */
  excludePrivate: false,
  /** Use unique names for type symbols. */
  uniqueNames: false,
  /** Rejects Date fields in type definitions. */
  rejectDateType: false,
};

// optionally pass ts compiler options
const compilerOptions = {
  /** Make values non-nullable by default. */
  strictNullChecks: true,
};

const typeFiles = fs
  .readdirSync(path.join(__dirname, "src", "schema"))
  .map(name => path.join(__dirname, "src", "schema", name));
const program = TJS.getProgramFromFiles(typeFiles, compilerOptions);
const generator = TJS.buildGenerator(program, settings);

// expory this types
const schemas = [
  "Array",
  "Intersect",
  "Simple",
  "Union",
  "Recursive1",
  "Recursive2",
];

/**
 * Traverse OpenAPI and make fixes
 */
const schemaFixer = (
  schema,
  pointer,
  root,
  parentPointer,
  parentKeyword,
  parentSchema
) => {
  // replace `definitions` with `x-definitions`
  if (schema["additionalItems"]) {
    schema["x-additionalItems"] = schema["additionalItems"];
    delete schema["additionalItems"];
  }

  // fix tuples/triples/etc
  if (
    schema["type"] &&
    schema["type"] === "array" &&
    schema["minItems"] &&
    schema["items"] &&
    (schema["x-additionalItems"] || schema["additionalItems"])
  ) {
    schema["items"] = schema["x-additionalItems"] || schema["additionalItems"];
  }

  // move definitions to #/components/schemas
  if (schema["definitions"]) {
    let defCount = 0;
    Object.keys(schema.definitions).forEach(defName => {
      const newName = `${parentKeyword}_${defCount}`;
      const newRef = `#/components/schemas/${newName}`;
      // const oldRef = `#/definitions/${encodeURIComponent(defName)}`;
      const oldRef = `#/definitions/${defName}`;
      if (!root.components) {
        root.components = { schemas: {} };
      }
      if (!root.components.schemas) {
        root.components.schemas = {};
      }
      root.components.schemas[newName] = schema["definitions"][defName];
      traverse(schema, {
        cb: (sch, ptr) => {
          if (sch["$ref"] && sch["$ref"] === oldRef) {
            sch["$ref"] = sch["$ref"].replace(oldRef, newRef);
          }
        },
      });
      defCount++;
    });
    delete schema.definitions;
  }
};

// convert TS types to json schemas
Promise.all(
  schemas.map(schemaName => {
    const schema = generator.getSchemaForSymbol(schemaName, true);
    return fsp
      .writeFile(
        path.join(__dirname, "src", "json-schema", `${schemaName}.json`),
        JSON.stringify(schema, null, 2)
      )
      .then(() => ({ [schemaName]: toOpenApi(schema) }));
  })
)
  // patch OpenAPI template with json schemas, converted to OpenAPI style
  .then(schemas =>
    fsp
      .readFile(path.join(__dirname, "src", "openapi-template.yaml"), {
        encoding: "utf-8",
      })
      .then(file => YAML.parse(file))
      .then(template => ({
        ...template,
        components: {
          schemas: {
            ...schemas.reduce((p, c) => Object.assign(p, toOpenApi(c)), {}),
          },
        },
      }))
  )
  // fix OpenAPI schemas and save to files
  .then(schema => {
    // unpure patching
    traverse(schema, { allKeys: true, cb: schemaFixer });
    return (
      fsp
        .writeFile(
          path.join(__dirname, "src", "openapi.yaml"),
          YAML.stringify(JSON.parse(JSON.stringify(schema)))
        )
        .then(() =>
          fsp.writeFile(
            path.join(__dirname, "src", "openapi.json"),
            JSON.stringify(schema, null, 2)
          )
        )
        // validate schema or die
        .then(() =>
          oasValidator.validate(schema, {}, err => {
            if (err) {
              console.error(`${err.message}\n${err.details}`);
              process.exit(1);
            }
          })
        )
    );
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
