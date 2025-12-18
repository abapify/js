import { expect } from 'vitest';
import { fixtures } from 'adt-fixtures';
import { Scenario, runScenario } from './base/scenario';
import { atc, atcworklist } from '../../src/schemas/index';
import type { InferTypedSchema } from 'ts-xsd';

// Extract types from schemas using ts-xsd's official type extractor
// Generated types now match parse() behavior - content directly without wrapper
type AtcCustomizing = InferTypedSchema<typeof atc>;
type AtcWorklist = InferTypedSchema<typeof atcworklist>;

/**
 * Test for ATC customizing response
 * GET /sap/bc/adt/atc/customizing
 */
class AtcCustomizingScenario extends Scenario<typeof atc> {
  readonly schema = atc;
  readonly fixtures = [fixtures.atc.customizing];

  validateParsed(data: AtcCustomizing): void {
    // Properties
    expect(data.properties).toBeDefined();
    expect(data.properties?.property).toBeDefined();
    expect(data.properties?.property?.length).toBeGreaterThan(0);
    
    // Check for systemCheckVariant property
    const checkVariant = data.properties?.property?.find(p => p.name === 'systemCheckVariant');
    expect(checkVariant).toBeDefined();
    expect(checkVariant?.value).toBe('DEFAULT_CHECK_VARIANT');
    
    // Exemption reasons
    expect(data.exemption).toBeDefined();
    expect(data.exemption?.reasons).toBeDefined();
    expect(data.exemption?.reasons?.reason).toBeDefined();
    expect(data.exemption?.reasons?.reason?.length).toBeGreaterThan(0);
    
    // Check for FPOS reason
    const fposReason = data.exemption?.reasons?.reason?.find(r => r.id === 'FPOS');
    expect(fposReason).toBeDefined();
    expect(fposReason?.justificationMandatory).toBe(true);
  }

  validateBuilt(xml: string): void {
    expect(xml).toContain('xmlns:atc="http://www.sap.com/adt/atc"');
    expect(xml).toContain('systemCheckVariant');
    expect(xml).toContain('exemption');
  }
}

/**
 * Test for ATC worklist response
 * GET /sap/bc/adt/atc/worklists/{id}
 */
class AtcWorklistScenario extends Scenario<typeof atcworklist> {
  readonly schema = atcworklist;
  readonly fixtures = [fixtures.atc.worklist];

  validateParsed(data: AtcWorklist): void {
    // Root attributes
    expect(data.id).toBeDefined();
    expect(data.timestamp).toBeDefined();
    expect(data.usedObjectSet).toBeDefined();
    expect(data.objectSetIsComplete).toBe(true);
    
    // Object sets
    expect(data.objectSets).toBeDefined();
    expect(data.objectSets?.objectSet).toBeDefined();
    expect(data.objectSets?.objectSet?.length).toBeGreaterThanOrEqual(2);
    
    // Check for ALL object set
    const allSet = data.objectSets?.objectSet?.find(s => s.kind === 'ALL');
    expect(allSet).toBeDefined();
    expect(allSet?.title).toBe('All Objects');
    
    // Check for TRANSPORT object set
    const transportSet = data.objectSets?.objectSet?.find(s => s.kind === 'TRANSPORT');
    expect(transportSet).toBeDefined();
    
    // Objects
    expect(data.objects).toBeDefined();
    expect(data.objects?.object).toBeDefined();
    expect(data.objects?.object?.length).toBeGreaterThan(0);
    
    // Check first object has required attributes
    const firstObj = data.objects?.object?.[0];
    expect(firstObj?.uri).toBeDefined();
    expect(firstObj?.type).toBeDefined();
    expect(firstObj?.name).toBeDefined();
    expect(firstObj?.packageName).toBeDefined();
    expect(firstObj?.author).toBeDefined();
    
    // Check for object with findings
    const objWithFindings = data.objects?.object?.find(o => 
      o.findings?.finding && o.findings.finding.length > 0
    );
    expect(objWithFindings).toBeDefined();
    
    // Validate finding structure - findings are parsed with atcfinding namespace attributes
    const finding = objWithFindings?.findings?.finding?.[0] as Record<string, unknown>;
    expect(finding).toBeDefined();
    // Attributes may be parsed with or without namespace prefix depending on schema
    expect(finding?.uri ?? finding?.['atcfinding:uri']).toBeDefined();
    
    // Infos
    expect(data.infos).toBeDefined();
    expect(data.infos?.info).toBeDefined();
    expect(data.infos?.info?.length).toBeGreaterThan(0);
    
    // Check for FINDING_STATS info
    const statsInfo = data.infos?.info?.find(i => i.type === 'FINDING_STATS');
    expect(statsInfo).toBeDefined();
    expect(statsInfo?.description).toBeDefined();
  }

  validateBuilt(xml: string): void {
    expect(xml).toContain('xmlns:atcworklist="http://www.sap.com/adt/atc/worklist"');
    expect(xml).toContain('atcworklist:id=');
    expect(xml).toContain('atcworklist:objectSets');
    expect(xml).toContain('atcworklist:objects');
  }
}

// Run all ATC scenarios
runScenario(new AtcCustomizingScenario());
runScenario(new AtcWorklistScenario());
