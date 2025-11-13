# RFC: JOTL - JavaScript Object Transformation Language

**Status:** Draft
**Author:** JOTL Working Group
**Created:** 2025-11-13
**Updated:** 2025-11-13

---

## 1. Abstract

JOTL (JavaScript Object Transformation Language) is a declarative, type-safe specification for transforming JSON and JavaScript objects. It provides a lightweight, composable alternative to existing transformation tools like JSONata and XSLT, with native TypeScript integration and a serializable schema format.

**Key Features:**
- Declarative transformation schemas as plain JavaScript objects
- Type-safe proxy-based authoring model
- Serializable AST (~2KB runtime)
- Full TypeScript type inference
- Composable and extensible

---

## 2. Motivation

### Current Landscape

**JSONata**
- ✅ Powerful query and transformation language
- ❌ String-based DSL requires parsing (~60KB runtime)
- ❌ No native TypeScript support
- ❌ Steep learning curve for new syntax

**XSLT**
- ✅ Mature transformation standard
- ❌ XML-only (not JSON/JS native)
- ❌ Heavy runtime and complex syntax
- ❌ Poor JavaScript ecosystem integration

**Ad-hoc Code**
- ✅ Flexible and familiar
- ❌ Non-declarative, hard to serialize
- ❌ Difficult to compose and reuse
- ❌ No standard format or tooling

### The Problem

Modern applications require frequent JSON-to-JSON transformations:
- REST API adapters
- GraphQL resolvers
- ETL pipelines
- Data normalization
- Configuration mapping

Current solutions are either too heavy (XSLT, JSONata), too rigid (JSON Schema), or non-standard (custom code). **There is no lightweight, type-safe, declarative standard for object transformations in JavaScript.**

### Solution: JOTL

JOTL introduces a declarative transformation model that:
1. Is **JS-native** (no parser needed)
2. Is **type-safe** (TypeScript inference)
3. Has a **serializable AST** (can be stored/transmitted)
4. Is **lightweight** (~2KB runtime)
5. Is **composable** (functions + objects)

---

## 3. Goals

✅ **Type Safety** - Full TypeScript support with inference
✅ **Declarative** - Transformations as data, not code
✅ **Serializable** - Schemas can be JSON-stringified
✅ **Lightweight** - Minimal runtime (<2KB gzipped)
✅ **Composable** - Mix declarative + functional styles
✅ **Human-Readable** - Natural JavaScript syntax

---

## 4. Non-Goals

❌ **Not a query language** - Use JSONata/jq for complex queries
❌ **Not XML-based** - No XPath, XSLT, or DOM concepts
❌ **Not a template engine** - No HTML/text rendering
❌ **Not a validation tool** - Use JSON Schema/Zod for validation

---

## 5. Core Concepts

### 5.1 Schema Nodes

Every node in a JOTL schema is an object that can contain:

| Directive  | Type                              | Description                                      |
|-----------|-----------------------------------|--------------------------------------------------|
| `$ref`    | `string`                          | Path to source data (dot notation)               |
| `$schema` | `SchemaNode`                      | Nested transformation for referenced value       |
| `$const`  | `any`                             | Literal constant value                           |
| `$value`  | `(source, ctx) => any`            | Computed function                                |
| `$if`     | `(source, ctx) => boolean`        | Conditional inclusion predicate                  |
| `$as`     | `string`                          | Variable name for context storage                |
| `$type`   | `string`                          | Optional type annotation (for validation)        |
| `$default`| `any`                             | Default value if source is undefined/null        |
| `$merge`  | `'shallow' \| 'deep'`             | Object merge strategy                            |

### 5.2 Example Schema

```typescript
const schema = {
  // Simple field mapping
  totalAmount: { $ref: "invoice.total" },

  // Constant value
  currency: { $const: "USD" },

  // Computed value
  tax: {
    $value: (source) => source.invoice.total * 0.1
  },

  // Conditional field
  discount: {
    $ref: "invoice.discount",
    $if: (source) => source.invoice.total > 1000
  },

  // Array mapping with nested schema
  items: {
    $ref: "invoice.lines",
    $schema: {
      id: { $ref: "item.id" },
      quantity: { $ref: "item.qty" },
      subtotal: {
        $value: (item) => item.price * item.qty
      }
    }
  }
};
```

