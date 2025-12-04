# ts-xsd-core - AI Agent Guide

## Package Purpose

Core XSD parser and builder providing:
- **`parseXsd()`** - Parse XSD XML strings into typed `Schema` objects
- **`buildXsd()`** - Build XSD XML strings from typed `Schema` objects
- **Types** - 1:1 TypeScript representation of W3C XMLSchema.xsd

This is the foundation layer for `ts-xsd` (codegen) and `adt-schemas-xsd` (SAP ADT).

## Project Goal

Create a **1:1 TypeScript representation** of the W3C XMLSchema.xsd:
https://www.w3.org/TR/xmlschema11-1/XMLSchema.xsd

## Critical Rules

### 1. Pure W3C XSD - No Inventions

**NEVER** add properties that don't exist in XMLSchema.xsd:
- ❌ `attributes` (use `attribute` - the W3C name)
- ❌ `text` (not in XSD spec)
- ❌ Direct arrays for `sequence` (must be `ExplicitGroup`)
- ❌ Any "convenience" shortcuts

**ALWAYS** check XMLSchema.xsd before adding/modifying types:
- Online: https://www.w3.org/TR/xmlschema11-1/XMLSchema.xsd

### 2. Type Naming Convention

Follow W3C XSD type names exactly:
- `topLevelElement` → `TopLevelElement`
- `localElement` → `LocalElement`
- `namedGroup` → `NamedGroup`
- `explicitGroup` → `ExplicitGroup`

### 3. No devDependencies or scripts

Package follows monorepo conventions:
- ❌ No `devDependencies` in package.json
- ❌ No `scripts` in package.json
- ✅ Use `project.json` for Nx targets
- ✅ Build target inferred by nx-tsdown plugin

### 4. Verification Process

Before any change to `types.ts`:
1. Find the corresponding type in XMLSchema.xsd
2. Match properties exactly (name, type, optionality)
3. Run `npx nx test ts-xsd-core` to verify

## File Structure

```
src/xsd/
├── types.ts    # TypeScript interfaces (W3C 1:1 mapping)
├── parse.ts    # XSD XML → Schema parser (uses @xmldom/xmldom)
├── build.ts    # Schema → XSD XML builder
└── index.ts    # Public exports

tests/
├── unit/
│   ├── parse.test.ts         # Parser unit tests
│   ├── parse-coverage.test.ts # Additional coverage tests
│   └── build.test.ts         # Builder unit tests
├── integration/
│   ├── roundtrip.test.ts     # Parse → Build → Parse roundtrip
│   └── w3c-roundtrip.test.ts # W3C XMLSchema.xsd roundtrip
└── fixtures/
    ├── index.ts              # getW3CSchema() - downloads and caches
    └── cache/                # Downloaded W3C schema (gitignored)
```

## Nx Targets

```bash
npx nx build ts-xsd-core      # Build (inferred by nx-tsdown)
npx nx test ts-xsd-core       # Run tests
npx nx test:coverage ts-xsd-core  # Run with coverage report
```

## Common Mistakes to Avoid

1. **Inventing properties** - If it's not in XMLSchema.xsd, don't add it
2. **Renaming properties** - `attribute` not `attributes`, `element` not `elements`
3. **Simplifying structures** - Keep nested structure as in XSD
4. **Adding devDependencies** - Use root workspace dependencies
5. **Adding scripts** - Use project.json targets

## Dependencies

- `@xmldom/xmldom` - DOM parser for XSD parsing

## Reference Mapping

| XSD | TypeScript |
|-----|------------|
| `xs:complexType` | `interface` |
| `xs:sequence` | `ExplicitGroup` with `element?: LocalElement[]` |
| `xs:attribute` | Property in interface |
| `xs:extension base="X"` | `extends X` |
| `minOccurs="0"` | Optional property (`?`) |
| `maxOccurs="unbounded"` | Array type (`[]`) |

## Reference

- [W3C XML Schema 1.1](https://www.w3.org/TR/xmlschema11-1/)
- [XMLSchema.xsd](https://www.w3.org/TR/xmlschema11-1/XMLSchema.xsd)
