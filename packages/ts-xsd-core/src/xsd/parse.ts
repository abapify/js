/**
 * XSD Parser - Parse XSD documents to typed Schema objects
 * 
 * This parser understands XSD semantics and produces correctly typed output
 * matching the W3C XMLSchema.xsd specification.
 * 
 * No intermediate JSON - direct XSD to typed objects.
 */

import { DOMParser } from '@xmldom/xmldom';
import type {
  Schema,
  Annotation,
  Documentation,
  Appinfo,
  Include,
  Import,
  Redefine,
  Override,
  TopLevelElement,
  LocalElement,
  TopLevelAttribute,
  LocalAttribute,
  TopLevelComplexType,
  LocalComplexType,
  TopLevelSimpleType,
  LocalSimpleType,
  SimpleTypeRestriction,
  List,
  Union,
  ComplexContent,
  SimpleContent,
  ComplexContentRestriction,
  ComplexContentExtension,
  SimpleContentRestriction,
  SimpleContentExtension,
  ExplicitGroup,
  All,
  NamedGroup,
  GroupRef,
  NamedAttributeGroup,
  AttributeGroupRef,
  Any,
  AnyAttribute,
  Unique,
  Key,
  Keyref,
  Selector,
  Field,
  Facet,
  Pattern,
  OpenContent,
  DefaultOpenContent,
  Assertion,
  Alternative,
  Notation,
} from './types';

// Use any for xmldom Element since it differs from DOM Element
type XmlElement = any;

/**
 * Parse an XSD string to a typed Schema object
 */
export function parseXsd(xml: string): Schema {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  const root = doc.documentElement;

  if (!root || getLocalName(root) !== 'schema') {
    throw new Error('Invalid XSD: root element must be xs:schema');
  }

  return parseSchema(root);
}

// =============================================================================
// Schema (root)
// =============================================================================

function parseSchema(el: XmlElement): Schema {
  const schema: Schema = {};

  // Attributes
  copyAttr(el, schema, 'id');
  copyAttr(el, schema, 'targetNamespace');
  copyAttr(el, schema, 'version');
  copyAttr(el, schema, 'finalDefault');
  copyAttr(el, schema, 'blockDefault');
  copyAttr(el, schema, 'attributeFormDefault');
  copyAttr(el, schema, 'elementFormDefault');
  copyAttr(el, schema, 'defaultAttributes');
  copyAttr(el, schema, 'xpathDefaultNamespace');
  copyAttr(el, schema, 'xml:lang');

  // Child elements
  for (const child of getChildElements(el)) {
    const name = getLocalName(child);
    switch (name) {
      case 'annotation':
        pushTo(schema, 'annotation', parseAnnotation(child));
        break;
      case 'include':
        pushTo(schema, 'include', parseInclude(child));
        break;
      case 'import':
        pushTo(schema, 'import', parseImport(child));
        break;
      case 'redefine':
        pushTo(schema, 'redefine', parseRedefine(child));
        break;
      case 'override':
        pushTo(schema, 'override', parseOverride(child));
        break;
      case 'element':
        pushTo(schema, 'element', parseTopLevelElement(child));
        break;
      case 'attribute':
        pushTo(schema, 'attribute', parseTopLevelAttribute(child));
        break;
      case 'simpleType':
        pushTo(schema, 'simpleType', parseTopLevelSimpleType(child));
        break;
      case 'complexType':
        pushTo(schema, 'complexType', parseTopLevelComplexType(child));
        break;
      case 'group':
        pushTo(schema, 'group', parseNamedGroup(child));
        break;
      case 'attributeGroup':
        pushTo(schema, 'attributeGroup', parseNamedAttributeGroup(child));
        break;
      case 'notation':
        pushTo(schema, 'notation', parseNotation(child));
        break;
      case 'defaultOpenContent':
        (schema as any).defaultOpenContent = parseDefaultOpenContent(child);
        break;
    }
  }

  return schema;
}

