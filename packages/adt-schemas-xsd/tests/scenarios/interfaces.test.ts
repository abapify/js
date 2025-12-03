import { expect } from 'vitest';
import { fixtures } from 'adt-fixtures';
import { Scenario, runScenario, type SchemaType } from './base/scenario';
import { interfaces } from '../../src/schemas/index';

/**
 * Test for ABAP interface response - GET /sap/bc/adt/oo/interfaces/{name}
 * 
 * Fixture: ZIF_SAMPLE_INTERFACE (sanitized from real SAP response)
 * Source: GET /sap/bc/adt/oo/interfaces/zif_sample_interface
 * 
 * Note: Interface schema extends AbapOoObject which inherits from AbapSourceObject
 * and AdtObject. TypeScript type inference doesn't fully resolve inherited properties
 * through the extends chain, so we use runtime assertions with type casting.
 */
class InterfacesScenario extends Scenario<typeof interfaces> {
  readonly schema = interfaces;
  readonly fixtures = [fixtures.oo.interface];

  validateParsed(data: SchemaType<typeof interfaces>): void {
    // Cast to any for runtime property access (inherited properties not inferred)
    const parsed = data as Record<string, unknown>;
    
    // Inherited abapoo: attributes
    expect(parsed.modeled).toBe(false);
    
    // Inherited abapsource: attributes
    expect(parsed.sourceUri).toBe('source/main');
    expect(parsed.fixPointArithmetic).toBe(false);
    expect(parsed.activeUnicodeCheck).toBe(false);
    
    // Inherited adtcore: attributes
    expect(parsed.name).toBe('ZIF_SAMPLE_INTERFACE');
    expect(parsed.type).toBe('INTF/OI');
    expect(parsed.description).toBe('Sample interface');
    expect(parsed.responsible).toBe('DEVELOPER');
    expect(parsed.masterLanguage).toBe('EN');
    expect(parsed.version).toBe('active');
    expect(parsed.changedBy).toBe('DEVELOPER');
    expect(parsed.createdBy).toBe('DEVELOPER');
    
    // Package reference
    expect(parsed.packageRef).toBeDefined();
    const packageRef = parsed.packageRef as Record<string, unknown>;
    expect(packageRef?.name).toBe('$TMP');
    expect(packageRef?.type).toBe('DEVC/K');
    
    // Syntax configuration
    expect(parsed.syntaxConfiguration).toBeDefined();
    const syntaxConfig = parsed.syntaxConfiguration as Record<string, unknown>;
    const language = syntaxConfig?.language as Record<string, unknown>;
    expect(language?.version).toBe('X');
    expect(language?.description).toBe('Standard ABAP');
    
    // Links (atom:link elements)
    expect(parsed.link).toBeDefined();
    expect(Array.isArray(parsed.link)).toBe(true);
    expect((parsed.link as unknown[])?.length).toBeGreaterThan(0);
  }

  validateBuilt(xml: string): void {
    // Root element with namespace (schema uses 'interfaces' prefix)
    expect(xml).toContain('xmlns:interfaces="http://www.sap.com/adt/oo/interfaces"');
    
    // Interface attributes (prefixed)
    expect(xml).toContain('interfaces:modeled="false"');
    expect(xml).toContain('interfaces:sourceUri="source/main"');
    
    // Inherited adtcore attributes
    expect(xml).toContain('interfaces:name="ZIF_SAMPLE_INTERFACE"');
    expect(xml).toContain('interfaces:type="INTF/OI"');
  }
}

// Run the scenario
runScenario(new InterfacesScenario());
