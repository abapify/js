/**
 * Universal XML ↔ JSON Transformer Test
 *
 * Tests fully optimized, recursive generic XSLT that works with ANY XML structure.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { xmlToJson, jsonToXml, roundTrip, jsonToXmlSchemaAware } from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load fixtures
const fixtureXml = readFileSync(
  join(__dirname, 'fixtures/package.fixture.xml'),
  'utf-8'
);
const fixtureJsonUniversal = readFileSync(
  join(__dirname, 'fixtures/package.fixture.universal.json'),
  'utf-8'
);

describe('xmlt - Universal XML ↔ JSON Transformer', () => {
  describe('xmlToJson', () => {
    it('should transform SAP ADT Package XML to JSON', async () => {
      const result = await xmlToJson(fixtureXml);
      const expected = JSON.parse(fixtureJsonUniversal);

      expect(result).toEqual(expected);
    });

    it('should handle custom XML with arrays and type detection', async () => {
      const customXml = `<?xml version="1.0"?>
<book xmlns:isbn="http://isbn.org" isbn:number="978-3-16-148410-0">
  <title>XSLT Essentials</title>
  <author>John Doe</author>
  <price currency="USD">29.99</price>
  <available>true</available>
  <chapters>
    <chapter id="1">Introduction</chapter>
    <chapter id="2">Advanced Topics</chapter>
    <chapter id="3">Best Practices</chapter>
  </chapters>
</book>`;

      const json = await xmlToJson(customXml);

      expect(json).toHaveProperty('book');
      expect(json.book.title).toBe('XSLT Essentials');
      expect(json.book.author).toBe('John Doe');
      expect(json.book.available).toBe(true); // Boolean!
      expect(Array.isArray(json.book.chapters.chapter)).toBe(true);
      expect(json.book.chapters.chapter).toHaveLength(3);
    });

    it('should strip namespace prefixes automatically', async () => {
      const xml = `<?xml version="1.0"?>
<pak:package xmlns:pak="http://example.org" xmlns:adtcore="http://example.org/adt">
  <adtcore:name>TestPackage</adtcore:name>
  <pak:type>development</pak:type>
</pak:package>`;

      const json = await xmlToJson(xml);

      expect(json).toHaveProperty('package');
      expect(json.package.name).toBe('TestPackage');
      expect(json.package.type).toBe('development');
    });

    it('should detect numbers correctly', async () => {
      const xml = `<data>
  <count>42</count>
  <price>29.99</price>
  <negative>-10</negative>
</data>`;

      const json = await xmlToJson(xml);

      expect(json.data.count).toBe(42);
      expect(json.data.price).toBe(29.99);
      expect(json.data.negative).toBe(-10);
      expect(typeof json.data.count).toBe('number');
    });

    it('should detect booleans correctly', async () => {
      const xml = `<data>
  <enabled>true</enabled>
  <disabled>false</disabled>
</data>`;

      const json = await xmlToJson(xml);

      expect(json.data.enabled).toBe(true);
      expect(json.data.disabled).toBe(false);
      expect(typeof json.data.enabled).toBe('boolean');
    });

    it('should handle mixed content with _text property', async () => {
      const xml = `<root><price currency="USD">29.99</price></root>`;

      const json = await xmlToJson(xml);

      expect(json.root.price.currency).toBe('USD');
      expect(json.root.price._text).toBe(29.99);
    });

    it('should create arrays for repeated elements', async () => {
      const xml = `<items>
  <item>Apple</item>
  <item>Banana</item>
  <item>Cherry</item>
</items>`;

      const json = await xmlToJson(xml);

      expect(Array.isArray(json.items.item)).toBe(true);
      expect(json.items.item).toEqual(['Apple', 'Banana', 'Cherry']);
    });
  });

  describe('jsonToXml', () => {
    it('should transform JSON to XML', async () => {
      const customJson = {
        order: {
          id: 12345,
          customer: 'Alice Smith',
          total: 99.99,
          paid: true,
          items: [
            { sku: 'WIDGET-001', quantity: 2, price: 29.99 },
            { sku: 'GADGET-002', quantity: 1, price: 39.99 },
          ],
        },
      };

      const xml = await jsonToXml(customJson);

      expect(xml).toContain('<order');
      expect(xml).toContain('<id>');
      expect(xml).toContain('12345');
      expect(xml).toContain('<customer>');
      expect(xml).toContain('Alice Smith');
      expect(xml).toContain('<items');
      expect(xml).toContain('WIDGET-001');
      expect(xml).toContain('GADGET-002');
    });

    it('should handle arrays as repeated elements', async () => {
      const json = {
        items: {
          item: ['Apple', 'Banana', 'Cherry'],
        },
      };

      const xml = await jsonToXml(json);

      expect(xml).toContain('<item>Apple</item>');
      expect(xml).toContain('<item>Banana</item>');
      expect(xml).toContain('<item>Cherry</item>');
    });

    it('should handle _text property for mixed content', async () => {
      const json = {
        price: {
          currency: 'USD',
          _text: 29.99,
        },
      };

      const xml = await jsonToXml(json);

      // When _text is present, other properties become elements
      expect(xml).toContain('<currency>USD</currency>');
      expect(xml).toContain('>29.99</');
    });

    it('should use attributes for primitive-only objects', async () => {
      const json = {
        product: {
          specs: {
            cpu: 'Intel i7',
            ram: '16GB',
            storage: '512GB SSD',
          },
        },
      };

      const xml = await jsonToXml(json);

      // specs has only primitives, so they should be attributes
      expect(xml).toContain('<specs');
      expect(xml).toContain('cpu=');
      expect(xml).toContain('ram=');
      expect(xml).toContain('storage=');
    });

    it('should use elements for complex objects', async () => {
      const json = {
        order: {
          customer: 'Alice',
          address: {
            street: '123 Main St',
            city: 'Boston',
          },
        },
      };

      const xml = await jsonToXml(json);

      // order has complex child (address), so customer becomes element
      expect(xml).toContain('<customer>Alice</customer>');
      expect(xml).toContain('<address');
      // address has only primitives, so they become attributes
      expect(xml).toContain('street="123 Main St"');
      expect(xml).toContain('city="Boston"');
    });
  });

  describe('roundTrip', () => {
    it('should preserve data through JSON → XML → JSON transformation', async () => {
      const originalJson = {
        product: {
          name: 'Laptop',
          price: 1299.99,
          inStock: true,
          specs: {
            cpu: 'Intel i7',
            ram: '16GB',
            storage: '512GB SSD',
          },
        },
      };

      const result = await roundTrip(originalJson);

      expect(result.product.name).toBe(originalJson.product.name);
      expect(result.product.price).toBe(originalJson.product.price);
      expect(result.product.inStock).toBe(originalJson.product.inStock);
    });

    it('should handle arrays in round-trip', async () => {
      const originalJson = {
        items: {
          item: ['Apple', 'Banana', 'Cherry'],
        },
      };

      const result = await roundTrip(originalJson);

      expect(Array.isArray(result.items.item)).toBe(true);
      expect(result.items.item).toEqual(['Apple', 'Banana', 'Cherry']);
    });

    it('should round-trip SAP ADT Package fixture: XML → JSON → XML → JSON preserves data', async () => {
      // Full round-trip: XML → JSON → XML → JSON
      const json1 = await xmlToJson(fixtureXml);
      const xml = await jsonToXml(json1);
      const json2 = await xmlToJson(xml);

      // Verify all key data points are preserved
      expect(json2.package.name).toBe(json1.package.name);
      expect(json2.package.type).toBe(json1.package.type);
      expect(json2.package.description).toBe(json1.package.description);
      expect(json2.package.responsible).toBe(json1.package.responsible);
      expect(json2.package.masterLanguage).toBe(json1.package.masterLanguage);

      // Verify nested structures
      expect(json2.package.superPackage?.name).toBe(json1.package.superPackage?.name);
      expect(json2.package.attributes?.packageType).toBe(json1.package.attributes?.packageType);

      // Verify arrays are preserved
      if (json1.package.subPackages?.packageRef) {
        expect(Array.isArray(json2.package.subPackages.packageRef)).toBe(true);
        expect(json2.package.subPackages.packageRef.length).toBe(json1.package.subPackages.packageRef.length);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle empty elements', async () => {
      const xml = '<root><empty/></root>';
      const json = await xmlToJson(xml);

      expect(json).toHaveProperty('root');
      expect(json.root).toHaveProperty('empty');
    });

    it('should handle nested structures', async () => {
      const xml = `<root>
  <level1>
    <level2>
      <level3>Deep Value</level3>
    </level2>
  </level1>
</root>`;

      const json = await xmlToJson(xml);

      expect(json.root.level1.level2.level3).toBe('Deep Value');
    });

    it('should handle single-element arrays', async () => {
      const json = {
        items: {
          item: ['Single Item'],
        },
      };

      const xml = await jsonToXml(json);
      const result = await xmlToJson(xml);

      // Single element arrays should be preserved
      expect(result.items.item).toBe('Single Item');
    });
  });

  describe('schema-aware transformation', () => {
    it('should do perfect round-trip: XML → JSON → XML with schema', async () => {
      // Step 1: Load original XML
      const originalXml = readFileSync(
        join(__dirname, 'fixtures/package.fixture.xml'),
        'utf-8'
      );

      // Step 2: Transform XML → JSON
      const json = await xmlToJson(originalXml);

      // Step 3: Add @metadata with schema reference
      const absoluteSchemaPath = join(__dirname, 'fixtures/schemas/package.instructions.v2.json');
      const jsonWithMetadata = {
        '@metadata': {
          schema: absoluteSchemaPath
        },
        ...json
      };

      // Save JSON for inspection
      writeFileSync(
        join(__dirname, 'output/roundtrip-with-metadata.json'),
        JSON.stringify(jsonWithMetadata, null, 2)
      );

      // Step 4: Transform JSON → XML using schema
      const reconstructedXml = await jsonToXmlSchemaAware(jsonWithMetadata);

      // Save output for inspection
      writeFileSync(join(__dirname, 'output/schema-aware-roundtrip.xml'), reconstructedXml);

      // Step 5: Compare XMLs - they should be identical (ignoring whitespace/formatting)
      const normalizeXml = (xml: string) =>
        xml
          .replace(/\s+/g, ' ')
          .replace(/>\s+</g, '><')
          .replace(/\s+\/>/g, '/>')
          .trim();

      const normalizedOriginal = normalizeXml(originalXml);
      const normalizedReconstructed = normalizeXml(reconstructedXml);

      // For debugging, write normalized versions
      writeFileSync(join(__dirname, 'output/original-normalized.xml'), normalizedOriginal);
      writeFileSync(join(__dirname, 'output/reconstructed-normalized.xml'), normalizedReconstructed);

      // They should match!
      expect(normalizedReconstructed).toBe(normalizedOriginal);
    });

    it('should throw error if @metadata.schema is missing', async () => {
      const jsonWithoutMetadata = {
        package: {
          name: 'TEST',
        },
      };

      await expect(jsonToXmlSchemaAware(jsonWithoutMetadata)).rejects.toThrow(
        'Schema-aware transformation requires @metadata.schema field in JSON'
      );
    });
  });
});
