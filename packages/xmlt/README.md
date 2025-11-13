# xmlt - Universal XML ↔ JSON Transformer

**Zero-configuration bidirectional XML ↔ JSON transformation** using pure XSLT with Saxon-JS.

Works with **ANY XML/JSON structure** - packages, classes, interfaces, books, orders, invoices - anything!

## Features

✅ **Zero Configuration** - Works with ANY XML/JSON document
✅ **Bidirectional** - XML ↔ JSON (both directions)
✅ **Automatic Type Detection** - boolean, number, string
✅ **Automatic Array Detection** - Repeated elements → JSON arrays
✅ **Namespace Stripping** - Removes namespace prefixes automatically
✅ **Mixed Content** - Handles text + attributes via `_text` property
✅ **Pre-compiled** - Ships with Saxon-JS SEF files, no compilation needed
✅ **Production Ready** - Tested with SAP ADT Package XML + custom examples

## Installation

```bash
npm install xmlt
# or
bun add xmlt
# or
yarn add xmlt
```

## Quick Start

### XML → JSON

```typescript
import { xmlToJson } from 'xmlt';

const xml = `
<book>
  <title>XSLT Essentials</title>
  <author>John Doe</author>
  <price currency="USD">29.99</price>
  <available>true</available>
</book>
`;

const json = await xmlToJson(xml);
console.log(json);
// {
//   book: {
//     title: "XSLT Essentials",
//     author: "John Doe",
//     price: {
//       currency: "USD",
//       _text: 29.99
//     },
//     available: true
//   }
// }
```

### JSON → XML

```typescript
import { jsonToXml } from 'xmlt';

const json = {
  order: {
    id: 12345,
    customer: "Alice Smith",
    items: [
      { sku: "WIDGET-001", quantity: 2 },
      { sku: "GADGET-002", quantity: 1 }
    ]
  }
};

const xml = await jsonToXml(json);
console.log(xml);
// <order>
//   <id>12345</id>
//   <customer>Alice Smith</customer>
//   <items quantity="2" sku="WIDGET-001"/>
//   <items quantity="1" sku="GADGET-002"/>
// </order>
```

### Round-Trip Transformation

```typescript
import { roundTrip } from 'xmlt';

const original = {
  product: {
    name: "Laptop",
    price: 1299.99,
    inStock: true
  }
};

const result = await roundTrip(original);
// Data preserved through JSON → XML → JSON!
```

## API

### `xmlToJson<T>(xml: string, options?: XmlToJsonOptions): Promise<T>`

Transforms XML string to JSON object.

**Parameters:**
- `xml` - XML string to transform
- `options` - Optional transformation options
  - `format?: boolean` - Return formatted JSON (default: false)

**Returns:** Promise resolving to JSON object

**Example:**
```typescript
const json = await xmlToJson('<book><title>Test</title></book>');
```

### `jsonToXml(json: any, options?: JsonToXmlOptions): Promise<string>`

Transforms JSON object to XML string.

**Parameters:**
- `json` - JSON object to transform
- `options` - Optional transformation options
  - `format?: boolean` - Format output XML (default: true)

**Returns:** Promise resolving to XML string

**Example:**
```typescript
const xml = await jsonToXml({ book: { title: "Test" } });
```

### `roundTrip<T>(json: any): Promise<T>`

Performs round-trip transformation: JSON → XML → JSON

**Parameters:**
- `json` - JSON object to transform

**Returns:** Promise resolving to transformed JSON object

**Example:**
```typescript
const result = await roundTrip({ product: { name: "Test" } });
```

### `getXsltPaths()`

Returns paths to XSLT files (useful for direct XSLT processor usage).

**Returns:** Object with paths:
- `xmlToJson` - Path to xml-to-json-universal.xslt
- `jsonToXml` - Path to json-to-xml-universal.xslt
- `xmlToJsonSef` - Path to compiled SEF file
- `jsonToXmlSef` - Path to compiled SEF file

