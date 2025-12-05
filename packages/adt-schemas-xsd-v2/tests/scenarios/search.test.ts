import { expect } from 'vitest';
import { fixtures } from 'adt-fixtures';
import { Scenario, runScenario, type SchemaType } from './base/scenario';
import { adtcore, type AdtcoreData } from '../../src/schemas/index';

/**
 * Test for Repository Search (Object References) - GET /sap/bc/adt/repository/informationsystem/search
 *
 * Fixture: Real SAP XML response with object reference list
 * Source: GET /sap/bc/adt/repository/informationsystem/search?operation=quickSearch&query=ZCL
 *
 * Note: adtcore schema has multiple root elements. For quickSearch, the response uses 'objectReferences'.
 * Use AdtcoreData (InferXsdMerged) to access all element fields as optional.
 */
class SearchScenario extends Scenario<typeof adtcore> {
  readonly schema = adtcore;
  readonly fixtures = [fixtures.repository.search.quickSearch];

  validateParsed(data: SchemaType<typeof adtcore>): void {
    // Cast to AdtcoreData (InferXsdMerged) to access all element fields
    const merged = data as AdtcoreData;

    // Validate we got object reference array - fully typed!
    expect(merged.objectReference).toBeDefined();
    expect(Array.isArray(merged.objectReference)).toBe(true);
    expect(merged.objectReference).toHaveLength(2);

    // Validate first object reference
    const firstRef = merged.objectReference?.[0];
    expect(firstRef?.uri).toBe('/sap/bc/adt/oo/classes/zcl_test');
    expect(firstRef?.type).toBe('CLAS/OC');
    expect(firstRef?.name).toBe('ZCL_TEST');
    expect(firstRef?.packageName).toBe('$TMP');
    expect(firstRef?.description).toBe('Test class');

    // Validate second object reference
    const secondRef = merged.objectReference?.[1];
    expect(secondRef?.uri).toBe('/sap/bc/adt/oo/classes/zcl_another');
    expect(secondRef?.type).toBe('CLAS/OC');
    expect(secondRef?.name).toBe('ZCL_ANOTHER');
    expect(secondRef?.description).toBe('Another class');
  }

  validateBuilt(xml: string): void {
    // Root element with namespace
    expect(xml).toContain('xmlns:core="http://www.sap.com/adt/core"');
    expect(xml).toContain('objectReferences');

    // Object references
    expect(xml).toContain('objectReference');
    expect(xml).toContain('ZCL_TEST');
    expect(xml).toContain('ZCL_ANOTHER');

    // Attributes
    expect(xml).toContain('core:uri=');
    expect(xml).toContain('core:type="CLAS/OC"');
    expect(xml).toContain('core:name=');
  }
}

// Run the scenario
runScenario(new SearchScenario());