---

## 6. Proxy Authoring Model

### 6.1 Concept

Instead of manually writing `$ref` paths, JOTL provides a **proxy-based authoring model** that records property access:

```typescript
import { makeSchemaProxy, transform } from 'jotl';

interface Invoice {
  total: number;
  lines: Array<{ id: string; qty: number; price: number }>;
}

// Create a proxy that records access
const src = makeSchemaProxy<Invoice>("invoice");

// Author schema using natural property access
const schema = {
  totalAmount: src.total,  // Records as { $ref: "invoice.total" }
  items: src.lines(item => ({
    id: item.id,
    quantity: item.qty,
    subtotal: {
      $value: (lineItem) => lineItem.price * lineItem.qty
    }
  }))
};

// Execute transformation
const result = transform(invoiceData, schema);
```

### 6.2 How It Works

1. `makeSchemaProxy<T>(root)` creates a Proxy handler
2. Every property access (`.total`, `.lines`) extends the path
3. Function calls indicate array mapping: `src.lines(mapper)`
4. The proxy returns a schema node: `{ $ref: "invoice.total" }`

**Internal Representation:**

```typescript
// What you write:
src.user.profile.name

// What gets generated:
{ $ref: "invoice.user.profile.name" }
```

### 6.3 Array Mapping

Function calls on proxies define array transformations:

```typescript
src.lines(item => ({
  id: item.id,
  qty: item.qty
}))

// Generates:
{
  $ref: "invoice.lines",
  $schema: {
    id: { $ref: "item.id" },
    qty: { $ref: "item.qty" }
  }
}
```

---

## 7. Transformation Semantics

### 7.1 Algorithm

The `transform(source, schema)` function:

1. **Initialize context** with root source object
2. **Evaluate schema recursively**:
   - If primitive → return as-is
   - If array → map over elements
   - If object → check for directives
3. **Process directives** in order:
   - `$if` → exclude if false
   - `$const` → return literal
   - `$value` → call function
   - `$ref` → resolve path
   - `$schema` → apply nested transformation
4. **Build result object** from evaluated nodes

### 7.2 Pseudocode

```typescript
function transform(source, schema, options) {
  const context = { root: source, current: source, variables: {} };
  return evaluateNode(schema, context, options);
}

function evaluateNode(node, context, options) {
  if (isPrimitive(node)) return node;
  if (isArray(node)) return node.map(item => evaluateNode(item, context, options));

  // Check directives
  if (node.$if && !node.$if(context.current, context)) return undefined;
  if (node.$const !== undefined) return node.$const;
  if (node.$value) return node.$value(context.current, context);

  if (node.$ref) {
    const value = resolveRef(node.$ref, context, options);

    if (node.$schema) {
      if (Array.isArray(value)) {
        return value.map(item => {
          const itemContext = { ...context, current: item };
          return evaluateNode(node.$schema, itemContext, options);
        });
      } else {
        const nestedContext = { ...context, current: value };
        return evaluateNode(node.$schema, nestedContext, options);
      }
    }

    return value ?? node.$default;
  }

  // Plain object - evaluate all properties
  const result = {};
  for (const [key, value] of Object.entries(node)) {
    if (!key.startsWith('$')) {
      const evaluated = evaluateNode(value, context, options);
      if (evaluated !== undefined) result[key] = evaluated;
    }
  }
  return result;
}
```

### 7.3 Example Transformations

#### Simple Field Rename

```typescript
// Source
{ firstName: "John", lastName: "Doe" }

// Schema
{ fullName: { $ref: "firstName" }, surname: { $ref: "lastName" } }

// Result
{ fullName: "John", surname: "Doe" }
```

#### Nested Mapping

```typescript
// Source
{ user: { profile: { name: "John", age: 30 } } }

// Schema
const src = makeSchemaProxy("data");
{ userName: src.user.profile.name, userAge: src.user.profile.age }

// Result
{ userName: "John", userAge: 30 }
```

