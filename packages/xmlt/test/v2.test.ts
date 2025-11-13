/**
 * v2 - Pure JavaScript/TypeScript XML Generator Tests
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { jsonToXmlV2 } from '../src/v2/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('v2 - Pure JS XML Generator', () => {
  it('should generate simple XML with namespaces', () => {
    const json = {
      book: {
        title: 'XSLT Essentials',
        author: 'John Doe',
      },
    };

    const schema = {
      book: {
        $namespace: 'lib',
        $xmlns: {
          lib: 'http://example.com/library',
        },
        $properties: {
          $attributes: true,
        },
      },
    };

    const xml = jsonToXmlV2(json, { schema });

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<lib:book');
    expect(xml).toContain('xmlns:lib="http://example.com/library"');
    expect(xml).toContain('title="XSLT Essentials"');
    expect(xml).toContain('author="John Doe"');
  });

  it('should generate XML with nested elements', () => {
    const json = {
      order: {
        id: '12345',
        customer: {
          name: 'Alice',
          email: 'alice@example.com',
        },
      },
    };

    const schema = {
      order: {
        $properties: {
          $attributes: true,
        },
        customer: {
          $properties: {
            $attributes: true,
          },
        },
      },
    };

    const xml = jsonToXmlV2(json, { schema });

    expect(xml).toContain('<order id="12345">');
    expect(xml).toContain('<customer name="Alice" email="alice@example.com"/>');
  });

  it('should handle arrays as repeated elements', () => {
    const json = {
      items: {
        item: ['Apple', 'Banana', 'Cherry'],
      },
    };

    const schema = {
      items: {},
    };

    const xml = jsonToXmlV2(json, { schema });

    expect(xml).toContain('<item>Apple</item>');
    expect(xml).toContain('<item>Banana</item>');
    expect(xml).toContain('<item>Cherry</item>');
  });

  it('should generate SAP ADT Package XML using v2 schema', () => {
    // Load test data
    const json = JSON.parse(
      readFileSync(join(__dirname, 'fixtures/package.fixture.universal.json'), 'utf-8')
    );

    // Load v2 schema
    const schema = JSON.parse(
      readFileSync(join(__dirname, 'fixtures/schemas/v2/package.schema.json'), 'utf-8')
    );

    const xml = jsonToXmlV2(json, { schema });

    // Verify structure
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<pak:package');
    expect(xml).toContain('xmlns:pak="http://www.sap.com/adt/packages"');
    expect(xml).toContain('xmlns:adtcore="http://www.sap.com/adt/core"');
    expect(xml).toContain('xmlns:atom="http://www.w3.org/2005/Atom"');
    expect(xml).toContain('adtcore:name="$ABAPGIT_EXAMPLES"');
    expect(xml).toContain('<atom:link');
    expect(xml).toContain('<pak:attributes');
    expect(xml).toContain('<pak:superPackage');
  });

  it('should respect attribute ordering from schema', () => {
    const json = {
      package: {
        language: 'EN',
        name: 'TEST',
        type: 'DEVC/K',
        responsible: 'USER',
      },
    };

    const schema = {
      package: {
        $namespace: 'pak',
        $xmlns: {
          pak: 'http://www.sap.com/adt/packages',
          adtcore: 'http://www.sap.com/adt/core',
        },
        $order: ['responsible', 'name', 'type', 'language'],
        $properties: {
          $attributes: true,
          $namespace: 'adtcore',
        },
      },
    };

    const xml = jsonToXmlV2(json, { schema, indent: false });

    // Check that attributes appear in specified order
    const match = xml.match(
      /adtcore:responsible="USER" adtcore:name="TEST" adtcore:type="DEVC\/K" adtcore:language="EN"/
    );
    expect(match).toBeTruthy();
  });

  it('should support recursive namespace inheritance with overrides', () => {
    const json = {
      library: {
        books: {
          book: [
            { title: 'Book 1', author: 'Author 1' },
            { title: 'Book 2', author: 'Author 2' },
          ],
          metadata: {
            total: '2',
          },
        },
      },
    };

    const schema = {
      library: {
        $namespace: 'lib',
        $recursive: true,
        $xmlns: {
          lib: 'http://example.com/library',
          meta: 'http://example.com/metadata',
        },
        books: {
          // Inherits lib: namespace from parent
          book: {
            // Also inherits lib: namespace
            $properties: {
              $attributes: true,
            },
          },
          metadata: {
            // Override with different namespace
            $namespace: 'meta',
            $properties: {
              $attributes: true,
            },
          },
        },
      },
    };

    const xml = jsonToXmlV2(json, { schema });

    // Root element has lib: namespace
    expect(xml).toContain('<lib:library');
    expect(xml).toContain('xmlns:lib="http://example.com/library"');
    expect(xml).toContain('xmlns:meta="http://example.com/metadata"');

    // Children inherit lib: namespace
    expect(xml).toContain('<lib:books>');
    expect(xml).toContain('<lib:book title="Book 1" author="Author 1"/>');
    expect(xml).toContain('<lib:book title="Book 2" author="Author 2"/>');

    // Metadata overrides with meta: namespace
    expect(xml).toContain('<meta:metadata total="2"/>');

    // No link: elements inherit atom:, but not lib: children
    expect(xml).not.toContain('<atom:');
  });
});
