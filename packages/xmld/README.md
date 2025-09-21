# xmld

**Generic XML Modeling with TypeScript Decorators**

A powerful, type-safe library for modeling XML structures using TypeScript decorators. Build XML documents declaratively with classes, automatic serialization, and full type safety.

## ✨ Features

- **🎯 Declarative XML Modeling** - Use decorators to define XML structure
- **🔧 Class-Based Architecture** - Full decorator support with auto-instantiation
- **🚀 Type-Safe** - Complete TypeScript support with automatic type inference
- **⚡ Generic & Reusable** - Works with any XML format (RSS, SOAP, SVG, etc.)
- **🎨 Clean API** - Intuitive decorator syntax for rapid development
- **📦 Zero Dependencies** - Lightweight with plugin-based XML generation

## 🚀 Quick Start

```typescript
import { xmld, root, element, attribute, unwrap, toXML } from 'xmld';

interface ChannelMeta {
  title: string;
  description: string;
  link: string;
}

// ✨ Our signature @xmld decorator!
@xmld
@root('rss')
class RSSFeed {
  @attribute version = '2.0';

  @unwrap @element channel!: ChannelMeta; // Flattens to <title>, <description>, <link>

  // ✨ Explicit auto-instantiation - no surprises!
  @element({ type: Item, array: true }) items: Item[] = [];
}

@xmld
@root('item')
class Item {
  @element title!: string;
  @element description!: string;
  @element link!: string;
}

// Usage
const feed = new RSSFeed();
feed.channel = {
  title: 'My Blog',
  description: 'Latest posts',
  link: 'https://myblog.com',
};

// Manual instantiation (auto-instantiation framework ready for future enhancement)
const item = new Item();
item.title = 'First Post';
item.description = 'My first blog post';
item.link = 'https://myblog.com/first-post';
feed.items.push(item);

const xml = toXML(feed);
console.log(xml); // Generates complete RSS XML

// Or use with fast-xml-parser for formatting:
import { toFastXML } from 'xmld/plugins/fast-xml-parser';
import { XMLBuilder } from 'fast-xml-parser';

const fastXMLObject = toFastXML(feed);
const builder = new XMLBuilder({ format: true, indentBy: '  ' });
const formattedXml = builder.build(fastXMLObject);
```

## 📚 Documentation

- **[Examples](./src/examples/)** - Real-world usage examples in the test files
- **[Core Tests](./src/core/decorators.test.ts)** - Comprehensive test suite showing all features

> **Note**: This library focuses on core XML modeling functionality. Advanced features like parsing and validation are planned for future releases.

## 🎯 Core Concepts

### Decorators

| Decorator                 | Purpose                                                 | Example                                             |
| ------------------------- | ------------------------------------------------------- | --------------------------------------------------- |
| `@xmld`                   | **Our signature decorator** - Mark class as XML-enabled | `@xmld class Item {}`                               |
| `@xml`                    | Alias for `@xmld` (backward compatibility)              | `@xml class Item {}`                                |
| `@root(name)`             | Define root XML element                                 | `@root('rss')`                                      |
| `@element`                | Mark property as XML element                            | `@element title!: string`                           |
| `@element(options)`       | Element with explicit auto-instantiation                | `@element({ type: Author }) author!: Author`        |
| `@attribute`              | Mark property as XML attribute                          | `@attribute version = '2.0'`                        |
| `@unwrap`                 | Flatten object properties                               | `@unwrap @element meta!: MetaInfo`                  |
| `@namespace(prefix, uri)` | Assign namespace                                        | `@namespace('atom', 'http://www.w3.org/2005/Atom')` |

### Explicit Auto-Instantiation

```typescript
@xmld
@root('blog-post')
class BlogPost {
  // ✨ Explicit type hints - no surprises!
  @element({ type: Author }) author!: Author;
  @element({ type: Tag, array: true }) tags: Tag[] = [];
}

@xmld
@root('author')
class Author {
  @element name!: string;
  @element email!: string;
}

@xmld
@root('tag')
class Tag {
  @element name!: string;
}

// Usage with explicit types
const post = new BlogPost();
post.author = new Author(); // Manual instantiation (reliable)
post.author.name = 'John Doe';
post.tags.push({ name: 'TypeScript' } as any);
```

### Class Inheritance

