import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdkFacade } from './adk-facade.js';
import { objectRegistry } from '@abapify/adk';
import type { ConnectionManager } from '../../client/connection-manager.js';

describe('AdkFacade', () => {
  let mockConnectionManager: jest.Mocked<ConnectionManager>;
  let adkFacade: AdkFacade;

  beforeEach(() => {
    mockConnectionManager = {
      request: vi.fn(),
    } as any;

    adkFacade = new AdkFacade(mockConnectionManager);
  });

  describe('getSupportedObjectTypes', () => {
    it('should return supported object types from registry', () => {
      const supportedTypes = adkFacade.getSupportedObjectTypes();

      // Should include CLAS and INTF which we registered
      expect(supportedTypes).toContain('CLAS');
      expect(supportedTypes).toContain('INTF');
      expect(Array.isArray(supportedTypes)).toBe(true);
    });
  });

  describe('isObjectTypeSupported', () => {
    it('should return true for supported types', () => {
      expect(adkFacade.isObjectTypeSupported('CLAS')).toBe(true);
      expect(adkFacade.isObjectTypeSupported('INTF')).toBe(true);
    });

    it('should return false for unsupported types', () => {
      expect(adkFacade.isObjectTypeSupported('UNSUPPORTED')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(adkFacade.isObjectTypeSupported('clas')).toBe(true);
      expect(adkFacade.isObjectTypeSupported('intf')).toBe(true);
    });
  });

  describe('getRegistryInfo', () => {
    it('should return registry information for debugging', () => {
      const info = adkFacade.getRegistryInfo();

      expect(Array.isArray(info)).toBe(true);
      expect(info.length).toBeGreaterThan(0);

      // Should have entries for registered types
      const sapTypes = info.map((entry) => entry.sapType);
      expect(sapTypes).toContain('CLAS');
      expect(sapTypes).toContain('INTF');
    });
  });

  describe('getObject', () => {
    it('should reject unsupported object types', async () => {
      await expect(
        adkFacade.getObject('UNSUPPORTED', 'TEST_NAME')
      ).rejects.toThrow('Unsupported object type: UNSUPPORTED');
    });

    it('should include list of supported types in error message', async () => {
      try {
        await adkFacade.getObject('UNSUPPORTED', 'TEST_NAME');
      } catch (error) {
        expect(error.message).toContain('CLAS');
        expect(error.message).toContain('INTF');
      }
    });
  });
});

// Integration test to verify registry auto-registration works
describe('ADK Object Registry Integration', () => {
  it('should have auto-registered Class and Interface objects', () => {
    const supportedTypes = objectRegistry.getSupportedTypes();

    expect(supportedTypes).toContain('CLAS');
    expect(supportedTypes).toContain('INTF');
  });

  it('should be able to create objects from registry', () => {
    // Mock XML - simplified for testing
    const mockClassXml = `<?xml version="1.0" encoding="UTF-8"?>
      <abapoo:class 
        xmlns:abapoo="http://www.sap.com/adt/oo" 
        xmlns:adtcore="http://www.sap.com/adt/core"
        adtcore:name="ZCL_TEST"
        adtcore:type="CLAS/OC">
      </abapoo:class>`;

    expect(() => {
      objectRegistry.createFromXml('CLAS', mockClassXml);
    }).not.toThrow();
  });
});
