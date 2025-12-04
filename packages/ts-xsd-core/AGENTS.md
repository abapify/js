# ts-xsd-core - AI Agent Guide

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
- Reference: `src/xsd/XMLSchema.xsd`
- Online: https://www.w3.org/TR/xmlschema11-1/XMLSchema.xsd

### 2. Type Naming Convention

Follow W3C XSD type names exactly:
- `topLevelElement` → `TopLevelElement`
- `localElement` → `LocalElement`
- `namedGroup` → `NamedGroup`
- `explicitGroup` → `ExplicitGroup`

### 3. Self-Hosting Requirement

`XSD_SCHEMA` in `schema.ts` must:
1. Be typed as `Schema`
2. Follow W3C structure exactly
3. Describe the XSD format itself

### 4. Verification Process

Before any change to `types.ts`:
1. Find the corresponding type in `XMLSchema.xsd`
2. Match properties exactly (name, type, optionality)
3. Verify `XSD_SCHEMA` still compiles with `Schema` type

## File Structure

```
src/xsd/
├── types.ts        # TypeScript interfaces (W3C 1:1)
├── schema.ts       # XSD_SCHEMA: Schema (self-describing)
├── XMLSchema.xsd   # Reference file (DO NOT MODIFY)
└── index.ts        # Exports
```

## Common Mistakes to Avoid

1. **Inventing properties** - If it's not in XMLSchema.xsd, don't add it
2. **Renaming properties** - `attribute` not `attributes`, `element` not `elements`
3. **Simplifying structures** - Keep nested structure as in XSD
4. **Mixing formats** - Don't add ts-xsd-v1 conveniences

## How to Add a New Type

1. Find the type definition in `XMLSchema.xsd`
2. Create TypeScript interface with exact same structure
3. Use existing types for nested elements
4. Add to exports in `index.ts`
5. Verify with `npx tsc --noEmit`

## Reference Mapping

| XSD | TypeScript |
|-----|------------|
| `xs:complexType` | `interface` |
| `xs:sequence` | `ExplicitGroup` with `element?: LocalElement[]` |
| `xs:attribute` | Property in interface |
| `xs:extension base="X"` | `extends X` |
| `minOccurs="0"` | Optional property (`?`) |
| `maxOccurs="unbounded"` | Array type (`[]`) |