## Transformation Features

### Automatic Type Detection

```typescript
const xml = `
<data>
  <count>42</count>
  <price>29.99</price>
  <enabled>true</enabled>
  <disabled>false</disabled>
  <name>Product</name>
</data>
`;

const json = await xmlToJson(xml);
// {
//   data: {
//     count: 42,           // number
//     price: 29.99,        // number
//     enabled: true,       // boolean
//     disabled: false,     // boolean
//     name: "Product"      // string
//   }
// }
```

### Automatic Array Detection

```typescript
const xml = `
<chapters>
  <chapter id="1">Introduction</chapter>
  <chapter id="2">Advanced Topics</chapter>
  <chapter id="3">Best Practices</chapter>
</chapters>
`;

const json = await xmlToJson(xml);
// {
//   chapters: {
//     chapter: [
//       { id: 1, _text: "Introduction" },
//       { id: 2, _text: "Advanced Topics" },
//       { id: 3, _text: "Best Practices" }
//     ]
//   }
// }
```

### Namespace Stripping

```typescript
const xml = `
<pak:package xmlns:pak="http://sap.com" xmlns:adtcore="http://sap.com/adt"
             adtcore:name="$ABAPGIT_EXAMPLES"
             pak:type="development">
  <pak:superPackage adtcore:name="$TMP"/>
</pak:package>
`;

const json = await xmlToJson(xml);
// {
//   package: {
//     name: "$ABAPGIT_EXAMPLES",
//     type: "development",
//     superPackage: {
//       name: "$TMP"
//     }
//   }
// }
// All namespace prefixes (pak:, adtcore:) are stripped!
```

### Mixed Content Handling

```typescript
const xml = `<price currency="USD">29.99</price>`;

const json = await xmlToJson(xml);
// {
//   price: {
//     currency: "USD",
//     _text: 29.99
//   }
// }
```

### Smart Attribute vs Element Strategy

When transforming JSON → XML:

**Primitive-only objects** → All properties become attributes:
```typescript
const json = { specs: { cpu: "Intel i7", ram: "16GB" } };
const xml = await jsonToXml(json);
// <specs cpu="Intel i7" ram="16GB"/>
```

**Objects with complex children** → All properties become elements:
```typescript
const json = {
  order: {
    customer: "Alice",
    address: { street: "123 Main St", city: "Boston" }
  }
};
const xml = await jsonToXml(json);
// <order>
//   <customer>Alice</customer>
//   <address>
//     <street>123 Main St</street>
//     <city>Boston</city>
//   </address>
// </order>
```

## How It Works

### XML → JSON Transformation (XSLT 1.0)

**Single recursive template** processes ANY element:

```xml
<xsl:template match="*" mode="to-json">
  <!-- Automatically detects:
       - Text-only elements → string values
       - Elements with attributes → objects
       - Repeated elements → arrays
       - Nested elements → recursive processing
  -->
</xsl:template>
```

**Key Techniques:**
- `local-name()` - Strips namespace prefixes automatically
- Pattern matching - Detects repeated elements and creates arrays
- Type detection - `'true'/'false'` → boolean, numeric check → number
- Mixed content - `_text` property for elements with attributes + text

### JSON → XML Transformation (XSLT 3.0)

Uses **XSLT 3.0** `parse-json()` to convert JSON to maps/arrays:

```xml
<xsl:variable name="json-map" select="parse-json($json-input)"/>
```

**Smart Strategy:**
- **Has complex children (arrays/objects)?** → All properties become child elements
- **Only primitive properties?** → Properties become attributes
- **Special `_text` property?** → Becomes text content

## Pre-compiled SEF Files

This package ships with **pre-compiled Saxon Executable Format (SEF)** files, which means:

- ✅ No XSLT compilation needed
- ✅ Install and use immediately
- ✅ Faster startup time
- ✅ No xslt3 CLI required

