import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { IntfSpec } from '../namespaces/intf';
import { ClassSpec } from '../namespaces/class';
import { DomainSpec } from '../namespaces/ddic';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const fixturesPath = join(__dirname, '../../../adk/fixtures');

describe('ADK Fixture Round-trip Tests', () => {
  it('should parse and serialize zif_test.intf.xml', () => {
    const xml = readFileSync(join(fixturesPath, 'zif_test.intf.xml'), 'utf-8');

    const parsed = IntfSpec.fromXMLString(xml);

    // Verify core attributes
    expect(parsed.core.name).toBe('ZIF_PEPL_TEST_NESTED1');
    expect(parsed.core.type).toBe('INTF/OI');
    expect(parsed.core.description).toBe('Test PEPL iterface');
    expect(parsed.core.responsible).toBe('CB9980003374');
    expect(parsed.core.masterLanguage).toBe('EN');

    // Verify OO attributes
    expect(parsed.oo.modeled).toBe('false');

    // Verify source attributes
    expect(parsed.source.fixPointArithmetic).toBe('false');
    expect(parsed.source.activeUnicodeCheck).toBe('false');

    // Verify atom links
    expect(parsed.links).toBeDefined();
    expect(parsed.links!.length).toBeGreaterThan(0);

    // Verify syntax configuration
    expect(parsed.syntaxConfiguration).toBeDefined();
    expect(parsed.syntaxConfiguration!.language.version).toBe('5');
    expect(parsed.syntaxConfiguration!.language.description).toBe(
      'ABAP for Cloud Development'
    );

    // Test serialization
    const serialized = parsed.toXMLString();
    expect(serialized).toContain('intf:abapInterface');
    expect(serialized).toContain('adtcore:name="ZIF_PEPL_TEST_NESTED1"');
    expect(serialized).toContain(
      'xmlns:intf="http://www.sap.com/adt/oo/interfaces"'
    );
  });

  it('should parse and serialize zcl_test.clas.xml', () => {
    const xml = readFileSync(join(fixturesPath, 'zcl_test.clas.xml'), 'utf-8');

    const parsed = ClassSpec.fromXMLString(xml);

    // Verify core attributes
    expect(parsed.core.name).toBe('ZCL_PEPL_TEST2');
    expect(parsed.core.type).toBe('CLAS/OC');
    expect(parsed.core.description).toBe('PEPL test class');
    expect(parsed.core.responsible).toBe('CB9980003374');

    // Verify class attributes
    expect(parsed.class.final).toBe('true');
    expect(parsed.class.abstract).toBe('false');
    expect(parsed.class.visibility).toBe('public');
    expect(parsed.class.category).toBe('generalObjectType');

    // Verify OO attributes
    expect(parsed.oo.modeled).toBe('false');

    // Verify source attributes
    expect(parsed.source.fixPointArithmetic).toBe('true');
    expect(parsed.source.activeUnicodeCheck).toBe('false');

    // Verify includes
    expect(parsed.include).toBeDefined();
    expect(parsed.include!.length).toBe(5); // definitions, implementations, macros, testclasses, main

    const includeTypes = parsed.include!.map((inc) => inc.includeType);
    expect(includeTypes).toContain('definitions');
    expect(includeTypes).toContain('implementations');
    expect(includeTypes).toContain('macros');
    expect(includeTypes).toContain('testclasses');
    expect(includeTypes).toContain('main');

    // Test serialization
    const serialized = parsed.toXMLString();
    expect(serialized).toContain('class:abapClass');
    expect(serialized).toContain('adtcore:name="ZCL_PEPL_TEST2"');
    expect(serialized).toContain(
      'xmlns:class="http://www.sap.com/adt/oo/classes"'
    );
  });

  it('should parse and serialize zdo_test.doma.xml', () => {
    const xml = readFileSync(join(fixturesPath, 'zdo_test.doma.xml'), 'utf-8');

    const parsed = DomainSpec.fromXMLString(xml);

    // Verify core attributes
    expect(parsed.core.name).toBe('ZDO_PEPL_TEST_DOMAIN');
    expect(parsed.core.type).toBe('DOMA/DD');
    expect(parsed.core.description).toBe('Test PEPL domain');
    expect(parsed.core.responsible).toBe('CB9980003374');

    // Verify domain data
    expect(parsed.dataType).toBe('CHAR');
    expect(parsed.length).toBe('10');
    expect(parsed.decimals).toBe('0');
    expect(parsed.outputLength).toBe('10');
    expect(parsed.conversionExit).toBe('ALPHA');
    expect(parsed.valueTable).toBe('MARA');

    // Verify fixed values
    expect(parsed.fixedValuesContainer).toBeDefined();
    expect(parsed.fixedValuesContainer!.fixedValue).toBeDefined();
    expect(parsed.fixedValuesContainer!.fixedValue!.length).toBe(2);

    const fixedValues = parsed.fixedValuesContainer!.fixedValue!;
    expect(fixedValues[0].lowValue).toBe('01');
    expect(fixedValues[0].description).toBe('Option 1');
    expect(fixedValues[1].lowValue).toBe('02');
    expect(fixedValues[1].description).toBe('Option 2');

    // Test domain data getter
    const domainData = parsed.getDomainData();
    expect(domainData.dataType).toBe('CHAR');
    expect(domainData.fixedValues).toHaveLength(2);

    // Test serialization
    const serialized = parsed.toXMLString();
    expect(serialized).toContain('ddic:domain');
    expect(serialized).toContain('adtcore:name="ZDO_PEPL_TEST_DOMAIN"');
    expect(serialized).toContain('xmlns:ddic="http://www.sap.com/adt/ddic"');
  });
});