// =============================================================================
// Annotation
// =============================================================================

function parseAnnotation(el: XmlElement): Annotation {
  const result: Annotation = {};
  copyAttr(el, result, 'id');

  for (const child of getChildElements(el)) {
    const name = getLocalName(child);
    if (name === 'documentation') {
      pushTo(result, 'documentation', parseDocumentation(child));
    } else if (name === 'appinfo') {
      pushTo(result, 'appinfo', parseAppinfo(child));
    }
  }

  return result;
}

function parseDocumentation(el: XmlElement): Documentation {
  const result: Documentation = {};
  copyAttr(el, result, 'source');
  copyAttr(el, result, 'xml:lang');

  const text = getTextContent(el);
  if (text) {
    (result as any)._text = text;
  }

  return result;
}

function parseAppinfo(el: XmlElement): Appinfo {
  const result: Appinfo = {};
  copyAttr(el, result, 'source');

  const text = getTextContent(el);
  if (text) {
    (result as any)._text = text;
  }

  return result;
}

// =============================================================================
// Include / Import / Redefine / Override
// =============================================================================

function parseInclude(el: XmlElement): Include {
  const result: Include = { schemaLocation: '' };
  copyAttr(el, result, 'id');
  copyAttr(el, result, 'schemaLocation');
  parseAnnotationChild(el, result);
  return result;
}

function parseImport(el: XmlElement): Import {
  const result: Import = {};
  copyAttr(el, result, 'id');
  copyAttr(el, result, 'namespace');
  copyAttr(el, result, 'schemaLocation');
  parseAnnotationChild(el, result);
  return result;
}

function parseRedefine(el: XmlElement): Redefine {
  const result: Redefine = { schemaLocation: '' };
  copyAttr(el, result, 'id');
  copyAttr(el, result, 'schemaLocation');

  for (const child of getChildElements(el)) {
    const name = getLocalName(child);
    switch (name) {
      case 'annotation':
        pushTo(result, 'annotation', parseAnnotation(child));
        break;
      case 'simpleType':
        pushTo(result, 'simpleType', parseTopLevelSimpleType(child));
        break;
      case 'complexType':
        pushTo(result, 'complexType', parseTopLevelComplexType(child));
        break;
      case 'group':
        pushTo(result, 'group', parseNamedGroup(child));
        break;
      case 'attributeGroup':
        pushTo(result, 'attributeGroup', parseNamedAttributeGroup(child));
        break;
    }
  }

  return result;
}

function parseOverride(el: XmlElement): Override {
  const result: Override = { schemaLocation: '' };
  copyAttr(el, result, 'id');
  copyAttr(el, result, 'schemaLocation');

  for (const child of getChildElements(el)) {
    const name = getLocalName(child);
    switch (name) {
      case 'annotation':
        pushTo(result, 'annotation', parseAnnotation(child));
        break;
      case 'simpleType':
        pushTo(result, 'simpleType', parseTopLevelSimpleType(child));
        break;
      case 'complexType':
        pushTo(result, 'complexType', parseTopLevelComplexType(child));
        break;
      case 'group':
        pushTo(result, 'group', parseNamedGroup(child));
        break;
      case 'attributeGroup':
        pushTo(result, 'attributeGroup', parseNamedAttributeGroup(child));
        break;
      case 'element':
        pushTo(result, 'element', parseTopLevelElement(child));
        break;
      case 'attribute':
        pushTo(result, 'attribute', parseTopLevelAttribute(child));
        break;
      case 'notation':
        pushTo(result, 'notation', parseNotation(child));
        break;
    }
  }

  return result;
}

// =============================================================================
// Element Declarations
// =============================================================================