#### Conditional Inclusion

```typescript
// Source
{ total: 1500, discount: 100 }

// Schema
{
  total: { $ref: "total" },
  discount: {
    $ref: "discount",
    $if: (source) => source.total > 1000
  }
}

// Result
{ total: 1500, discount: 100 }
```

#### Array Flattening

```typescript
// Source
{ orders: [{ items: ["A", "B"] }, { items: ["C"] }] }

// Schema
{
  allItems: {
    $value: (source) => source.orders.flatMap(o => o.items)
  }
}

// Result
{ allItems: ["A", "B", "C"] }
```

---

## 8. Type System Integration

### 8.1 Generic Transform Signature

```typescript
function transform<TSource, TTarget>(
  source: TSource,
  schema: SchemaNode<TSource, TTarget>,
  options?: TransformOptions
): TTarget;
```

### 8.2 Proxy Type Safety

```typescript
interface Invoice {
  total: number;
  lines: Array<{ id: string; qty: number }>;
}

const src = makeSchemaProxy<Invoice>("invoice");

// TypeScript knows src.total is a number proxy
// TypeScript knows src.lines is an array proxy with item type { id: string; qty: number }

const schema = {
  totalAmount: src.total,  // ✅ Valid
  items: src.lines(item => ({
    id: item.id,           // ✅ Valid
    quantity: item.qty     // ✅ Valid
  }))
};

// ❌ TypeScript error: Property 'invalid' does not exist
const badSchema = { invalid: src.invalid };
```

### 8.3 Compile-Time Validation

```typescript
// Define source and target types
interface Source {
  firstName: string;
  lastName: string;
}

interface Target {
  fullName: string;
}

const src = makeSchemaProxy<Source>("user");

// ✅ Correct schema
const schema: SchemaNode<Source, Target> = {
  fullName: {
    $value: (source: Source) => `${source.firstName} ${source.lastName}`
  }
};

// ❌ Type error: missing 'fullName' property
const badSchema: SchemaNode<Source, Target> = {
  name: src.firstName  // Wrong key name
};
```

---

## 9. Serialization Model

### 9.1 Schemas are Pure Data

JOTL schemas (without `$value` functions) are plain objects that can be:
- JSON-stringified and stored
- Transmitted over network
- Versioned and diffed
- Cached and reused

```typescript
const schema = {
  totalAmount: { $ref: "invoice.total" },
  items: {
    $ref: "invoice.lines",
    $schema: {
      id: { $ref: "item.id" },
      qty: { $ref: "item.qty" }
    }
  }
};

// Serialize
const json = JSON.stringify(schema);

// Deserialize and use
const loadedSchema = JSON.parse(json);
const result = transform(data, loadedSchema);
```

### 9.2 Function Serialization

For schemas with `$value` functions, you can:
1. **Serialize as code strings** (eval or Function constructor)
2. **Use a function registry** (serialize function names, not code)
3. **Compile to executable functions** (AOT compilation)

```typescript
// Example: Function registry approach
const functionRegistry = {
  calculateTax: (source) => source.total * 0.1,
  calculateDiscount: (source) => source.total > 1000 ? 100 : 0
};

const schema = {
  tax: { $value: "calculateTax" },  // Reference by name
  discount: { $value: "calculateDiscount" }
};

// Transform with resolver
const result = transform(data, schema, {
  resolver: (ref, ctx) => {
    if (schema[ref].$value && typeof schema[ref].$value === 'string') {
      return functionRegistry[schema[ref].$value](ctx.current);
    }
    return resolveRef(ref, ctx);
  }
});
```

---

## 10. Comparison Table

| Feature                | JOTL       | JSONata    | XSLT         | Lodash       |
|------------------------|------------|------------|--------------|--------------|
| Syntax                 | JS-native  | String DSL | XML          | JS code      |
| Typed                  | ✅          | ❌          | Partial      | ❌            |
| Serializable           | ✅          | ✅          | ✅            | ❌            |
| Runtime Size           | ~2 KB      | ~60 KB     | Heavy        | ~70 KB       |
| Works on Objects       | ✅          | ✅          | ❌ (XML only) | ✅            |
| Declarative            | ✅          | ✅          | ✅            | ❌            |
| TypeScript Inference   | ✅          | ❌          | ❌            | Partial      |
| Learning Curve         | Low        | Medium     | High         | Low          |
| Composable             | ✅          | Partial    | ❌            | ✅            |

