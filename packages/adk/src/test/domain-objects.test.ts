import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Interface } from '../objects/interface';
import { Class } from '../objects/class';
import { Domain } from '../objects/domain';
import { createFromXml } from '../base/generic-factory';
import { DomainSpec } from '../namespaces/ddic';
import { IntfSpec } from '../namespaces/intf';
import { ClassSpec } from '../namespaces/class';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const fixturesPath = join(__dirname, '../../../adk/fixtures');

describe('ADK Domain Objects Tests', () => {
  it('should create Interface from XML and delegate properties correctly', () => {
    const xml = readFileSync(join(fixturesPath, 'zif_test.intf.xml'), 'utf-8');

    const interfaceObj = createFromXml(xml, Interface, IntfSpec);

    // Test property delegation
    expect(interfaceObj.kind).toBe('Interface');
    expect(interfaceObj.spec.core.name).toBe('ZIF_PEPL_TEST_NESTED1');
    expect(interfaceObj.spec.core.type).toBe('INTF/OI');
    expect(interfaceObj.spec.core.description).toBe('Test PEPL iterface');
    expect(interfaceObj.spec.core.responsible).toBe('CB9980003374');
    expect(interfaceObj.spec.core.masterLanguage).toBe('EN');
    expect(interfaceObj.spec.oo.modeled).toBe('false');
    expect(interfaceObj.spec.source.fixPointArithmetic).toBe('false');
    expect(interfaceObj.spec.source.activeUnicodeCheck).toBe('false');

    // Test serialization
    const serialized = interfaceObj.toAdtXml();
    expect(serialized).toContain('intf:abapInterface');
    expect(serialized).toContain('adtcore:name="ZIF_PEPL_TEST_NESTED1"');

    // Test property setters
    interfaceObj.spec.core.name = 'ZIF_NEW_NAME';
    expect(interfaceObj.spec.core.name).toBe('ZIF_NEW_NAME');
  });

  it('should create Class from XML and delegate properties correctly', () => {
    const xml = readFileSync(join(fixturesPath, 'zcl_test.clas.xml'), 'utf-8');

    const classObj = createFromXml(xml, Class, ClassSpec);

    // Test property delegation
    expect(classObj.kind).toBe('Class');
    expect(classObj.spec.core.name).toBe('ZCL_PEPL_TEST2');
    expect(classObj.spec.core.type).toBe('CLAS/OC');
    expect(classObj.spec.core.description).toBe('PEPL test class');
    expect(classObj.spec.core.responsible).toBe('CB9980003374');
    expect(classObj.spec.core.masterLanguage).toBe('EN');
    expect(classObj.spec.class.final).toBe('true');
    expect(classObj.spec.class.abstract).toBe('false');
    expect(classObj.spec.class.visibility).toBe('public');
    expect(classObj.spec.oo.modeled).toBe('false');
    expect(classObj.spec.source.fixPointArithmetic).toBe('true');
    expect(classObj.spec.source.activeUnicodeCheck).toBe('false');

    // Test serialization
    const serialized = classObj.toAdtXml();
    expect(serialized).toContain('class:abapClass');
    expect(serialized).toContain('adtcore:name="ZCL_PEPL_TEST2"');

    // Test property setters
    classObj.spec.core.name = 'ZCL_NEW_NAME';
    expect(classObj.spec.core.name).toBe('ZCL_NEW_NAME');
  });

  it('should create Domain from XML and delegate properties correctly', () => {
    const xml = readFileSync(join(fixturesPath, 'zdo_test.doma.xml'), 'utf-8');

    const domainObj = createFromXml(xml, Domain, DomainSpec);

    // Test property delegation
    expect(domainObj.kind).toBe('Domain');
    expect(domainObj.spec.core.name).toBe('ZDO_PEPL_TEST_DOMAIN');
    expect(domainObj.spec.core.type).toBe('DOMA/DD');
    expect(domainObj.spec.core.description).toBe('Test PEPL domain');
    expect(domainObj.spec.core.responsible).toBe('CB9980003374');
    expect(domainObj.spec.core.masterLanguage).toBe('EN');
    expect(domainObj.spec.dataType).toBe('CHAR');
    expect(domainObj.spec.length).toBe('10');
    expect(domainObj.spec.decimals).toBe('0');
    expect(domainObj.spec.outputLength).toBe('10');
    expect(domainObj.spec.conversionExit).toBe('ALPHA');
    expect(domainObj.spec.valueTable).toBe('MARA');

    // Test domain data getter
    const domainData = domainObj.getDomainData();
    expect(domainData.dataType).toBe('CHAR');
    expect(domainData.fixedValues).toHaveLength(2);
    expect(domainData.fixedValues?.[0].lowValue).toBe('01');
    expect(domainData.fixedValues?.[0].description).toBe('Option 1');

    // Test serialization
    const serialized = domainObj.toAdtXml();
    expect(serialized).toContain('ddic:domain');
    expect(serialized).toContain('adtcore:name="ZDO_PEPL_TEST_DOMAIN"');

    // Test property setters
    domainObj.spec.core.name = 'ZDO_NEW_NAME';
    expect(domainObj.spec.core.name).toBe('ZDO_NEW_NAME');
  });

  it('should create new objects and set properties', () => {
    // Test Interface creation
    const interfaceObj = new Interface();
    interfaceObj.spec.core = interfaceObj.spec.core || {};
    interfaceObj.spec.oo = interfaceObj.spec.oo || {};
    interfaceObj.spec.core.name = 'ZIF_TEST';
    interfaceObj.spec.core.type = 'INTF/OI';
    interfaceObj.spec.core.description = 'Test interface';
    interfaceObj.spec.oo.modeled = 'false';

    expect(interfaceObj.spec.core.name).toBe('ZIF_TEST');
    expect(interfaceObj.spec.core.type).toBe('INTF/OI');
    expect(interfaceObj.spec.core.description).toBe('Test interface');
    expect(interfaceObj.spec.oo.modeled).toBe('false');

    // Test Class creation
    const classObj = new Class();
    classObj.spec.core = classObj.spec.core || {};
    classObj.spec.class = classObj.spec.class || {};
    classObj.spec.core.name = 'ZCL_TEST';
    classObj.spec.core.type = 'CLAS/OC';
    classObj.spec.core.description = 'Test class';
    classObj.spec.class.final = 'true';
    classObj.spec.class.visibility = 'public';

    expect(classObj.spec.core.name).toBe('ZCL_TEST');
    expect(classObj.spec.core.type).toBe('CLAS/OC');
    expect(classObj.spec.core.description).toBe('Test class');
    expect(classObj.spec.class.final).toBe('true');
    expect(classObj.spec.class.visibility).toBe('public');

    // Test Domain creation
    const domainObj = new Domain();
    domainObj.spec.core = domainObj.spec.core || {};
    domainObj.spec.core.name = 'ZDO_TEST';
    domainObj.spec.core.type = 'DOMA/DD';
    domainObj.spec.core.description = 'Test domain';
    domainObj.spec.dataType = 'CHAR';
    domainObj.spec.length = '20';

    expect(domainObj.spec.core.name).toBe('ZDO_TEST');
    expect(domainObj.spec.core.type).toBe('DOMA/DD');
    expect(domainObj.spec.core.description).toBe('Test domain');
    expect(domainObj.spec.dataType).toBe('CHAR');
    expect(domainObj.spec.length).toBe('20');
  });
});
