# TS to XML transformation scenario with JOTL + fast-xml-parser

## Overview
This test scenario demonstrates transforming TypeScript/JSON data to XML using:
1. **JOTL** (JavaScript Object Transformation Language) - for declarative data transformation
2. **fast-xml-parser** - for XML building and parsing

## Test Scenario

### Files
- `fixtures/abapgit_examples.devc.json` - Source JSON data (ABAP package metadata)
- `fixtures/abapgit_examples.devc.xml` - Expected XML output
- `fixtures/abapgit_examples.devc.ts` - TypeScript version of the source data
- `abap-package-transformation.test.mjs` - **Native Node.js test** (recommended - no dependencies!)
- `abap-package-transformation.test.ts` - Vitest test (alternative)

### Process
1. Import `abapgit_examples.devc.json` as source data
2. Define a JOTL schema that maps JSON structure to fast-xml-parser format
3. Transform the JSON data using `jotl.transform(source, schema)`
4. Build XML using `fast-xml-parser.XMLBuilder`
5. Parse both expected and generated XML
6. Compare structures for equality

## Running the Tests

### Native Node.js Test (Recommended - No extra dependencies!)

```bash
# Build the package first
npx tsdown

# Compile the test to JavaScript
npx tsc tests/fast-xml-parser/abap-package-transformation.test.ts --outDir tests/fast-xml-parser --module nodenext --moduleResolution nodenext --target es2022

# Run with native Node.js test runner
node --test tests/fast-xml-parser/abap-package-transformation.test.js
```

Or use the jotl-codex package which has the same test already set up.

### Vitest (Alternative - if already using vitest)

```bash
# From the monorepo root
cd packages/jotl
npx vitest run tests/fast-xml-parser/abap-package-transformation.test.ts

# Or run all jotl tests
npx vitest run
```

## Current Status

✅ Test infrastructure is set up and working
✅ JOTL transformation executes successfully
✅ XML is generated correctly
✅ Boolean attribute issue **FIXED** - test now passes!

### Issue (RESOLVED ✅)

**Root Cause:** fast-xml-parser was rendering boolean `true` as HTML-style attribute (without value), but SAP ADT XML requires explicit string values.

Example of the problem:
- fast-xml-parser generated: `<element isVisible />`
- SAP ADT expects: `<element isVisible="true" />`

**Solution Applied:** Configure XMLBuilder with `attributeValueProcessor` to convert all values to strings:

```javascript
const builder = new XMLBuilder({
  attributeNamePrefix: '@_',
  ignoreAttributes: false,
  format: true,
  indentBy: '        ',
  suppressEmptyNode: true,
  suppressBooleanAttributes: false,
  attributeValueProcessor: (name, value) => String(value), // ← This fixes it!
});
```

This ensures:
- `true` → `"true"`
- `false` → `"false"`
- `42` → `"42"`
- All attribute values are properly stringified for XML