function parseTopLevelElement(el: XmlElement): TopLevelElement {
  const result: TopLevelElement = { name: '' };
  copyAttr(el, result, 'id');
  copyAttr(el, result, 'name');
  copyAttr(el, result, 'type');
  copyAttr(el, result, 'substitutionGroup');
  copyAttr(el, result, 'default');
  copyAttr(el, result, 'fixed');
  copyBoolAttr(el, result, 'nillable');
  copyBoolAttr(el, result, 'abstract');
  copyAttr(el, result, 'final');
  copyAttr(el, result, 'block');

  parseAnnotationChild(el, result);

  for (const child of getChildElements(el)) {
    const name = getLocalName(child);
    switch (name) {
      case 'simpleType':
        (result as any).simpleType = parseLocalSimpleType(child);
        break;
      case 'complexType':
        (result as any).complexType = parseLocalComplexType(child);
        break;
      case 'unique':
        pushTo(result, 'unique', parseUnique(child));
        break;
      case 'key':
        pushTo(result, 'key', parseKey(child));
        break;
      case 'keyref':
        pushTo(result, 'keyref', parseKeyref(child));
        break;
      case 'alternative':
        pushTo(result, 'alternative', parseAlternative(child));
        break;
    }
  }

  return result;
}

function parseLocalElement(el: XmlElement): LocalElement {
  const result: LocalElement = {};
  copyAttr(el, result, 'id');
  copyAttr(el, result, 'name');
  copyAttr(el, result, 'ref');
  copyAttr(el, result, 'type');
  copyAttr(el, result, 'minOccurs');
  copyAttr(el, result, 'maxOccurs');
  copyAttr(el, result, 'default');
  copyAttr(el, result, 'fixed');
  copyBoolAttr(el, result, 'nillable');
  copyAttr(el, result, 'block');
  copyAttr(el, result, 'form');
  copyAttr(el, result, 'targetNamespace');

  parseAnnotationChild(el, result);

  for (const child of getChildElements(el)) {
    const name = getLocalName(child);
    switch (name) {
      case 'simpleType':
        (result as any).simpleType = parseLocalSimpleType(child);
        break;
      case 'complexType':
        (result as any).complexType = parseLocalComplexType(child);
        break;
      case 'unique':
        pushTo(result, 'unique', parseUnique(child));
        break;
      case 'key':
        pushTo(result, 'key', parseKey(child));
        break;
      case 'keyref':
        pushTo(result, 'keyref', parseKeyref(child));
        break;
      case 'alternative':
        pushTo(result, 'alternative', parseAlternative(child));
        break;
    }
  }

  return result;
}

// =============================================================================
// Attribute Declarations
// =============================================================================

function parseTopLevelAttribute(el: XmlElement): TopLevelAttribute {
  const result: TopLevelAttribute = { name: '' };
  copyAttr(el, result, 'id');
  copyAttr(el, result, 'name');
  copyAttr(el, result, 'type');
  copyAttr(el, result, 'default');
  copyAttr(el, result, 'fixed');
  copyBoolAttr(el, result, 'inheritable');

  parseAnnotationChild(el, result);

  for (const child of getChildElements(el)) {
    if (getLocalName(child) === 'simpleType') {
      (result as any).simpleType = parseLocalSimpleType(child);
    }
  }

  return result;
}

function parseLocalAttribute(el: XmlElement): LocalAttribute {
  const result: LocalAttribute = {};
  copyAttr(el, result, 'id');
  copyAttr(el, result, 'name');
  copyAttr(el, result, 'ref');
  copyAttr(el, result, 'type');
  copyAttr(el, result, 'use');
  copyAttr(el, result, 'default');
  copyAttr(el, result, 'fixed');
  copyAttr(el, result, 'form');
  copyAttr(el, result, 'targetNamespace');
  copyBoolAttr(el, result, 'inheritable');

  parseAnnotationChild(el, result);

  for (const child of getChildElements(el)) {
    if (getLocalName(child) === 'simpleType') {
      (result as any).simpleType = parseLocalSimpleType(child);
    }
  }

  return result;
}

// =============================================================================
// Complex Types
// =============================================================================