xmld fully supports class inheritance with automatic metadata merging:

```typescript
@xmld
class BaseXML {
  @attribute id!: string;
  @element title!: string;
}

@xmld
@namespace('oo', 'http://www.sap.com/adt/oo')
class OOXML extends BaseXML {
  @namespace('oo', 'http://www.sap.com/adt/oo')
  @attribute
  type!: string;
}

@xmld
@root('intf:interface')
@namespace('intf', 'http://www.sap.com/adt/oo/interfaces')
class InterfaceXML extends OOXML {
  @element description!: string;
}

// All inherited properties work seamlessly
const intf = new InterfaceXML();
intf.id = 'ZIF_TEST'; // From BaseXML
intf.type = 'INTF/OI'; // From OOXML
intf.description = 'Test'; // From InterfaceXML
```

### Attribute Groups

```typescript
interface CoreAttributes {
  id: string;
  version: string;
  created: Date;
}

@xmld
@root('document')
class Document {
  @unwrap @attribute core!: CoreAttributes; // Flattened as XML attributes
  @element title!: string;
}
```

## 🏗️ Architecture

**xmld** follows clean architecture principles:

- **🎯 Signature Branding** - `@xmld` as our recognizable decorator
- **🔧 Modular Design** - Individual decorator files for clean separation
- **📦 Explicit Safety** - No naming surprises with explicit type hints
- **⚡ Plugin System** - Extensible XML generation with plugins
- **🎨 Zero Dependencies** - Lightweight core with optional enhancements
- **♻️ Reusable** - Can be used standalone or as foundation for domain-specific libraries

### Decorator Architecture

```
src/core/decorators/
├── index.ts          # Re-exports all decorators
├── xmld.ts          # @xmld - Our signature decorator
├── root.ts          # @root decorator
├── element.ts       # @element decorator + explicit auto-instantiation
├── attribute.ts     # @attribute decorator
├── unwrap.ts        # @unwrap decorator
└── namespace.ts     # @namespace decorator
```

## 🚀 Recent Improvements

### v2.0 - Signature Decorator & Explicit Safety

- **✨ Introduced `@xmld`** - Our signature decorator that serves as xmld's visit card
- **🛡️ Eliminated Naming Surprises** - Removed unreliable naming heuristics
- **🎯 Explicit Auto-Instantiation** - Use `@element({ type: SomeClass })` for predictable behavior
- **🏗️ Modular Architecture** - Separated decorators into individual files for better maintainability
- **🔧 Enhanced Type Safety** - Validates that only `@xmld` decorated classes are used for auto-instantiation
- **♻️ Backward Compatibility** - Both `@xmld` and `@xml` work seamlessly

### Migration Guide

```typescript
// ❌ Old approach (unreliable naming)
@xml
class BlogPost {
  @element author!: Author; // Guessed from property name
}

// ✅ New approach (explicit and safe)
@xmld
class BlogPost {
  @element({ type: Author }) author!: Author; // Explicit type hint
}
```

## 📦 Installation

```bash
npm install xmld
```

## 🚀 Usage

```typescript
import { xmld, root, element, attribute, toXML } from 'xmld';

@xmld
@root('document')
class Document {
  @attribute id!: string;
  @element title!: string;
  @element content!: string;
}

const doc = new Document();
doc.id = '123';
doc.title = 'Hello World';
doc.content = 'This is my document content';

const xml = toXML(doc);
console.log(xml);
// Output: <document id="123"><title>Hello World</title><content>This is my document content</content></document>
```

## 🔌 Plugin System

xmld provides zero-dependency transformations for popular XML libraries:

```typescript
// Direct plugin import for specific functionality
import { toFastXML, toFastXMLObject } from 'xmld/plugins/fast-xml-parser';

// Convert to fast-xml-parser compatible object
const fastXMLObject = toFastXML(document);

// Use with fast-xml-parser (if installed)
import { XMLBuilder } from 'fast-xml-parser';
const builder = new XMLBuilder({ format: true });
const xml = builder.build(fastXMLObject);

// Or get the raw object for other uses
const rawObject = toFastXMLObject(serializationData);
```

## 🤝 Contributing

Contributions are welcome! Please see our [development documentation](./docs/specs/README.md) for guidelines.

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ for the TypeScript community**
