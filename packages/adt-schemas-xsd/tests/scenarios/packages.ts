import { expect } from 'vitest';
import { fixtures } from 'adt-fixtures';
import { Scenario, type SchemaType } from './base/scenario';
import { packagesV1 } from '../../src/schemas/index';

/**
 * Test for package response - GET /sap/bc/adt/packages/{name}
 * 
 * Fixture: $TMP package (system temporary package)
 * Source: GET /sap/bc/adt/packages/%24TMP
 */
export class PackagesScenario extends Scenario<typeof packagesV1> {
  readonly schema = packagesV1;
  readonly fixtures = [fixtures.packages.tmp];

  validateParsed(data: SchemaType<typeof packagesV1>): void {
    // Root adtcore: attributes
    expect(data.name).toBe('$TMP');
    expect(data.type).toBe('DEVC/K');
    expect(data.description).toBe('Temporary Objects (never transported!)');
    expect(data.responsible).toBe('SAP');
    expect(data.masterLanguage).toBe('EN');
    expect(data.language).toBe('EN');
    expect(data.version).toBe('active');
    expect(data.changedBy).toBe('SAP');
    expect(data.createdBy).toBe('SAP');
    
    // Package attributes
    expect(data.attributes).toBeDefined();
    expect(data.attributes?.packageType).toBe('development');
    expect(data.attributes?.isEncapsulated).toBe(false);
    expect(data.attributes?.isAddingObjectsAllowed).toBe(false);
    expect(data.attributes?.recordChanges).toBe(false);
    
    // Transport properties
    expect(data.transport).toBeDefined();
    expect(data.transport?.softwareComponent?.name).toBe('LOCAL');
    expect(data.transport?.softwareComponent?.description).toBe('Local Developments (No Automatic Transport)');
    
    // Subpackages
    expect(data.subPackages).toBeDefined();
    expect(data.subPackages?.packageRef).toBeDefined();
    expect(data.subPackages?.packageRef?.length).toBeGreaterThan(0);
    expect(data.subPackages?.packageRef?.[0].name).toBe('$TEST_TO_DELETE');
    expect(data.subPackages?.packageRef?.[0].type).toBe('DEVC/K');
  }

  validateBuilt(xml: string): void {
    // Root element with namespace (schema uses 'packages' prefix)
    expect(xml).toContain('xmlns:packages="http://www.sap.com/adt/packages"');
    expect(xml).toContain('packages:name="$TMP"');
    
    // Package attributes
    expect(xml).toContain('packages:packageType="development"');
    expect(xml).toContain('packages:isEncapsulated="false"');
    
    // Transport
    expect(xml).toContain('<packages:transport');
    expect(xml).toContain('<packages:softwareComponent');
    expect(xml).toContain('packages:name="LOCAL"');
    
    // Subpackages
    expect(xml).toContain('<packages:subPackages');
    expect(xml).toContain('<packages:packageRef');
  }
}