function parseTopLevelComplexType(el: XmlElement): TopLevelComplexType {
  const result: TopLevelComplexType = { name: '' };
  copyAttr(el, result, 'id');
  copyAttr(el, result, 'name');
  copyBoolAttr(el, result, 'mixed');
  copyBoolAttr(el, result, 'abstract');
  copyAttr(el, result, 'final');
  copyAttr(el, result, 'block');
  copyBoolAttr(el, result, 'defaultAttributesApply');

  parseAnnotationChild(el, result);
  parseComplexTypeContent(el, result);

  return result;
}

function parseLocalComplexType(el: XmlElement): LocalComplexType {
  const result: LocalComplexType = {};
  copyAttr(el, result, 'id');
  copyBoolAttr(el, result, 'mixed');

  parseAnnotationChild(el, result);
  parseComplexTypeContent(el, result);

  return result;
}

function parseComplexTypeContent(el: XmlElement, result: any): void {
  for (const child of getChildElements(el)) {
    const name = getLocalName(child);
    switch (name) {
      case 'simpleContent':
        result.simpleContent = parseSimpleContent(child);
        break;
      case 'complexContent':
        result.complexContent = parseComplexContent(child);
        break;
      case 'openContent':
        result.openContent = parseOpenContent(child);
        break;
      case 'group':
        result.group = parseGroupRef(child);
        break;
      case 'all':
        result.all = parseAll(child);
        break;
      case 'choice':
        result.choice = parseExplicitGroup(child);
        break;
      case 'sequence':
        result.sequence = parseExplicitGroup(child);
        break;
      case 'attribute':
        pushTo(result, 'attribute', parseLocalAttribute(child));
        break;
      case 'attributeGroup':
        pushTo(result, 'attributeGroup', parseAttributeGroupRef(child));
        break;
      case 'anyAttribute':
        result.anyAttribute = parseAnyAttribute(child);
        break;
      case 'assert':
        pushTo(result, 'assert', parseAssertion(child));
        break;
    }
  }
}

// =============================================================================
// Simple Types
// =============================================================================

function parseTopLevelSimpleType(el: XmlElement): TopLevelSimpleType {
  const result: TopLevelSimpleType = { name: '' };
  copyAttr(el, result, 'id');
  copyAttr(el, result, 'name');
  copyAttr(el, result, 'final');

  parseAnnotationChild(el, result);
  parseSimpleTypeContent(el, result);

  return result;
}

function parseLocalSimpleType(el: XmlElement): LocalSimpleType {
  const result: LocalSimpleType = {};
  copyAttr(el, result, 'id');

  parseAnnotationChild(el, result);
  parseSimpleTypeContent(el, result);

  return result;
}

function parseSimpleTypeContent(el: XmlElement, result: any): void {
  for (const child of getChildElements(el)) {
    const name = getLocalName(child);
    switch (name) {
      case 'restriction':
        result.restriction = parseSimpleTypeRestriction(child);
        break;
      case 'list':
        result.list = parseList(child);
        break;
      case 'union':
        result.union = parseUnion(child);
        break;
    }
  }
}

function parseSimpleTypeRestriction(el: XmlElement): SimpleTypeRestriction {
  const result: SimpleTypeRestriction = {};
  copyAttr(el, result, 'id');
  copyAttr(el, result, 'base');

  parseAnnotationChild(el, result);

  for (const child of getChildElements(el)) {
    const name = getLocalName(child);
    switch (name) {
      case 'simpleType':
        (result as any).simpleType = parseLocalSimpleType(child);
        break;
      case 'minExclusive':
      case 'minInclusive':
      case 'maxExclusive':
      case 'maxInclusive':
      case 'totalDigits':
      case 'fractionDigits':
      case 'length':
      case 'minLength':
      case 'maxLength':
      case 'enumeration':
      case 'whiteSpace':
      case 'explicitTimezone':
        pushTo(result, name, parseFacet(child));
        break;
      case 'pattern':
        pushTo(result, 'pattern', parsePattern(child));
        break;
      case 'assertion':
        pushTo(result, 'assertion', parseAssertion(child));
        break;
    }
  }

  return result;
}

