import { expect } from 'vitest';
import { fixtures } from 'adt-fixtures';
import { Scenario, runScenario, type SchemaType } from './base/scenario';
import { classes } from '../../src/schemas/index';

/**
 * Test for ABAP class response - GET /sap/bc/adt/oo/classes/{name}
 * 
 * Fixture: ZCL_SAMPLE_CLASS (sanitized from real SAP response)
 * Source: GET /sap/bc/adt/oo/classes/zcl_sample_class
 */
class ClassesScenario extends Scenario<typeof classes> {
  readonly schema = classes;
  readonly fixtures = [fixtures.oo.class];

  validateParsed(data: SchemaType<typeof classes>): void {
    // Root class: attributes
    expect(data.final).toBe(true);
    expect(data.abstract).toBe(false);
    expect(data.visibility).toBe('public');
    expect(data.category).toBe('generalObjectType');
    expect(data.sharedMemoryEnabled).toBe(false);
    
    // Inherited abapoo: attributes
    expect(data.modeled).toBe(false);
    
    // Inherited abapsource: attributes
    expect(data.fixPointArithmetic).toBe(true);
    expect(data.activeUnicodeCheck).toBe(true);
    
    // Inherited adtcore: attributes
    expect(data.name).toBe('ZCL_SAMPLE_CLASS');
    expect(data.type).toBe('CLAS/OC');
    expect(data.description).toBe('Sample class');
    expect(data.responsible).toBe('DEVELOPER');
    expect(data.masterLanguage).toBe('EN');
    expect(data.version).toBe('active');
    expect(data.changedBy).toBe('DEVELOPER');
    expect(data.createdBy).toBe('DEVELOPER');
    
    // Package reference
    expect(data.packageRef).toBeDefined();
    expect(data.packageRef?.name).toBe('$TMP');
    expect(data.packageRef?.type).toBe('DEVC/K');
    
    // Syntax configuration
    expect(data.syntaxConfiguration).toBeDefined();
    expect(data.syntaxConfiguration?.language?.version).toBe('X');
    expect(data.syntaxConfiguration?.language?.description).toBe('Standard ABAP');
    
    // Class includes (definitions, implementations, macros, testclasses, main)
    expect(data.include).toBeDefined();
    expect(data.include).toHaveLength(5);
    
    // Verify include types
    const includeTypes = data.include?.map(inc => inc.includeType);
    expect(includeTypes).toContain('definitions');
    expect(includeTypes).toContain('implementations');
    expect(includeTypes).toContain('macros');
    expect(includeTypes).toContain('testclasses');
    expect(includeTypes).toContain('main');
    
    // Check main include details
    const mainInclude = data.include?.find(inc => inc.includeType === 'main');
    expect(mainInclude).toBeDefined();
    expect(mainInclude?.sourceUri).toBe('source/main');
    expect(mainInclude?.type).toBe('CLAS/I');
  }

  validateBuilt(xml: string): void {
    // Root element with namespace (schema uses 'classes' prefix)
    expect(xml).toContain('xmlns:classes="http://www.sap.com/adt/oo/classes"');
    
    // Class attributes (prefixed)
    expect(xml).toContain('classes:final="true"');
    expect(xml).toContain('classes:abstract="false"');
    expect(xml).toContain('classes:visibility="public"');
    expect(xml).toContain('classes:category="generalObjectType"');
    
    // Nested elements
    expect(xml).toContain('<classes:include');
    expect(xml).toContain('classes:includeType="main"');
  }
}

// Run the scenario
runScenario(new ClassesScenario());
