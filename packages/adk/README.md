# @abapify/adk

[![version](https://img.shields.io/github/package-json/v/abapify/adt-cli?filename=packages/adk/package.json)](https://github.com/abapify/adt-cli/pkgs/npm/%40abapify%2Fadk)

ABAP Development Kit — schema-driven construction and serialization of ABAP objects.

## Overview

ADK provides typed representations of ABAP objects (classes, interfaces, packages, etc.) built from ADT XML responses. It handles parsing, construction, and lazy loading of source includes — no HTTP calls inside ADK itself.

Key properties:

- **Schema-first**: types derived from `@abapify/adt-schemas` (XSD-generated)
- **Pure construction**: no network calls, no side effects
- **Lazy source loading**: includes fetched on demand via an injected fetcher
- **Immutable snapshots**: objects represent a point-in-time state

## Installation

```bash
npm install @abapify/adk
```

## Usage

```typescript
import { AdkFactory } from '@abapify/adk';

const factory = new AdkFactory();

// Parse ADT XML response into a typed object
const classObj = factory.fromAdtXml('CLAS/OC', xmlString);

console.log(classObj.kind); // 'CLAS/OC'
console.log(classObj.name); // 'ZCL_MY_CLASS'

// Lazy-load source (requires a fetcher injected via the CLI or client)
const source = await classObj.getSource();
const includes = await classObj.getIncludes();
```

## Architecture

```
adt-schemas  (XSD-derived TypeScript types)
      ↓
adk  (parse ADT XML → domain objects)   ← this package
      ↓
adt-cli  (orchestrate: fetch → parse → serialize)
```

ADK sits between the HTTP layer (`adt-client`) and the serialization layer (`adt-plugin-*`). The CLI passes raw ADT XML to ADK, receives typed objects, and hands them to format plugins.

## Supported Object Types

| ABAP Type | Description    |
| --------- | -------------- |
| `CLAS/OC` | ABAP class     |
| `INTF/OI` | ABAP interface |
| `DEVC/K`  | Package        |

## Bridge Pattern (CLI Integration)

The CLI registers object handlers using ADK adapters:

```typescript
this.handlers.set(
  'CLAS',
  (client) =>
    new AdkObjectHandler(
      client,
      (xml) => ClassAdtAdapter.fromAdtXML(xml),
      (name) => `/sap/bc/adt/oo/classes/${name.toLowerCase()}`,
    ),
);
```

## License

MIT
