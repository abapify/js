# v2 - Pure JavaScript/TypeScript XML Generator

**Alternative to XSLT**: Schema-driven XML generation using pure JavaScript/TypeScript.

## Key Features

✅ **No XSLT dependency** - Pure TypeScript implementation
✅ **Declarative schema** - Simple JSON schema format
✅ **Namespace support** - Full XML namespace control
✅ **Attribute ordering** - Preserve exact attribute order
✅ **Element ordering** - Control child element order
✅ **Lightweight** - No runtime XSLT processing overhead

## Schema Format

```typescript
{
  "elementName": {
    "$namespace": "pak",              // Namespace prefix for element
    "$xmlns": {                       // Namespace declarations (root only)
      "pak": "http://...",
      "adtcore": "http://..."
    },
    "$order": ["attr1", "attr2"],     // Attribute ordering
    "$properties": {
      "$attributes": true,            // Convert properties to attributes
      "$namespace": "adtcore"         // Namespace for attributes
    },
    "$children": {
      "$order": ["child1", "child2"]  // Child element ordering
    },

    // Nested element schemas
    "childElement": {
      "$namespace": "atom",
      "$properties": {
        "$attributes": true
      }
    }
  }
}
```

## Usage Example

```typescript
import { jsonToXmlV2 } from './v2/index.js';

const json = {
  package: {
    responsible: 'PPLENKOV',
    name: '$ABAPGIT_EXAMPLES',
    type: 'DEVC/K',
    link: [
      { href: 'versions', rel: 'http://www.sap.com/adt/relations/versions' }
    ]
  }
};

const schema = {
  package: {
    $namespace: 'pak',
    $xmlns: {
      pak: 'http://www.sap.com/adt/packages',
      adtcore: 'http://www.sap.com/adt/core',
      atom: 'http://www.w3.org/2005/Atom'
    },
    $order: ['responsible', 'name', 'type'],
    $properties: {
      $attributes: true,
      $namespace: 'adtcore'
    },
    link: {
      $namespace: 'atom',
      $properties: {
        $attributes: true
      }
    }
  }
};

const xml = jsonToXmlV2(json, { schema });
```

**Output:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<pak:package xmlns:pak="http://www.sap.com/adt/packages"
             xmlns:adtcore="http://www.sap.com/adt/core"
             xmlns:atom="http://www.w3.org/2005/Atom"
             adtcore:responsible="PPLENKOV"
             adtcore:name="$ABAPGIT_EXAMPLES"
             adtcore:type="DEVC/K">
   <atom:link href="versions" rel="http://www.sap.com/adt/relations/versions"/>
</pak:package>
```

## Schema Directives

### `$namespace`
Defines the XML namespace prefix for the element.

```json
{
  "package": {
    "$namespace": "pak"
  }
}
```
→ `<pak:package>`

### `$recursive`
Enables namespace inheritance for all descendant elements.

```json
{
  "library": {
    "$namespace": "lib",
    "$recursive": true,
    "books": {
      // Inherits lib: namespace
      "book": {
        // Also inherits lib: namespace
      },
      "metadata": {
        "$namespace": "meta"  // Overrides with different namespace
      }
    }
  }
}
```
→ `<lib:library><lib:books><lib:book>` but `<meta:metadata>`

**Inheritance Rules:**
- When `$recursive: true` is set on an element, all descendants inherit that namespace
- Descendants can override by setting their own `$namespace`
- Inherited namespaces continue to propagate through the tree
- If a child explicitly sets `$namespace` without `$recursive`, inheritance stops for that branch

### `$xmlns`
Declares XML namespaces (typically on root element only).

```json
{
  "$xmlns": {
    "pak": "http://www.sap.com/adt/packages",
    "adtcore": "http://www.sap.com/adt/core"
  }
}
```
→ `xmlns:pak="..." xmlns:adtcore="..."`

### `$order`
Specifies attribute order.

```json
{
  "$order": ["responsible", "name", "type"]
}
```
Ensures attributes appear in this exact order.

### `$properties.$attributes`
Converts JSON properties to XML attributes.

```json
{
  "$properties": {
    "$attributes": true,
    "$namespace": "adtcore"
  }
}
```
→ Properties become `adtcore:` prefixed attributes

### `$children.$order`
Specifies child element order.

```json
{
  "$children": {
    "$order": ["link", "attributes", "superPackage"]
  }
}
```
Ensures child elements appear in this order.

## Comparison with XSLT Approach

| Feature | XSLT (v1) | Pure JS (v2) |
|---------|-----------|--------------|
| **Runtime** | Saxon-JS | Native JS |
| **Performance** | Pre-compiled XSLT | Direct JS execution |
| **Bundle Size** | ~330KB | ~10KB (estimated) |
| **Schema Format** | XPath patterns | JSON directives |
| **Debugging** | XSLT stack traces | JavaScript stack traces |
| **Learning Curve** | XSLT 3.0 knowledge | JavaScript/TypeScript |
| **Dynamic Features** | Limited (Home Edition) | Full programmatic control |

## When to Use v2

- **No XSLT expertise** - Easier for JavaScript developers
- **Custom logic needed** - Easier to extend with JS
- **Smaller bundle** - When bundle size matters
- **Debugging** - Easier to debug pure JS
- **Node-only** - When browser support not needed

## When to Use v1 (XSLT)

- **Standards compliance** - XSLT is a W3C standard
- **Complex transformations** - XSLT excels at complex XML manipulation
- **Existing XSLT** - Reuse existing XSLT stylesheets
- **Validation** - Built-in schema validation support
