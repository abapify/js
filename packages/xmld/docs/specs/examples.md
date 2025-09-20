# xmld Examples

Real-world examples demonstrating **xmld** usage patterns and best practices.

## Table of Contents

- [RSS Feed](#rss-feed)
- [SOAP Envelope](#soap-envelope)
- [Atom Feed](#atom-feed)
- [SVG Document](#svg-document)
- [Configuration File](#configuration-file)
- [Complex Nested Structure](#complex-nested-structure)
- [Conditional Content](#conditional-content)
- [Attribute Groups](#attribute-groups)
- [Namespace Handling](#namespace-handling)
- [Custom Serialization](#custom-serialization)

---

## RSS Feed

Complete RSS 2.0 feed implementation.

```typescript
import { xml, root, element, attribute, unwrap, toXML } from 'xmld';

interface ChannelMeta {
  title: string;
  description: string;
  link: string;
  language?: string;
  pubDate?: Date;
  lastBuildDate?: Date;
  generator?: string;
}

@xml
@root('rss')
class RSSFeed {
  @attribute version = '2.0';

  @unwrap @element channel!: ChannelMeta; // Flattens channel properties

  @element items: Item[] = []; // Auto-instantiation because Item is @xml
}

@xml
class Item {
  @element title!: string;
  @element description!: string;
  @element link!: string;
  @element pubDate?: Date;
  @element guid?: string;
  @element author?: string;

  @element categories: Category[] = []; // Auto-instantiation because Category is @xml
}

@xml
class Category {
  @attribute domain?: string;
  @element name!: string; // Renamed from 'value' for clarity
}

// Usage
const feed = new RSSFeed();
feed.channel = {
  title: 'My Tech Blog',
  description: 'Latest posts about web development',
  link: 'https://myblog.com',
  language: 'en-US',
  pubDate: new Date(),
  generator: 'xmld',
};

const item = new Item();
item.title = 'Getting Started with xmld';
item.description = 'Learn how to use xmld for XML modeling';
item.link = 'https://myblog.com/xmld-tutorial';
item.pubDate = new Date();

const category = new Category();
category.name = 'TypeScript';
category.domain = 'technology';
item.categories.push(category);

feed.items.push(item);

const xml = toXML(feed, { pretty: true, xmlDeclaration: true });
console.log(xml);
```

**Generated XML:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <title>My Tech Blog</title>
  <description>Latest posts about web development</description>
  <link>https://myblog.com</link>
  <language>en-US</language>
  <pubDate>2025-09-20T17:30:00.000Z</pubDate>
  <generator>xmld</generator>
  <item>
    <title>Getting Started with xmld</title>
    <description>Learn how to use xmld for XML modeling</description>
    <link>https://myblog.com/xmld-tutorial</link>
    <pubDate>2025-09-20T17:30:00.000Z</pubDate>
    <category domain="technology">
      <name>TypeScript</name>
    </category>
  </item>
</rss>
```

---

## SOAP Envelope

SOAP 1.1 envelope with header and body.

```typescript
@namespace('soap', 'http://schemas.xmlsoap.org/soap/envelope/')
@xmlRoot('soap:Envelope')
class SOAPEnvelope {
  @element('soap:Header')
  @elementType(SOAPHeader)
  header?: SOAPHeader;

  @element('soap:Body')
  @elementType(SOAPBody)
  body!: SOAPBody;
}

class SOAPHeader {
  @namespace('wsa', 'http://www.w3.org/2005/08/addressing')
  @element('wsa:Action')
  action?: string;

  @element('wsa:MessageID')
  messageId?: string;

  @element('wsa:To')
  to?: string;
}

class SOAPBody {
  @namespace('tns', 'http://example.com/webservice')
  @element('tns:GetUserRequest')
  @elementType(GetUserRequest)
  getUserRequest?: GetUserRequest;
}

class GetUserRequest {
  @element() userId!: string;
  @element() includeDetails?: boolean;
}

// Usage
const envelope = new SOAPEnvelope();

envelope.header = new SOAPHeader();
envelope.header.action = 'http://example.com/webservice/GetUser';
envelope.header.messageId = 'uuid:12345-67890';
envelope.header.to = 'http://example.com/webservice';

envelope.body.getUserRequest = new GetUserRequest();
envelope.body.getUserRequest.userId = 'user123';
envelope.body.getUserRequest.includeDetails = true;

const xml = toXML(envelope, {
  pretty: true,
  xmlDeclaration: true,
  namespaceDeclarations: 'root',
});
```

---

## Atom Feed

Atom 1.0 syndication format.

```typescript
@namespace('atom', 'http://www.w3.org/2005/Atom')
@xmlRoot('atom:feed')
class AtomFeed {
  @element('atom:id') id!: string;
  @element('atom:title') title!: string;
  @element('atom:subtitle') subtitle?: string;
  @element('atom:updated') updated!: Date;

  @element('atom:link')
  @elementType(AtomLink)
  links: AtomLink[] = [];

  @element('atom:author')
  @elementType(AtomPerson)
  authors: AtomPerson[] = [];

  @element('atom:entry')
  @elementType(AtomEntry)
  entries: AtomEntry[] = [];
}

class AtomLink {
  @attribute() href!: string;
  @attribute() rel?: string;
  @attribute() type?: string;
  @attribute() title?: string;
}

class AtomPerson {
  @element('atom:name') name!: string;
  @element('atom:email') email?: string;
  @element('atom:uri') uri?: string;
}

class AtomEntry {
  @element('atom:id') id!: string;
  @element('atom:title') title!: string;
  @element('atom:summary') summary?: string;
  @element('atom:content') content?: AtomContent;
  @element('atom:published') published?: Date;
  @element('atom:updated') updated!: Date;

  @element('atom:link')
  @elementType(AtomLink)
  links: AtomLink[] = [];

  @element('atom:author')
  @elementType(AtomPerson)
  authors: AtomPerson[] = [];
}

class AtomContent {
  @attribute() type?: string;
  @element() value!: string;
}

// Usage
const feed = new AtomFeed();
feed.id = 'http://example.com/feed';
feed.title = 'My Atom Feed';
feed.updated = new Date();

const selfLink = new AtomLink();
selfLink.href = 'http://example.com/feed';
selfLink.rel = 'self';
selfLink.type = 'application/atom+xml';
feed.links.push(selfLink);

const author = new AtomPerson();
author.name = 'John Doe';
author.email = 'john@example.com';
feed.authors.push(author);

const entry = new AtomEntry();
entry.id = 'http://example.com/entry/1';
entry.title = 'First Post';
entry.updated = new Date();
feed.entries.push(entry);
```

---

## SVG Document

Scalable Vector Graphics with shapes and styling.

```typescript
@namespace('svg', 'http://www.w3.org/2000/svg')
@xmlRoot('svg:svg')
class SVGDocument {
  @attribute() width!: number;
  @attribute() height!: number;
  @attribute() viewBox?: string;

  @element('svg:defs')
  @elementType(SVGDefs)
  defs?: SVGDefs;

  @element('svg:g')
  @elementType(SVGGroup)
  groups: SVGGroup[] = [];

  @element('svg:rect')
  @elementType(SVGRect)
  rectangles: SVGRect[] = [];

  @element('svg:circle')
  @elementType(SVGCircle)
  circles: SVGCircle[] = [];
}

class SVGDefs {
  @element('svg:style')
  @elementType(SVGStyle)
  styles: SVGStyle[] = [];
}

class SVGStyle {
  @attribute() type = 'text/css';
  @element() content!: string;
}

class SVGGroup {
  @attribute() id?: string;
  @attribute() class?: string;
  @attribute() transform?: string;

  @element('svg:rect')
  @elementType(SVGRect)
  rectangles: SVGRect[] = [];

  @element('svg:circle')
  @elementType(SVGCircle)
  circles: SVGCircle[] = [];
}

class SVGRect {
  @attribute() x!: number;
  @attribute() y!: number;
  @attribute() width!: number;
  @attribute() height!: number;
  @attribute() fill?: string;
  @attribute() stroke?: string;
  @attribute('stroke-width') strokeWidth?: number;
}

class SVGCircle {
  @attribute() cx!: number;
  @attribute() cy!: number;
  @attribute() r!: number;
  @attribute() fill?: string;
  @attribute() stroke?: string;
}

// Usage
const svg = new SVGDocument();
svg.width = 200;
svg.height = 200;
svg.viewBox = '0 0 200 200';

const rect = new SVGRect();
rect.x = 10;
rect.y = 10;
rect.width = 80;
rect.height = 80;
rect.fill = 'blue';
svg.rectangles.push(rect);

const circle = new SVGCircle();
circle.cx = 150;
circle.cy = 150;
circle.r = 40;
circle.fill = 'red';
svg.circles.push(circle);
```

---

## Configuration File

Application configuration with nested sections.

```typescript
@xmlRoot('configuration')
class AppConfiguration {
  @element()
  @elementType(DatabaseConfig)
  database!: DatabaseConfig;

  @element()
  @elementType(LoggingConfig)
  logging!: LoggingConfig;

  @element()
  @elementType(SecurityConfig)
  security!: SecurityConfig;

  @element('feature')
  @elementType(FeatureFlag)
  features: FeatureFlag[] = [];
}

class DatabaseConfig {
  @element() host!: string;
  @element() port!: number;
  @element() database!: string;
  @element() username!: string;
  @element() password!: string;
  @element() maxConnections?: number;
  @element() timeout?: number;
}

class LoggingConfig {
  @element() level!: 'debug' | 'info' | 'warn' | 'error';
  @element() format?: string;
  @element() file?: string;
  @element() maxSize?: string;
  @element() maxFiles?: number;
}

class SecurityConfig {
  @element() jwtSecret!: string;
  @element() jwtExpiration?: string;
  @element() corsOrigins?: string;
  @element() rateLimitWindow?: number;
  @element() rateLimitMax?: number;
}

class FeatureFlag {
  @attribute() name!: string;
  @attribute() enabled!: boolean;
  @element() description?: string;
  @element() rolloutPercentage?: number;
}

// Usage
const config = new AppConfiguration();

config.database.host = 'localhost';
config.database.port = 5432;
config.database.database = 'myapp';
config.database.username = 'admin';
config.database.password = 'secret';

config.logging.level = 'info';
config.logging.file = '/var/log/app.log';

config.security.jwtSecret = 'super-secret-key';
config.security.jwtExpiration = '24h';

const feature = new FeatureFlag();
feature.name = 'newDashboard';
feature.enabled = true;
feature.description = 'Enable new dashboard UI';
feature.rolloutPercentage = 50;
config.features.push(feature);
```

---

## Complex Nested Structure

Document with multiple levels of nesting and relationships.

```typescript
@xmlRoot('document')
class Document {
  @attributeGroup()
  metadata: DocumentMetadata;

  @element()
  @elementType(DocumentHeader)
  header!: DocumentHeader;

  @element()
  @elementType(DocumentBody)
  body!: DocumentBody;

  @element()
  @elementType(DocumentFooter)
  footer?: DocumentFooter;
}

interface DocumentMetadata {
  id: string;
  version: string;
  created: Date;
  modified: Date;
  author: string;
}

class DocumentHeader {
  @element() title!: string;
  @element() subtitle?: string;

  @element('meta')
  @elementType(MetaTag)
  metaTags: MetaTag[] = [];
}

class MetaTag {
  @attribute() name!: string;
  @attribute() content!: string;
}

class DocumentBody {
  @element('section')
  @elementType(Section)
  sections: Section[] = [];
}

class Section {
  @attribute() id?: string;
  @attribute() class?: string;

  @element() title?: string;

  @element('paragraph')
  @elementType(Paragraph)
  paragraphs: Paragraph[] = [];

  @element('list')
  @elementType(List)
  lists: List[] = [];

  @element('table')
  @elementType(Table)
  tables: Table[] = [];
}

class Paragraph {
  @attribute() class?: string;
  @element() content!: string;

  @element('link')
  @elementType(Link)
  links: Link[] = [];
}

class Link {
  @attribute() href!: string;
  @attribute() title?: string;
  @element() text!: string;
}

class List {
  @attribute() type: 'ordered' | 'unordered' = 'unordered';

  @element('item')
  @elementType(ListItem)
  items: ListItem[] = [];
}

class ListItem {
  @element() content!: string;

  @element('list')
  @elementType(List)
  nestedLists: List[] = [];
}

class Table {
  @element()
  @elementType(TableHeader)
  header?: TableHeader;

  @element()
  @elementType(TableBody)
  body!: TableBody;
}

class TableHeader {
  @element('row')
  @elementType(TableRow)
  rows: TableRow[] = [];
}

class TableBody {
  @element('row')
  @elementType(TableRow)
  rows: TableRow[] = [];
}

class TableRow {
  @element('cell')
  @elementType(TableCell)
  cells: TableCell[] = [];
}

class TableCell {
  @attribute() colspan?: number;
  @attribute() rowspan?: number;
  @element() content!: string;
}

class DocumentFooter {
  @element() copyright?: string;
  @element() lastModified?: Date;

  @element('link')
  @elementType(Link)
  links: Link[] = [];
}

// Usage
const doc = new Document();
doc.metadata = {
  id: 'doc-001',
  version: '1.0',
  created: new Date(),
  modified: new Date(),
  author: 'John Doe',
};

doc.header.title = 'Technical Specification';
doc.header.subtitle = 'Version 1.0';

const section = new Section();
section.id = 'introduction';
section.title = 'Introduction';

const paragraph = new Paragraph();
paragraph.content = 'This document describes the technical specification.';
section.paragraphs.push(paragraph);

doc.body.sections.push(section);
```

---

## Conditional Content

Content that appears based on runtime conditions.

```typescript
import { conditional } from 'xmld';

@xmlRoot('report')
class Report {
  @element() title!: string;
  @element() generated!: Date;

  @element()
  @conditional((instance) => instance.includeDetails)
  @elementType(DetailedSection)
  details?: DetailedSection;

  @element()
  @conditional((instance) => instance.showCharts)
  @elementType(ChartSection)
  charts?: ChartSection;

  @element()
  @conditional((instance) => instance.data.length > 0)
  @elementType(DataSection)
  dataSection?: DataSection;

  // Control properties
  includeDetails = false;
  showCharts = false;
  data: any[] = [];
}

class DetailedSection {
  @element() methodology!: string;
  @element() assumptions!: string;
  @element() limitations!: string;
}

class ChartSection {
  @element('chart')
  @elementType(Chart)
  charts: Chart[] = [];
}

class Chart {
  @attribute() type!: string;
  @attribute() title!: string;
  @element() data!: string; // Base64 encoded image or data
}

class DataSection {
  @element('record')
  @elementType(DataRecord)
  records: DataRecord[] = [];
}

class DataRecord {
  @attribute() id!: string;
  @element() value!: number;
  @element() timestamp!: Date;
}

// Usage
const report = new Report();
report.title = 'Monthly Sales Report';
report.generated = new Date();

// Conditional content based on flags
report.includeDetails = true; // Details section will be included
report.showCharts = false; // Charts section will be omitted

// Add data to trigger data section
report.data = [
  { id: '1', value: 100, timestamp: new Date() },
  { id: '2', value: 200, timestamp: new Date() },
];

// Details section will be included because includeDetails = true
report.details = new DetailedSection();
report.details.methodology = 'Statistical analysis';

// Data section will be included because data.length > 0
report.dataSection = new DataSection();
report.data.forEach((item) => {
  const record = new DataRecord();
  record.id = item.id;
  record.value = item.value;
  record.timestamp = item.timestamp;
  report.dataSection!.records.push(record);
});

const xml = toXML(report, { pretty: true });
// Only includes details and data sections, charts section omitted
```

---

## Attribute Groups

Flattening interface properties as XML attributes.

```typescript
interface CommonAttributes {
  id: string;
  class?: string;
  style?: string;
  title?: string;
}

interface DataAttributes {
  dataId: string;
  dataType: string;
  dataValue?: string;
}

interface AriaAttributes {
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaHidden?: boolean;
}

@xmlRoot('widget')
class Widget {
  @attributeGroup()
  common: CommonAttributes;

  @attributeGroup()
  data: DataAttributes;

  @attributeGroup()
  aria: AriaAttributes;

  @element() content!: string;

  @element('child')
  @elementType(ChildWidget)
  children: ChildWidget[] = [];
}

class ChildWidget {
  @attributeGroup()
  common: CommonAttributes;

  @element() label!: string;
  @element() value?: string;
}

// Usage
const widget = new Widget();

// All these properties become XML attributes
widget.common = {
  id: 'main-widget',
  class: 'primary-widget',
  style: 'color: blue;',
  title: 'Main Application Widget',
};

widget.data = {
  dataId: 'widget-001',
  dataType: 'interactive',
  dataValue: 'active',
};

widget.aria = {
  ariaLabel: 'Main widget for user interaction',
  ariaHidden: false,
};

widget.content = 'Widget content here';

const child = new ChildWidget();
child.common = {
  id: 'child-1',
  class: 'child-widget',
};
child.label = 'Child Widget';
child.value = 'child value';
widget.children.push(child);

const xml = toXML(widget, { pretty: true });
```

**Generated XML:**

```xml
<widget
  id="main-widget"
  class="primary-widget"
  style="color: blue;"
  title="Main Application Widget"
  dataId="widget-001"
  dataType="interactive"
  dataValue="active"
  ariaLabel="Main widget for user interaction"
  ariaHidden="false">
  <content>Widget content here</content>
  <child id="child-1" class="child-widget">
    <label>Child Widget</label>
    <value>child value</value>
  </child>
</widget>
```

---

## Namespace Handling

Complex namespace scenarios with multiple prefixes.

```typescript
@namespace('root', 'http://example.com/root')
@xmlRoot('root:document')
class MultiNamespaceDocument {
  @namespace('meta', 'http://example.com/metadata')
  @element('meta:info')
  @elementType(MetaInfo)
  metadata!: MetaInfo;

  @namespace('content', 'http://example.com/content')
  @element('content:body')
  @elementType(ContentBody)
  body!: ContentBody;

  @namespace('ext', 'http://example.com/extensions')
  @element('ext:plugins')
  @elementType(PluginContainer)
  plugins?: PluginContainer;
}

class MetaInfo {
  @namespace('meta', 'http://example.com/metadata')
  @element('meta:title')
  title!: string;

  @element('meta:author') author!: string;

  @element('meta:created') created!: Date;

  @namespace('dc', 'http://purl.org/dc/elements/1.1/')
  @element('dc:subject')
  subject?: string;
}

class ContentBody {
  @namespace('content', 'http://example.com/content')
  @element('content:section')
  @elementType(ContentSection)
  sections: ContentSection[] = [];
}

class ContentSection {
  @attribute() id!: string;

  @namespace('content', 'http://example.com/content')
  @element('content:title')
  title!: string;

  @element('content:text') text!: string;

  @namespace('html', 'http://www.w3.org/1999/xhtml')
  @element('html:div')
  @elementType(HtmlDiv)
  htmlContent?: HtmlDiv;
}

class HtmlDiv {
  @attribute() class?: string;
  @element() content!: string;
}

class PluginContainer {
  @namespace('ext', 'http://example.com/extensions')
  @element('ext:plugin')
  @elementType(Plugin)
  plugins: Plugin[] = [];
}

class Plugin {
  @attribute() name!: string;
  @attribute() version!: string;
  @attribute() enabled!: boolean;

  @element('ext:config')
  @elementType(PluginConfig)
  config?: PluginConfig;
}

class PluginConfig {
  @element('setting')
  @elementType(ConfigSetting)
  settings: ConfigSetting[] = [];
}

class ConfigSetting {
  @attribute() key!: string;
  @attribute() type!: string;
  @element() value!: string;
}

// Usage
const doc = new MultiNamespaceDocument();

doc.metadata.title = 'Multi-Namespace Document';
doc.metadata.author = 'Jane Smith';
doc.metadata.created = new Date();
doc.metadata.subject = 'XML Namespaces';

const section = new ContentSection();
section.id = 'intro';
section.title = 'Introduction';
section.text = 'This section introduces namespace handling.';

section.htmlContent = new HtmlDiv();
section.htmlContent.class = 'highlight';
section.htmlContent.content = 'HTML content within XML';

doc.body.sections.push(section);

const xml = toXML(doc, {
  pretty: true,
  xmlDeclaration: true,
  namespaceDeclarations: 'root',
});
```

**Generated XML:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<root:document
  xmlns:root="http://example.com/root"
  xmlns:meta="http://example.com/metadata"
  xmlns:content="http://example.com/content"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:html="http://www.w3.org/1999/xhtml">
  <meta:info>
    <meta:title>Multi-Namespace Document</meta:title>
    <meta:author>Jane Smith</meta:author>
    <meta:created>2025-09-20T17:30:00.000Z</meta:created>
    <dc:subject>XML Namespaces</dc:subject>
  </meta:info>
  <content:body>
    <content:section id="intro">
      <content:title>Introduction</content:title>
      <content:text>This section introduces namespace handling.</content:text>
      <html:div class="highlight">HTML content within XML</html:div>
    </content:section>
  </content:body>
</root:document>
```

---

## Custom Serialization

Advanced serialization with custom options and formatting.

```typescript
@xmlRoot('customDocument')
class CustomDocument {
  @element() title!: string;
  @element() content!: string;
  @element() timestamp!: Date;

  @element('item')
  @elementType(CustomItem)
  items: CustomItem[] = [];
}

class CustomItem {
  @attribute() id!: string;
  @attribute() priority!: number;
  @element() name!: string;
  @element() description?: string;
}

// Usage with various serialization options
const doc = new CustomDocument();
doc.title = 'Custom Serialization Example';
doc.content = 'This demonstrates custom serialization options.';
doc.timestamp = new Date();

const item1 = new CustomItem();
item1.id = 'item-1';
item1.priority = 1;
item1.name = 'High Priority Item';
item1.description = 'This item has high priority.';
doc.items.push(item1);

const item2 = new CustomItem();
item2.id = 'item-2';
item2.priority = 3;
item2.name = 'Low Priority Item';
doc.items.push(item2);

// Compact XML (no formatting)
const compactXml = toXML(doc);
console.log('Compact:', compactXml);

// Pretty-printed XML
const prettyXml = toXML(doc, {
  pretty: true,
  indent: '    ', // 4 spaces
  maxLineLength: 80,
});
console.log('Pretty:', prettyXml);

// XML with declaration and custom encoding
const fullXml = toXML(doc, {
  pretty: true,
  xmlDeclaration: true,
  encoding: 'UTF-8',
  rootAttributes: {
    'schema-version': '1.0',
    'generated-by': 'xmld',
  },
});
console.log('Full:', fullXml);

// Minimal namespace declarations
const minimalXml = toXML(doc, {
  pretty: true,
  namespaceDeclarations: 'minimal',
});
console.log('Minimal namespaces:', minimalXml);
```

---

These examples demonstrate the flexibility and power of **xmld** for modeling various XML formats. Each example shows different aspects of the library:

- **Decorator usage patterns**
- **Auto-instantiation capabilities**
- **Namespace handling**
- **Conditional content**
- **Attribute grouping**
- **Complex nested structures**
- **Custom serialization options**

For more advanced usage patterns and edge cases, refer to the [API Reference](./api-reference.md) and [main specification](./README.md).
