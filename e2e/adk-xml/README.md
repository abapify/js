# ADK XML E2E Tests

End-to-end tests for SAP ADT XML generation using the xmld library.

## Overview

This project demonstrates real SAP ADT XML generation using:

- **xmld library** - Modern XML decorators with explicit auto-instantiation
- **Real SAP fixtures** - Based on actual `zif_test.intf.xml` from ADK package
- **SAP XML Plugin** - Uses fast-xml-parser for real XML generation
- **Generated Output Tracking** - Committed generated files for change tracking

## Features

- ✅ **Real SAP XML Structure** - Matches actual SAP ADT interface XML format
- ✅ **Explicit Auto-Instantiation** - Uses `@element({ type: SomeClass })` for predictable behavior
- ✅ **Namespace Support** - Proper SAP namespaces (adtcore, abapoo, abapsource, atom)
- ✅ **Type Safety** - Full TypeScript support with interfaces
- ✅ **Plugin Architecture** - Extensible XML generation
- ✅ **Fixture-Based Testing** - Uses real SAP XML fixtures
- ✅ **Generated Output Tracking** - Committed generated XML for change detection

## Project Structure

```
├── src/
│   ├── models/
│   │   └── interface.ts     # SAP Interface XML model with @unwrap decorators
│   └── plugins/
│       └── sap-xml.ts       # SAP XML generation plugin
├── tests/
│   └── interface.test.ts    # E2E tests for XML generation
├── fixtures/
│   └── zif_test.intf.xml    # Real SAP ADT XML fixture
└── generated/
    ├── README.md                        # Documentation for generated files
    ├── interface-generated.xml          # Generated XML output (tracked in git)
    └── interface-original-fixture.xml   # Copy of fixture for comparison
```

## Usage

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Tests will automatically:
# 1. Generate XML from xmld models
# 2. Save output to generated/ folder
# 3. Copy fixtures for easy comparison
# 4. Validate XML structure
```

## Generated Output Tracking

The `generated/` folder contains XML output that is committed to git. This allows us to:

- **Track changes** in XML output when code is modified
- **Review impact** of xmld library changes
- **Compare easily** between expected and actual XML
- **Debug issues** by examining generated vs fixture XML

## Key Components

### InterfaceDocument

Main SAP interface model using `@unwrap` decorators:

- **ADT Core attributes** - Grouped with `@unwrap @attribute core`
- **ABAP OO attributes** - Grouped with `@unwrap @attribute oo`
- **ABAP Source attributes** - Grouped with `@unwrap @attribute source`
- **Atom links** - Array with `@unwrap @attribute attributes`
- **Package references** - With `@unwrap @attribute attributes`
- **Syntax configuration** - Nested with `@unwrap @element elements`

### SAPXMLPlugin

XML generation plugin using fast-xml-parser:

- Proper namespace handling
- Attribute prefixing
- XML declaration
- Formatting support

### Fixture-Based Testing

- **Real SAP XML** - Uses actual `zif_test.intf.xml` from ADK
- **Generated Comparison** - Saves both generated and fixture XML
- **Change Tracking** - Generated files committed to detect changes

## Goals

1. **Validate xmld works with real XML libraries**
2. **Generate production-ready SAP ADT XML**
3. **Demonstrate complete workflows**
4. **Test complex nested structures**
5. **Verify namespace handling**