function parseList(el: XmlElement): List {
  const result: List = {};
  copyAttr(el, result, 'id');
  copyAttr(el, result, 'itemType');

  parseAnnotationChild(el, result);

  for (const child of getChildElements(el)) {
    if (getLocalName(child) === 'simpleType') {
      (result as any).simpleType = parseLocalSimpleType(child);
    }
  }

  return result;
}

function parseUnion(el: XmlElement): Union {
  const result: Union = {};
  copyAttr(el, result, 'id');
  copyAttr(el, result, 'memberTypes');

  parseAnnotationChild(el, result);

  for (const child of getChildElements(el)) {
    if (getLocalName(child) === 'simpleType') {
      pushTo(result, 'simpleType', parseLocalSimpleType(child));
    }
  }

  return result;
}

function parseFacet(el: XmlElement): Facet {
  const result: Facet = { value: '' };
  copyAttr(el, result, 'id');
  copyAttr(el, result, 'value');
  copyBoolAttr(el, result, 'fixed');
  parseAnnotationChild(el, result);
  return result;
}

function parsePattern(el: XmlElement): Pattern {
  const result: Pattern = { value: '' };
  copyAttr(el, result, 'id');
  copyAttr(el, result, 'value');
  parseAnnotationChild(el, result);
  return result;
}

// =============================================================================
// Complex Content / Simple Content
// =============================================================================

function parseComplexContent(el: XmlElement): ComplexContent {
  const result: ComplexContent = {};
  copyAttr(el, result, 'id');
  copyBoolAttr(el, result, 'mixed');

  parseAnnotationChild(el, result);

  for (const child of getChildElements(el)) {
    const name = getLocalName(child);
    if (name === 'restriction') {
      (result as any).restriction = parseComplexContentRestriction(child);
    } else if (name === 'extension') {
      (result as any).extension = parseComplexContentExtension(child);
    }
  }

  return result;
}

function parseSimpleContent(el: XmlElement): SimpleContent {
  const result: SimpleContent = {};
  copyAttr(el, result, 'id');

  parseAnnotationChild(el, result);

  for (const child of getChildElements(el)) {
    const name = getLocalName(child);
    if (name === 'restriction') {
      (result as any).restriction = parseSimpleContentRestriction(child);
    } else if (name === 'extension') {
      (result as any).extension = parseSimpleContentExtension(child);
    }
  }

  return result;
}

function parseComplexContentRestriction(el: XmlElement): ComplexContentRestriction {
  const result: ComplexContentRestriction = { base: '' };
  copyAttr(el, result, 'id');
  copyAttr(el, result, 'base');

  parseAnnotationChild(el, result);
  parseComplexTypeContent(el, result);

  return result;
}

function parseComplexContentExtension(el: XmlElement): ComplexContentExtension {
  const result: ComplexContentExtension = { base: '' };
  copyAttr(el, result, 'id');
  copyAttr(el, result, 'base');

  parseAnnotationChild(el, result);
  parseComplexTypeContent(el, result);

  return result;
}

function parseSimpleContentRestriction(el: XmlElement): SimpleContentRestriction {
  const result: SimpleContentRestriction = { base: '' };
  copyAttr(el, result, 'id');
  copyAttr(el, result, 'base');

  parseAnnotationChild(el, result);

  for (const child of getChildElements(el)) {
    const name = getLocalName(child);
    switch (name) {
      case 'simpleType':
        (result as any).simpleType = parseLocalSimpleType(child);
        break;
      case 'minExclusive':
      case 'minInclusive':
      case 'maxExclusive':
      case 'maxInclusive':
      case 'totalDigits':
      case 'fractionDigits':
      case 'length':
      case 'minLength':
      case 'maxLength':
      case 'enumeration':
      case 'whiteSpace':
      case 'explicitTimezone':
        pushTo(result, name, parseFacet(child));
        break;
      case 'pattern':
        pushTo(result, 'pattern', parsePattern(child));
        break;
      case 'assertion':
        pushTo(result, 'assertion', parseAssertion(child));
        break;
      case 'attribute':
        pushTo(result, 'attribute', parseLocalAttribute(child));
        break;
      case 'attributeGroup':
        pushTo(result, 'attributeGroup', parseAttributeGroupRef(child));
        break;
      case 'anyAttribute':
        (result as any).anyAttribute = parseAnyAttribute(child);
        break;
      case 'assert':
        pushTo(result, 'assert', parseAssertion(child));
        break;
    }
  }

  return result;
}

