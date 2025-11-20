import { createNamespace, createAdtSchema } from '../../../base/namespace';
import { AdtCoreObjectFields, adtcore } from '../core/schema';
import { AtomLinkSchema, atom } from '../../atom/schema';

/**
 * DDIC (Data Dictionary) namespace schemas
 *
 * Namespace: http://www.sap.com/adt/ddic
 * Prefix: ddic
 */

/**
 * DDIC namespace object
 * Use ddic.uri for namespace URI, ddic.prefix for prefix
 */
export const ddic = createNamespace({
  uri: 'http://www.sap.com/adt/ddic',
  prefix: 'ddic',
});

/**
 * Domain namespace (different from general DDIC)
 * Namespace: http://www.sap.com/dictionary/domain
 * Prefix: doma
 */
export const doma = createNamespace({
  uri: 'http://www.sap.com/dictionary/domain',
  prefix: 'doma',
});

/**
 * Helper to create a simple text element schema
 */
const textElem = (name: string) =>
  doma.elem(
    name,
    doma.schema({
      tag: `doma:${name}`,
      fields: { text: { kind: 'text' as const } },
    } as const)
  );

/**
 * Domain type information schema (nested under content)
 */
export const DomaTypeInformationSchema = doma.schema({
  tag: 'doma:typeInformation',
  fields: {
    datatype: textElem('datatype'),
    length: textElem('length'),
    decimals: textElem('decimals'),
  },
} as const);

/**
 * Domain output information schema (nested under content)
 */
export const DomaOutputInformationSchema = doma.schema({
  tag: 'doma:outputInformation',
  fields: {
    length: textElem('length'),
    style: textElem('style'),
    conversionExit: textElem('conversionExit'),
    signExists: textElem('signExists'),
    lowercase: textElem('lowercase'),
    ampmFormat: textElem('ampmFormat'),
  },
} as const);

/**
 * Domain fixed value schema (for value table)
 */
export const DomaFixedValueSchema = doma.schema({
  tag: 'doma:fixValue',
  fields: {
    position: textElem('position'),
    low: textElem('low'),
    high: textElem('high'),
    text: textElem('text'),
  },
} as const);

/**
 * Domain fixed values container schema
 */
export const DomaFixValuesSchema = doma.schema({
  tag: 'doma:fixValues',
  fields: {
    fixValue: doma.elems('fixValue', DomaFixedValueSchema),
  },
} as const);

/**
 * Domain value information schema (nested under content)
 */
export const DomaValueInformationSchema = doma.schema({
  tag: 'doma:valueInformation',
  fields: {
    valueTableRef: textElem('valueTableRef'),
    appendExists: textElem('appendExists'),
    fixValues: doma.elem('fixValues', DomaFixValuesSchema),
  },
} as const);

/**
 * Domain content schema (contains all domain-specific data)
 */
export const DomaContentSchema = doma.schema({
  tag: 'doma:content',
  fields: {
    typeInformation: doma.elem('typeInformation', DomaTypeInformationSchema),
    outputInformation: doma.elem(
      'outputInformation',
      DomaOutputInformationSchema
    ),
    valueInformation: doma.elem('valueInformation', DomaValueInformationSchema),
  },
} as const);

/**
 * Complete ABAP Domain schema
 */
export const DdicDomainSchema = doma.schema({
  tag: 'doma:domain',
  ns: {
    doma: doma.uri,
    adtcore: adtcore.uri,
    atom: atom.uri,
  },
  fields: {
    // ADT core object attributes
    ...AdtCoreObjectFields,

    // Atom links
    links: {
      kind: 'elems' as const,
      name: 'atom:link',
      schema: AtomLinkSchema,
    },

    // Domain content (all domain-specific data is nested here)
    content: doma.elem('content', DomaContentSchema),
  },
} as const);

/**
 * ABAP Domain ADT Schema
 *
 * Provides bidirectional XML ↔ TypeScript transformation for ABAP domains
 *
 * @example
 * ```typescript
 * // Parse XML to typed object
 * const domainObj = DdicDomainAdtSchema.fromAdtXml(xmlString);
 * console.log(domainObj.name); // "ZTEST_DOMAIN"
 *
 * // Build XML from typed object
 * const xml = DdicDomainAdtSchema.toAdtXml(domainObj, { xmlDecl: true });
 * ```
 */
export const DdicDomainAdtSchema = createAdtSchema(DdicDomainSchema);