---

## 11. Reference Implementation

### 11.1 Minimal Core (~500 lines)

```typescript
// Core modules
export { makeSchemaProxy } from './proxy.js';      // ~150 lines
export { transform } from './transform.js';        // ~200 lines
export type { SchemaNode, SchemaDirectives } from './types.js';  // ~150 lines
```

### 11.2 Package Structure

```
jotl/
├── src/
│   ├── index.ts          # Public API
│   ├── types.ts          # Type definitions
│   ├── proxy.ts          # Proxy factory
│   ├── transform.ts      # Transform engine
│   └── utils.ts          # Helper functions
├── tests/
│   ├── proxy.test.ts
│   ├── transform.test.ts
│   └── examples.test.ts
├── package.json
├── tsconfig.json
└── RFC.md                # This document
```

### 11.3 Potential Extensions

**Streaming Mode:**
```typescript
transformStream(sourceStream, schema, outputStream);
```

**Compiled Mode:**
```typescript
const fn = compile(schema);  // schema → optimized JS function
fn(source);  // Direct execution (no AST traversal)
```

**Validation Layer:**
```typescript
const schema = {
  totalAmount: { $ref: "invoice.total", $type: "number" }
};
transform(data, schema, { validate: true });  // Throws on type mismatch
```

**Bidirectional Transforms:**
```typescript
const forward = { target: { $ref: "source.value" } };
const reverse = invert(forward);  // { source: { value: { $ref: "target" } } }
```

---

## 12. Example Transformations

### 12.1 REST API Adapter

```typescript
interface APIResponse {
  data: {
    user_id: string;
    user_name: string;
    created_at: string;
  };
}

interface AppUser {
  id: string;
  name: string;
  createdAt: Date;
}

const src = makeSchemaProxy<APIResponse>("response");

const schema: SchemaNode<APIResponse, AppUser> = {
  id: src.data.user_id,
  name: src.data.user_name,
  createdAt: {
    $ref: "response.data.created_at",
    $value: (_, ctx) => new Date(ctx.current)
  }
};

const appUser = transform(apiResponse, schema);
```

### 12.2 GraphQL Resolver

```typescript
const schema = {
  user: {
    $ref: "data.user",
    $schema: {
      id: { $ref: "user.id" },
      fullName: {
        $value: (user) => `${user.firstName} ${user.lastName}`
      },
      posts: {
        $ref: "user.posts",
        $schema: {
          id: { $ref: "post.id" },
          title: { $ref: "post.title" },
          publishedAt: { $ref: "post.published_at" }
        }
      }
    }
  }
};
```

### 12.3 abapGit Transport Transform

```typescript
interface Transport {
  trkorr: string;
  as4user: string;
  objects: Array<{
    obj_name: string;
    object: string;
  }>;
}

const src = makeSchemaProxy<Transport>("transport");

const schema = {
  transportId: src.trkorr,
  owner: src.as4user,
  objects: src.objects(obj => ({
    name: obj.obj_name,
    type: obj.object
  }))
};
```

---

## 13. Future Extensions

### 13.1 Additional Directives

**`$merge`** - Object merging:
```typescript
{
  $merge: [
    { $ref: "defaults" },
    { $ref: "overrides" }
  ]
}
```

**`$when`** - Multi-case conditionals:
```typescript
{
  status: {
    $when: [
      { $if: (s) => s.value > 100, $const: "high" },
      { $if: (s) => s.value > 50, $const: "medium" },
      { $default: "low" }
    ]
  }
}
```

**`$namespace`** - Scoped variables:
```typescript
{
  $namespace: "invoice",
  total: { $ref: "invoice.total" }
}
```

### 13.2 Integration with JSON Schema

