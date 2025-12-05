import { expect } from 'vitest';
import { fixtures } from 'adt-fixtures';
import { Scenario, runScenario, type SchemaType } from './base/scenario';
import { transportmanagmentCreate, transportmanagmentSingle } from '../../src/schemas/index';

/**
 * Test for task response - when fetching a task by number:
 * - object_type="T" indicates this is a task
 * - tm:request contains the PARENT request (NO tasks inside!)
 * - tm:task at root level contains the task itself
 */
class TmTaskScenario extends Scenario<typeof transportmanagmentSingle> {
  readonly schema = transportmanagmentSingle;
  readonly fixtures = [fixtures.transport.singleTask];

  validateParsed(data: SchemaType<typeof transportmanagmentSingle>): void {
    // Root attributes - object_type="T" indicates task
    expect(data.object_type).toBe('T');
    expect(data.name).toBe('DEVK900002');  // Task number in root
    
    // Parent request is included (NO tasks inside when fetching a task!)
    expect(data.request).toBeDefined();
    expect(data.request?.number).toBe('DEVK900001');  // Parent request number
    // When fetching a task, parent request has no tasks (empty or undefined)
    expect(data.request?.task?.length ?? 0).toBe(0);
    
    // Task at root level
    expect(data.task).toBeDefined();
    expect(data.task).toHaveLength(1);
    expect(data.task?.[0].number).toBe('DEVK900002');
    expect(data.task?.[0].parent).toBe('DEVK900001');
    expect(data.task?.[0].abap_object).toHaveLength(1);
    expect(data.task?.[0].abap_object?.[0].name).toBe('ZCL_TEST_CLASS');
  }

  validateBuilt(xml: string): void {
    expect(xml).toContain('tm:object_type="T"');
    expect(xml).toContain('<tm:request');
    expect(xml).toContain('<tm:task');
    // Both request and task should be at root level (siblings, not nested)
    // The built XML will have request first, then task - both direct children of root
  }
}

class TmCreateScenario extends Scenario<typeof transportmanagmentCreate> {
  readonly schema = transportmanagmentCreate;
  readonly fixtures = [fixtures.transport.create];

  validateParsed(data: SchemaType<typeof transportmanagmentCreate>): void {
    expect(data.useraction).toBe('newrequest');
    expect(data.request).toBeDefined();
    expect(data.request?.desc).toBe('Test transport description');
    expect(data.request?.type).toBe('K');
    expect(data.request?.target).toBe('LOCAL');
    expect(data.request?.task).toHaveLength(1);
    expect(data.request?.task?.[0].owner).toBe('TESTUSER');
  }

  validateBuilt(xml: string): void {
    // SAP requires namespace-prefixed attributes
    expect(xml).toContain('tm:useraction="newrequest"');
    expect(xml).toContain('tm:desc=');
    expect(xml).toContain('tm:type="K"');
    expect(xml).toContain('tm:owner=');
  }
}

class TmFullScenario extends Scenario<typeof transportmanagmentSingle> {
  readonly schema = transportmanagmentSingle;
  readonly fixtures = [fixtures.transport.single];

  validateParsed(data: SchemaType<typeof transportmanagmentSingle>): void {
    // Root tm: attributes
    expect(data.object_type).toBe('K');
    
    // Root adtcore: attributes (inherited from AdtObject)
    expect(data.type).toBe('RQRQ');
    expect(data.name).toBe('DEVK900001');
    // changedAt is parsed as Date object
    expect(data.changedAt).toEqual(new Date('2025-11-29T19:31:44Z'));
    expect(data.changedBy).toBe('DEVELOPER');
    expect(data.createdBy).toBe('DEVELOPER');
    
    // Request attributes
    expect(data.request).toBeDefined();
    expect(data.request?.number).toBe('DEVK900001');
    expect(data.request?.owner).toBe('DEVELOPER');
    expect(data.request?.desc).toBe('Test workbench request');
    expect(data.request?.status).toBe('D');
    expect(data.request?.type).toBe('K');
    expect(data.request?.target).toBe('PRD');
    expect(data.request?.uri).toBe('/sap/bc/adt/cts/transportrequests/DEVK900001');
    
    // Long description
    expect(data.request?.long_desc).toContain('longer description');
    
    // Multiple tasks (array handling)
    expect(data.request?.task).toHaveLength(2);
    
    // Task 1: Modifiable, 2 objects
    expect(data.request?.task?.[0].number).toBe('DEVK900002');
    expect(data.request?.task?.[0].owner).toBe('DEVELOPER');
    expect(data.request?.task?.[0].status).toBe('D');
    expect(data.request?.task?.[0].abap_object).toHaveLength(2);
    expect(data.request?.task?.[0].abap_object?.[0].name).toBe('ZCL_TEST_CLASS');
    expect(data.request?.task?.[0].abap_object?.[1].name).toBe('ZTEST_FUNCTION_GROUP');
    
    // Task 2: Released, 1 object, different owner
    expect(data.request?.task?.[1].number).toBe('DEVK900003');
    expect(data.request?.task?.[1].owner).toBe('DEVELOPER2');
    expect(data.request?.task?.[1].status).toBe('R');
    expect(data.request?.task?.[1].abap_object).toHaveLength(1);
    expect(data.request?.task?.[1].abap_object?.[0].name).toBe('ZTEST_REPORT');
  }

  validateBuilt(xml: string): void {
    // Root element with namespace
    expect(xml).toContain('xmlns:tm="http://www.sap.com/cts/adt/tm"');
    expect(xml).toContain('tm:object_type="K"');
    
    // Inherited adtcore attributes (currently output with tm: prefix - known limitation)
    // TODO: ts-xsd should use adtcore: prefix for inherited attributes
    expect(xml).toContain('tm:type="RQRQ"');
    expect(xml).toContain('tm:name="DEVK900001"');
    expect(xml).toContain('tm:changedBy="DEVELOPER"');
    
    // Request with prefixed attributes
    expect(xml).toContain('tm:number="DEVK900001"');
    expect(xml).toContain('tm:owner="DEVELOPER"');
    expect(xml).toContain('tm:status="D"');
    expect(xml).toContain('tm:uri="/sap/bc/adt/cts/transportrequests/DEVK900001"');
    
    // Nested elements
    expect(xml).toContain('<tm:task');
    expect(xml).toContain('<tm:abap_object');
    expect(xml).toContain('tm:name="ZCL_TEST_CLASS"');
  }
}

// Run all transport management scenarios
runScenario(new TmTaskScenario());
runScenario(new TmCreateScenario());
runScenario(new TmFullScenario());