# @abapify/adt-sdk

SAP ADT SDK reference materials for the abapify project. Uses `@abapify/p2-cli` to download, extract, and decompile.

## ⚠️ IMPORTANT: License Compliance

This module downloads and processes SAP proprietary content. **All downloaded and decompiled content is gitignored and must NEVER be committed or distributed.**

See [AGENTS.md](./AGENTS.md) for detailed compliance guidelines.

### Legal Basis: EU Directive 2009/24/EC Article 6

Decompilation is permitted when ALL conditions are met:

1. **Lawful user** - We have legitimate access to SAP systems
2. **Interoperability purpose** - Building compatible CLI tools (not cloning SAP products)
3. **Necessary scope** - Only decompile what's needed for protocols/APIs
4. **No code copying** - Write entirely new implementations
5. **Private use** - Decompiled code never published or shared

### Clean-Room Approach

We follow clean-room reverse engineering to maximize legal safety:

1. **Analyze**: Read decompiled code to understand behavior
2. **Document**: Write protocol specs in human language (no code copying)
3. **Implement**: Write fresh TypeScript from specs only

⚠️ **AI Usage Warning**: Never paste decompiled Java code into AI prompts. Instead, write human-language descriptions of protocols and let AI generate fresh implementations.

## Purpose

This package provides reference materials for understanding SAP ADT REST APIs:
- XSD schemas for API request/response structures
- Decompiled Java source for implementation details
- EMF models for data structure definitions

## Quick Start

```bash
# Download and extract SAP ADT SDK
npx nx download adt-sdk

# Decompile Java classes (optional, for deeper understanding)
npx nx decompile adt-sdk
```

## Key Schemas

After extraction, these schemas are particularly useful for `adt-client-v2`:

### Transport Management
- `transportmanagment.xsd` - Transport requests, tasks, objects
- `transportsearch.xsd` - Transport search results
- `transport-properties.xsd` - Transport properties

### Core ADT
- `adtcore.xsd` - Core ADT types
- `atom.xsd` - Atom feed format
- `discovery.xsd` - Discovery service

### Repository
- `classes.xsd` - ABAP classes
- `programs.xsd` - ABAP programs
- `includes.xsd` - ABAP includes

### ATC (ABAP Test Cockpit)
- `atc.xsd` - ATC checks
- `atcresult.xsd` - ATC results
- `atcworklist.xsd` - ATC worklist

## Integration with adt-client-v2

The extracted schemas inform the TypeScript schemas in `adt-client-v2`:

```typescript
// From transportmanagment.xsd → TypeScript schema
export const TransportRequestSchema = createSchema({
  tag: 'tm:request',
  ns: {
    tm: 'http://www.sap.com/cts/adt/tm',
    atom: 'http://www.w3.org/2005/Atom',
  },
  fields: {
    number: { kind: 'attr', name: 'tm:number', type: 'string' },
    owner: { kind: 'attr', name: 'tm:owner', type: 'string' },
    desc: { kind: 'attr', name: 'tm:desc', type: 'string' },
    status: { kind: 'attr', name: 'tm:status', type: 'string' },
    // ... derived from XSD
  },
} as const);
```

## Directory Structure

```
e2e/adt-sdk/
├── AGENTS.md               # AI agent instructions (committed)
├── README.md               # This file (committed)
├── project.json            # Nx targets (committed)
├── package.json            # Dependencies (committed)
├── .gitignore              # Excludes .cache/ and dist/
├── .cache/                 # Downloaded JARs (NOT committed)
│   ├── artifacts.jar
│   ├── content.jar
│   └── plugins/            # SAP plugin JARs
└── dist/                   # Extracted + decompiled (NOT committed)
    └── com/sap/adt/        # Schemas, Java source, EMF models
```

## Available Artifacts in `dist/`

| Type | Pattern | Purpose |
|------|---------|---------|
| XSD Schemas | `**/*.xsd` | REST API XML structure definitions |
| Java Source | `**/*.java` | Decompiled implementation reference |
| EMF Models | `**/*.ecore` | Eclipse Modeling Framework definitions |
| GenModels | `**/*.genmodel` | EMF code generation models |
| Plugin XML | `**/plugin.xml` | Eclipse extension point definitions |

## License

The SAP ADT SDK content is subject to the [SAP Developer License Agreement](https://tools.hana.ondemand.com/developer-license-3_2.txt).

**This module does NOT distribute SAP code** - all downloaded/decompiled content is gitignored and used only for local interoperability research.