```typescript
const schema = {
  totalAmount: {
    $ref: "invoice.total",
    $type: "number",
    $validate: { minimum: 0, maximum: 1000000 }
  }
};

transform(data, schema, { validate: true });
```

### 13.3 TC39 Proposal: Reflective Paths

Potential future JavaScript feature:
```typescript
// Native reflective path recording
const path = Reflect.getPath(() => obj.user.profile.name);
// Returns: ["user", "profile", "name"]
```

This would make proxy-based path recording a native JS feature.

---

## 14. Security Considerations

### 14.1 Function Execution

`$value` functions execute arbitrary code and must be treated as **untrusted** in certain contexts:

- ✅ **Safe**: Local transformations with known schemas
- ❌ **Unsafe**: User-provided schemas from external sources

**Mitigation:**
1. **Sandbox execution** (VM2, isolated-vm)
2. **Function allowlist** (only permit registered functions)
3. **Static schemas only** (no `$value` in production)

### 14.2 Path Traversal

`$ref` paths could potentially access unintended data:

```typescript
// Malicious schema
{ secret: { $ref: "process.env.SECRET_KEY" } }
```

**Mitigation:**
1. **Whitelist allowed paths**
2. **Scoped context** (only allow access to explicit data)
3. **Strict mode** (throw on missing paths)

---

## 15. Reference Implementations / Status

**Current Status:** Experimental / Draft

**Implementations:**
- **jotl** (this package) - TypeScript reference implementation
- **@abapify/jotl** - Monorepo version for ABAP tooling integration

**Community Feedback:**
- RFC open for comments via GitHub Issues
- Early adopters encouraged to test and provide feedback

**Next Steps:**
1. Publish to npm as `jotl` (v0.1.0)
2. Create online REPL / playground
3. Gather community feedback
4. Iterate on specification
5. Potential standardization path (TC39 proposal)

---

## 16. Conclusion

JOTL provides a **lightweight, type-safe, declarative transformation language** for JSON and JavaScript objects. By combining:

- **Proxy-based authoring** (natural JS syntax)
- **Serializable schemas** (AST as data)
- **TypeScript integration** (full type inference)
- **Minimal runtime** (<2KB)

...JOTL fills a critical gap in the JavaScript ecosystem between heavy transformation tools (JSONata, XSLT) and ad-hoc code (lodash, manual mapping).

**Core Innovation:** The proxy authoring model makes declarative transformations feel like native JavaScript while maintaining serializability and type safety.

---

## Appendix A: Grammar (Informal)

```typescript
SchemaNode =
  | Primitive                          // string | number | boolean | null
  | Array<SchemaNode>                  // [SchemaNode, ...]
  | Object<string, SchemaNode>         // { key: SchemaNode }
  | Directives                         // { $ref, $schema, $const, $value, ... }

Directives =
  | { $ref: string }
  | { $ref: string, $schema: SchemaNode }
  | { $const: any }
  | { $value: (source, ctx) => any }
  | { $if: (source, ctx) => boolean, ...Directives }
  | { $as: string, ...Directives }
  | { $default: any, ...Directives }
```

---

## Appendix B: Open Questions

1. **Namespace collisions** - How to handle `$ref` vs plain property `$ref`?
   - Current: All keys starting with `$` are reserved
   - Alternative: Explicit `$$ref` for literal `$ref` property

2. **Circular references** - How to handle recursive schemas?
   - Current: No built-in support
   - Future: `$cycle` directive or cycle detection

3. **Performance optimization** - When to compile vs interpret?
   - Current: Always interpret
   - Future: Heuristic-based compilation for hot paths

4. **Error handling** - How detailed should error messages be?
   - Current: Basic path tracking
   - Future: Full stack trace with schema context

---

## References

- [JSONata Documentation](https://jsonata.org/)
- [XSLT Specification](https://www.w3.org/TR/xslt/)
- [JSON Schema](https://json-schema.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TC39 Proposals](https://github.com/tc39/proposals)

---

**License:** MIT
**Repository:** https://github.com/abapify/jotl
**Discussion:** https://github.com/abapify/jotl/discussions