function parseSimpleContentExtension(el: XmlElement): SimpleContentExtension {
  const result: SimpleContentExtension = { base: '' };
  copyAttr(el, result, 'id');
  copyAttr(el, result, 'base');

  parseAnnotationChild(el, result);

  for (const child of getChildElements(el)) {
    const name = getLocalName(child);
    switch (name) {
      case 'attribute':
        pushTo(result, 'attribute', parseLocalAttribute(child));
        break;
      case 'attributeGroup':
        pushTo(result, 'attributeGroup', parseAttributeGroupRef(child));
        break;
      case 'anyAttribute':
        (result as any).anyAttribute = parseAnyAttribute(child);
        break;
      case 'assert':
        pushTo(result, 'assert', parseAssertion(child));
        break;
    }
  }

  return result;
}

// =============================================================================
// Model Groups
// =============================================================================

function parseExplicitGroup(el: XmlElement): ExplicitGroup {
  const result: ExplicitGroup = {};
  copyAttr(el, result, 'id');
  copyAttr(el, result, 'minOccurs');
  copyAttr(el, result, 'maxOccurs');

  parseAnnotationChild(el, result);

  for (const child of getChildElements(el)) {
    const name = getLocalName(child);
    switch (name) {
      case 'element':
        pushTo(result, 'element', parseLocalElement(child));
        break;
      case 'group':
        pushTo(result, 'group', parseGroupRef(child));
        break;
      case 'choice':
        pushTo(result, 'choice', parseExplicitGroup(child));
        break;
      case 'sequence':
        pushTo(result, 'sequence', parseExplicitGroup(child));
        break;
      case 'any':
        pushTo(result, 'any', parseAny(child));
        break;
    }
  }

  return result;
}

function parseAll(el: XmlElement): All {
  const result: All = {};
  copyAttr(el, result, 'id');
  copyAttr(el, result, 'minOccurs');
  copyAttr(el, result, 'maxOccurs');

  parseAnnotationChild(el, result);

  for (const child of getChildElements(el)) {
    const name = getLocalName(child);
    switch (name) {
      case 'element':
        pushTo(result, 'element', parseLocalElement(child));
        break;
      case 'any':
        pushTo(result, 'any', parseAny(child));
        break;
      case 'group':
        pushTo(result, 'group', parseGroupRef(child));
        break;
    }
  }

  return result;
}

// =============================================================================
// Groups and Attribute Groups
// =============================================================================

function parseNamedGroup(el: XmlElement): NamedGroup {
  const result: NamedGroup = { name: '' };
  copyAttr(el, result, 'id');
  copyAttr(el, result, 'name');

  parseAnnotationChild(el, result);

  for (const child of getChildElements(el)) {
    const name = getLocalName(child);
    switch (name) {
      case 'all':
        (result as any).all = parseAll(child);
        break;
      case 'choice':
        (result as any).choice = parseExplicitGroup(child);
        break;
      case 'sequence':
        (result as any).sequence = parseExplicitGroup(child);
        break;
    }
  }

  return result;
}

function parseGroupRef(el: XmlElement): GroupRef {
  const result: GroupRef = { ref: '' };
  copyAttr(el, result, 'id');
  copyAttr(el, result, 'ref');
  copyAttr(el, result, 'minOccurs');
  copyAttr(el, result, 'maxOccurs');
  parseAnnotationChild(el, result);
  return result;
}

