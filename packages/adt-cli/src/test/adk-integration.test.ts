import { describe, it, expect } from 'vitest';
import { ObjectRegistry } from '../lib/objects/registry';
import { AdkObjectHandler } from '../lib/objects/adk-bridge';

describe('ADK Integration', () => {
  it('should return AdkObjectHandler for CLAS objects', () => {
    const handler = ObjectRegistry.get('CLAS');
    expect(handler).toBeInstanceOf(AdkObjectHandler);
  });

  it('should create ObjectRegistry without errors', () => {
    expect(ObjectRegistry).toBeDefined();
  });
});
