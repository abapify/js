# ABAP Development Kit (ADK)

TypeScript toolkit for modeling ABAP objects and producing/consuming SAP ADT-compliant XML.

Built on the minimal, decorator-based XML engine `xmld`, with optional `fast-xml-parser` integration for final XML output.

## Why ADK

- **Type-safe modeling**: Define interfaces, classes, domains and more with rich types and namespaces.
- **ADT XML compliance**: Generates XML aligned with SAP ADT (namespaces like `adtcore`, `abapsource`, `abapoo`, `atom`).
- **Client-agnostic**: Works with any ADT client; emit XML via `toAdtXml()` and parse back with `fromAdtXml()`.
- **Extensible**: Add new object types and namespaces without changing the core.
- **Modern Node**: ESNext patterns, extensionless imports, small footprint.

Alternatives:

- Manual XML crafting for each object type
- Ad-hoc REST wrappers per endpoint
- Using IDE tools only (no programmatic modeling)

Use ADK when you want programmatic, type-safe object modeling with reliable ADT XML in build tools, CLIs, or automation.

## Quick Start

Install (replace with the final package name on npm once published):

```bash
npm install @abapify/adk
```

Create an Interface and emit ADT XML:

```ts
import { Interface } from '@abapify/adk';

const intf = new Interface({
  adtcore: {
    name: 'ZIF_HELLO',
    type: 'INTF/OI',
    packageRef: {
      uri: '/sap/bc/adt/packages/ZPKG',
      type: 'DEVC/K',
      name: 'ZPKG',
    },
  },
  abapoo: { modeled: false },
  abapsource: {
    sourceUri: 'source/main',
    fixPointArithmetic: true,
    activeUnicodeCheck: true,
  },
  links: [
    { href: 'source/main', rel: 'http://www.sap.com/adt/relations/source' },
  ],
});

const xml = intf.toAdtXml();
console.log(xml);
```

Parse from existing ADT XML:

```ts
import { Interface } from '@abapify/adk';

const parsed = Interface.fromAdtXml(existingXml);
console.log(parsed.name); // "ZIF_HELLO"
```

Use with an ADT client (example abstraction):

```ts
import { GenericAdkService } from '@abapify/adt-client';
import { Interface } from '@abapify/adk';

const service = new GenericAdkService(connectionManager);
await service.createObject(intf, { activate: true });
```

## What’s Inside

- `BaseXML` — shared ADT bits (`adtcore` attributes, `atom:link` elements)
- `OoXML` — adds `abapsource` and `abapoo` for OO artifacts (interfaces, classes)
- Namespaces — typed wrappers for `adtcore`, `atom`, `abapsource`, `abapoo`, `intf`, `class`, `ddic`

For detailed XML structure and conventions, see the specification: `docs/specs/adk2-on-xmld.md`.