function parseNamedAttributeGroup(el: XmlElement): NamedAttributeGroup {
  const result: NamedAttributeGroup = { name: '' };
  copyAttr(el, result, 'id');
  copyAttr(el, result, 'name');

  parseAnnotationChild(el, result);

  for (const child of getChildElements(el)) {
    const name = getLocalName(child);
    switch (name) {
      case 'attribute':
        pushTo(result, 'attribute', parseLocalAttribute(child));
        break;
      case 'attributeGroup':
        pushTo(result, 'attributeGroup', parseAttributeGroupRef(child));
        break;
      case 'anyAttribute':
        (result as any).anyAttribute = parseAnyAttribute(child);
        break;
    }
  }

  return result;
}

function parseAttributeGroupRef(el: XmlElement): AttributeGroupRef {
  const result: AttributeGroupRef = { ref: '' };
  copyAttr(el, result, 'id');
  copyAttr(el, result, 'ref');
  parseAnnotationChild(el, result);
  return result;
}

// =============================================================================
// Wildcards
// =============================================================================

function parseAny(el: XmlElement): Any {
  const result: Any = {};
  copyAttr(el, result, 'id');
  copyAttr(el, result, 'minOccurs');
  copyAttr(el, result, 'maxOccurs');
  copyAttr(el, result, 'namespace');
  copyAttr(el, result, 'processContents');
  copyAttr(el, result, 'notNamespace');
  copyAttr(el, result, 'notQName');
  parseAnnotationChild(el, result);
  return result;
}

function parseAnyAttribute(el: XmlElement): AnyAttribute {
  const result: AnyAttribute = {};
  copyAttr(el, result, 'id');
  copyAttr(el, result, 'namespace');
  copyAttr(el, result, 'processContents');
  copyAttr(el, result, 'notNamespace');
  copyAttr(el, result, 'notQName');
  parseAnnotationChild(el, result);
  return result;
}

// =============================================================================
// Identity Constraints
// =============================================================================

function parseUnique(el: XmlElement): Unique {
  const result: Unique = { name: '' };
  copyAttr(el, result, 'id');
  copyAttr(el, result, 'name');
  copyAttr(el, result, 'ref');

  parseAnnotationChild(el, result);

  for (const child of getChildElements(el)) {
    const name = getLocalName(child);
    if (name === 'selector') {
      (result as any).selector = parseSelector(child);
    } else if (name === 'field') {
      pushTo(result, 'field', parseField(child));
    }
  }

  return result;
}

function parseKey(el: XmlElement): Key {
  const result: Key = { name: '' };
  copyAttr(el, result, 'id');
  copyAttr(el, result, 'name');
  copyAttr(el, result, 'ref');

  parseAnnotationChild(el, result);

  for (const child of getChildElements(el)) {
    const name = getLocalName(child);
    if (name === 'selector') {
      (result as any).selector = parseSelector(child);
    } else if (name === 'field') {
      pushTo(result, 'field', parseField(child));
    }
  }

  return result;
}

function parseKeyref(el: XmlElement): Keyref {
  const result: Keyref = { name: '', refer: '' };
  copyAttr(el, result, 'id');
  copyAttr(el, result, 'name');
  copyAttr(el, result, 'ref');
  copyAttr(el, result, 'refer');

  parseAnnotationChild(el, result);

  for (const child of getChildElements(el)) {
    const name = getLocalName(child);
    if (name === 'selector') {
      (result as any).selector = parseSelector(child);
    } else if (name === 'field') {
      pushTo(result, 'field', parseField(child));
    }
  }

  return result;
}

function parseSelector(el: XmlElement): Selector {
  const result: Selector = { xpath: '' };
  copyAttr(el, result, 'id');
  copyAttr(el, result, 'xpath');
  copyAttr(el, result, 'xpathDefaultNamespace');
  parseAnnotationChild(el, result);
  return result;
}