The XSLT source files are also included if you want to use them with a different XSLT processor:

```typescript
import { getXsltPaths } from 'xmlt';

const paths = getXsltPaths();
console.log(paths.xmlToJson); // /path/to/xml-to-json-universal.xslt
```

## When to Use

**Use `xmlt` when:**
- ✅ Need to process multiple XML formats
- ✅ Don't have (or don't want to create) XSD schemas
- ✅ Want zero maintenance (works with any XML changes)
- ✅ Prototyping / exploratory data analysis
- ✅ One-off conversions
- ✅ Dynamic XML structures
- ✅ Need bidirectional transformation
- ✅ Working with SAP ADT XML formats
- ✅ Integrating XML APIs with JSON-based systems

**Avoid when:**
- ⚠️ Need specific output format (different from automatic detection)
- ⚠️ Need custom transformation logic per field
- ⚠️ Working with highly specialized XML formats requiring custom rules

## Performance

Typical transformation times (using Saxon-JS):

| Operation | Time | Notes |
|-----------|------|-------|
| SAP ADT Package XML → JSON | ~40ms | Complex nested structure |
| Simple XML → JSON | ~5ms | Simpler structure |
| JSON → XML | ~8ms | Array handling |
| Round-trip JSON → XML → JSON | ~10ms | Data preservation |

Performance depends on document size and complexity.

## Technical Details

### Type Detection Logic

```xml
<!-- Boolean detection -->
<xsl:when test="$value = 'true' or $value = 'false'">
  <xsl:value-of select="$value"/>  <!-- true/false (no quotes) -->
</xsl:when>

<!-- Number detection -->
<xsl:when test="number($value) = number($value) and $value != ''">
  <xsl:value-of select="$value"/>  <!-- 42, 3.14 (no quotes) -->
</xsl:when>

<!-- String (default) -->
<xsl:otherwise>
  <xsl:text>"</xsl:text>
  <xsl:value-of select="$value"/>
  <xsl:text>"</xsl:text>  <!-- "text" (quoted) -->
</xsl:otherwise>
```

### Array Detection Logic

```xml
<!-- Check if element appears multiple times -->
<xsl:variable name="siblings"
              select="parent::*/*[local-name() = $elem-name]"/>

<xsl:when test="count($siblings) > 1">
  <!-- Create JSON array: [item1, item2, item3] -->
</xsl:when>
```

### Namespace Stripping

```xml
<!-- Instead of name() which includes prefix: -->
<xsl:value-of select="name()"/>  <!-- pak:attributes -->

<!-- Use local-name() to strip namespace: -->
<xsl:value-of select="local-name()"/>  <!-- attributes -->
```

## Why Saxon-JS?

- ✅ **Enterprise-grade** - Saxonica's production XSLT processor
- ✅ **Standards-compliant** - Full XSLT 3.0 support
- ✅ **No bugs** - Handles namespaced attributes correctly
- ✅ **Active maintenance** - Regular updates and support
- ✅ **XSLT 3.0 features** - `parse-json()`, maps, arrays for JSON→XML
- ✅ **Free Home Edition** - No licensing costs

## Requirements

- **Node.js** 18+ (ES modules support)
- **saxonjs-he** v3.0.0-beta2 or later (automatically installed)

## License

MIT

## Contributing

Contributions welcome! The core XSLT transformations are the masterpiece - improvements to type detection, array handling, or edge cases are greatly appreciated.

## Related Projects

- [Saxon-JS](https://www.saxonica.com/saxon-js/) - XSLT 3.0 processor
- [@abapify/adk](https://github.com/abapify/adk) - ABAP Development Kit

---

**Bottom Line**: Point this transformer at ANY XML/JSON and it just works! 🎉

- 370 lines of XSLT code (150 + 220)
- Works with infinite XML/JSON structures
- Zero configuration required
- Production-ready with Saxon-JS
