# @abapify/adk (ABAP Development Kit)

A modern TypeScript-first library for representing SAP ABAP objects with accurate ADT (ABAP Development Tools) XML parsing and serialization.

Built on the minimal, decorator-based XML engine `xmld`, with `fast-xml-parser` integration for robust XML processing.

## Features

- 🎯 **TypeScript-First Design** - Clean, strongly typed ADT object representations
- 🔄 **Accurate XML Processing** - Faithful parsing and rendering of real ADT XML payloads
- 🏗️ **Modern Architecture** - Built on xmld decorators with automatic type inference
- ⚡ **Namespace-Aware** - Proper handling of ADT XML namespaces (adtcore, abapsource, atom)
- ✅ **Comprehensive Testing** - Full test coverage with real XML fixtures
- 📦 **Client-Agnostic** - Works with any ADT client; emit XML via `toAdtXml()` and parse back with `fromAdtXml()`
- 🔧 **Extensible** - Add new object types and namespaces without changing the core
- 🚀 **Modern Node** - ESNext patterns, extensionless imports, small footprint

## Why ADK

**Use ADK when you want:**

- Programmatic, type-safe ABAP object modeling
- Reliable ADT XML generation and parsing
- Integration with build tools, CLIs, or automation
- Modern TypeScript development experience

**Alternatives:**

- Manual XML crafting for each object type
- Ad-hoc REST wrappers per endpoint
- Using IDE tools only (no programmatic modeling)

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

For detailed XML structure and conventions, see the specification: `docs/specs/adk-on-xmld.md`.