function parseField(el: XmlElement): Field {
  const result: Field = { xpath: '' };
  copyAttr(el, result, 'id');
  copyAttr(el, result, 'xpath');
  copyAttr(el, result, 'xpathDefaultNamespace');
  parseAnnotationChild(el, result);
  return result;
}

// =============================================================================
// XSD 1.1 Features
// =============================================================================

function parseOpenContent(el: XmlElement): OpenContent {
  const result: OpenContent = {};
  copyAttr(el, result, 'id');
  copyAttr(el, result, 'mode');

  parseAnnotationChild(el, result);

  for (const child of getChildElements(el)) {
    if (getLocalName(child) === 'any') {
      (result as any).any = parseAny(child);
    }
  }

  return result;
}

function parseDefaultOpenContent(el: XmlElement): DefaultOpenContent {
  const result: DefaultOpenContent = { any: {} };
  copyAttr(el, result, 'id');
  copyBoolAttr(el, result, 'appliesToEmpty');
  copyAttr(el, result, 'mode');

  parseAnnotationChild(el, result);

  for (const child of getChildElements(el)) {
    if (getLocalName(child) === 'any') {
      (result as any).any = parseAny(child);
    }
  }

  return result;
}

function parseAssertion(el: XmlElement): Assertion {
  const result: Assertion = {};
  copyAttr(el, result, 'id');
  copyAttr(el, result, 'test');
  copyAttr(el, result, 'xpathDefaultNamespace');
  parseAnnotationChild(el, result);
  return result;
}

function parseAlternative(el: XmlElement): Alternative {
  const result: Alternative = {};
  copyAttr(el, result, 'id');
  copyAttr(el, result, 'test');
  copyAttr(el, result, 'type');
  copyAttr(el, result, 'xpathDefaultNamespace');

  parseAnnotationChild(el, result);

  for (const child of getChildElements(el)) {
    const name = getLocalName(child);
    if (name === 'simpleType') {
      (result as any).simpleType = parseLocalSimpleType(child);
    } else if (name === 'complexType') {
      (result as any).complexType = parseLocalComplexType(child);
    }
  }

  return result;
}

function parseNotation(el: XmlElement): Notation {
  const result: Notation = { name: '', public: '' };
  copyAttr(el, result, 'id');
  copyAttr(el, result, 'name');
  copyAttr(el, result, 'public');
  copyAttr(el, result, 'system');
  parseAnnotationChild(el, result);
  return result;
}

// =============================================================================
// Utility Functions
// =============================================================================

function getLocalName(el: XmlElement): string {
  return el.localName || el.tagName.split(':').pop() || el.tagName;
}

function getChildElements(el: XmlElement): XmlElement[] {
  const result: XmlElement[] = [];
  for (let i = 0; i < el.childNodes.length; i++) {
    const child = el.childNodes[i];
    if (child.nodeType === 1) { // ELEMENT_NODE
      result.push(child as XmlElement);
    }
  }
  return result;
}

function getTextContent(el: XmlElement): string {
  let text = '';
  for (let i = 0; i < el.childNodes.length; i++) {
    const child = el.childNodes[i];
    if (child.nodeType === 3) { // TEXT_NODE
      text += child.textContent || '';
    }
  }
  return text.trim();
}

function copyAttr(el: XmlElement, target: any, name: string): void {
  const value = el.getAttribute(name);
  if (value !== null) {
    target[name] = value;
  }
}

function copyBoolAttr(el: XmlElement, target: any, name: string): void {
  const value = el.getAttribute(name);
  if (value !== null) {
    target[name] = value === 'true';
  }
}

function pushTo(target: any, name: string, value: any): void {
  if (!target[name]) {
    target[name] = [];
  }
  target[name].push(value);
}

function parseAnnotationChild(el: XmlElement, result: any): void {
  for (const child of getChildElements(el)) {
    if (getLocalName(child) === 'annotation') {
      (result as any).annotation = parseAnnotation(child);
      break; // Only one annotation per element
    }
  }
}

export default parseXsd;