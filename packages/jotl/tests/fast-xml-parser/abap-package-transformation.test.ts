import test from 'node:test';
import assert from 'node:assert/strict';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { transform } from '../../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FIXTURE_DIR = join(__dirname, 'fixtures');
const PACKAGE_FIXTURE = JSON.parse(
  readFileSync(join(FIXTURE_DIR, 'abapgit_examples.devc.json'), 'utf-8')
);
const EXPECTED_XML = readFileSync(
  join(FIXTURE_DIR, 'abapgit_examples.devc.xml'),
  'utf-8'
);

const NAMESPACES = {
  pak: 'http://www.sap.com/adt/packages',
  adtcore: 'http://www.sap.com/adt/core',
  atom: 'http://www.w3.org/2005/Atom',
};

const builder = new XMLBuilder({
  attributeNamePrefix: '@_',
  ignoreAttributes: false,
  format: true,
  indentBy: '        ',
  suppressEmptyNode: true,
  suppressBooleanAttributes: false,
  attributeValueProcessor: (name, value) => String(value), // Fix: Convert booleans to strings
});

const parser = new XMLParser({
  attributeNamePrefix: '@_',
  ignoreAttributes: false,
  removeNSPrefix: false,
  parseAttributeValue: false,
  parseTagValue: false,
  trimValues: true,
});

const sanitizeXml = (xml: string) =>
  xml.replace(/^\uFEFF?<\?xml[^>]*\?>\s*/i, '').trim();

test('fast-xml-parser scenario transforms ABAP package fixture to expected XML', () => {
  const schema = {
    'pak:package': {
      '@_xmlns:pak': NAMESPACES.pak,
      '@_xmlns:adtcore': NAMESPACES.adtcore,
      '@_adtcore:responsible': { $ref: 'responsible' },
      '@_adtcore:masterLanguage': { $ref: 'masterLanguage' },
      '@_adtcore:name': { $ref: 'name' },
      '@_adtcore:type': { $ref: 'type' },
      '@_adtcore:changedAt': { $ref: 'changedAt' },
      '@_adtcore:version': { $ref: 'version' },
      '@_adtcore:createdAt': { $ref: 'createdAt' },
      '@_adtcore:changedBy': { $ref: 'changedBy' },
      '@_adtcore:createdBy': { $ref: 'createdBy' },
      '@_adtcore:description': { $ref: 'description' },
      '@_adtcore:descriptionTextLimit': { $ref: 'descriptionTextLimit' },
      '@_adtcore:language': { $ref: 'language' },
      'atom:link': {
        $ref: 'link',
        $schema: {
          '@_xmlns:atom': NAMESPACES.atom,
          '@_href': { $ref: 'href' },
          '@_rel': { $ref: 'rel' },
          '@_type': { $ref: 'type' },
          '@_title': { $ref: 'title' },
        },
      },
      'pak:attributes': {
        $ref: 'attributes',
        $schema: {
          '@_pak:packageType': { $ref: 'packageType' },
          '@_pak:isPackageTypeEditable': { $ref: 'isPackageTypeEditable' },
          '@_pak:isAddingObjectsAllowed': { $ref: 'isAddingObjectsAllowed' },
          '@_pak:isAddingObjectsAllowedEditable': {
            $ref: 'isAddingObjectsAllowedEditable',
          },
          '@_pak:isEncapsulated': { $ref: 'isEncapsulated' },
          '@_pak:isEncapsulationEditable': {
            $ref: 'isEncapsulationEditable',
          },
          '@_pak:isEncapsulationVisible': {
            $ref: 'isEncapsulationVisible',
          },
          '@_pak:recordChanges': { $ref: 'recordChanges' },
          '@_pak:isRecordChangesEditable': {
            $ref: 'isRecordChangesEditable',
          },
          '@_pak:isSwitchVisible': { $ref: 'isSwitchVisible' },
          '@_pak:languageVersion': { $ref: 'languageVersion' },
          '@_pak:isLanguageVersionVisible': {
            $ref: 'isLanguageVersionVisible',
          },
          '@_pak:isLanguageVersionEditable': {
            $ref: 'isLanguageVersionEditable',
          },
        },
      },
      'pak:superPackage': {
        $ref: 'superPackage',
        $schema: {
          '@_adtcore:uri': { $ref: 'uri' },
          '@_adtcore:type': { $ref: 'type' },
          '@_adtcore:name': { $ref: 'name' },
          '@_adtcore:description': { $ref: 'description' },
        },
      },
      'pak:applicationComponent': {
        $ref: 'applicationComponent',
        $schema: {
          '@_pak:name': { $ref: 'name' },
          '@_pak:description': { $ref: 'description' },
          '@_pak:isVisible': { $ref: 'isVisible' },
          '@_pak:isEditable': { $ref: 'isEditable' },
        },
      },
      'pak:transport': {
        'pak:softwareComponent': {
          $ref: 'transport.softwareComponent',
          $schema: {
            '@_pak:name': { $ref: 'name' },
            '@_pak:description': { $ref: 'description' },
            '@_pak:isVisible': { $ref: 'isVisible' },
            '@_pak:isEditable': { $ref: 'isEditable' },
          },
        },
        'pak:transportLayer': {
          $ref: 'transport.transportLayer',
          $schema: {
            '@_pak:name': { $ref: 'name' },
            '@_pak:description': { $ref: 'description' },
            '@_pak:isVisible': { $ref: 'isVisible' },
            '@_pak:isEditable': { $ref: 'isEditable' },
          },
        },
      },
      'pak:useAccesses': {
        $ref: 'useAccesses',
        $schema: {
          '@_pak:isVisible': { $ref: 'isVisible' },
        },
      },
      'pak:packageInterfaces': {
        $ref: 'packageInterfaces',
        $schema: {
          '@_pak:isVisible': { $ref: 'isVisible' },
        },
      },
      'pak:subPackages': {
        'pak:packageRef': {
          $ref: 'subPackages.packageRef',
          $schema: {
            '@_adtcore:uri': { $ref: 'uri' },
            '@_adtcore:type': { $ref: 'type' },
            '@_adtcore:name': { $ref: 'name' },
            '@_adtcore:description': { $ref: 'description' },
          },
        },
      },
    },
  };

  const fastXmlObject = transform(PACKAGE_FIXTURE.package, schema as any);
  const generatedXmlBody = builder.build(fastXmlObject);
  const xmlWithDeclaration = generatedXmlBody.startsWith('<?xml')
    ? generatedXmlBody
    : `<?xml version="1.0" encoding="utf-8"?>\n${generatedXmlBody}`;

  const expectedStructure = parser.parse(sanitizeXml(EXPECTED_XML));
  const actualStructure = parser.parse(sanitizeXml(xmlWithDeclaration));

  assert.deepStrictEqual(actualStructure, expectedStructure);
});
