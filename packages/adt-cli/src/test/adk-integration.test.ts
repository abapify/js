import { ObjectRegistry } from '../lib/objects/registry';
import { AdkObjectHandler } from '../lib/objects/adk-bridge';
import { ADTClient } from '../lib/adt-client';

// Mock ADTClient for testing
class MockADTClient extends ADTClient {
  constructor() {
    super({} as any);
  }

  async request() {
    return new Response(
      '<?xml version="1.0"?><clas:class xmlns:clas="http://www.sap.com/adt/oo/classes" xmlns:adtcore="http://www.sap.com/adt/core" adtcore:name="ZCL_TEST"><clas:content><clas:visibility>PUBLIC</clas:visibility><clas:final>false</clas:final><clas:abstract>false</clas:abstract></clas:content></clas:class>'
    );
  }
}

describe('ADK Integration', () => {
  it('should return AdkObjectHandler for CLAS objects', () => {
    const mockClient = new MockADTClient();
    const handler = ObjectRegistry.get('CLAS', mockClient);

    expect(handler).toBeInstanceOf(AdkObjectHandler);
  });

  it('should support CLAS object type', () => {
    expect(ObjectRegistry.isSupported('CLAS')).toBe(true);
  });

  it('should return supported types including CLAS', () => {
    const types = ObjectRegistry.getSupportedTypes();
    expect(types).toContain('CLAS');
  });
});
