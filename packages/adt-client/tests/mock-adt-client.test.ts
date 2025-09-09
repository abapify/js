import { describe, it, expect, beforeEach } from 'vitest';
import { MockAdtClient, createMockAdtClient } from './utils/mock-adt-client';

describe('MockAdtClient', () => {
  let mockClient: MockAdtClient;

  beforeEach(() => {
    mockClient = createMockAdtClient();
  });

  describe('Connection Management', () => {
    it('should start disconnected', () => {
      expect(mockClient.isConnected()).toBe(false);
    });

    it('should connect successfully', async () => {
      await mockClient.connect({
        baseUrl: 'https://test.sap.com',
        username: 'testuser',
        password: 'testpass',
      });
      expect(mockClient.isConnected()).toBe(true);
    });

    it('should disconnect successfully', async () => {
      await mockClient.connect({
        baseUrl: 'https://test.sap.com',
        username: 'testuser',
        password: 'testpass',
      });
      await mockClient.disconnect();
      expect(mockClient.isConnected()).toBe(false);
    });
  });

  describe('Repository Service', () => {
    it('should return mock objects', async () => {
      const object = await mockClient.repository.getObject(
        'CLAS',
        'ZCL_TEST_CLASS'
      );

      expect(object).toBeDefined();
      expect(object.objectType).toBe('CLAS');
      expect(object.objectName).toBe('ZCL_TEST_CLASS');
      expect(object.packageName).toBe('$TMP');
      expect(object.responsible).toBe('TESTUSER');
    });

    it('should return mock source code', async () => {
      const source = await mockClient.repository.getObjectSource(
        'CLAS',
        'ZCL_TEST_CLASS'
      );

      expect(source).toContain('Mock source code');
      expect(source).toContain('ZCL_TEST_CLASS');
    });

    it('should throw error for non-existent object', async () => {
      await expect(
        mockClient.repository.getObject('CLAS', 'NON_EXISTENT')
      ).rejects.toThrow('Object CLAS NON_EXISTENT not found');
    });

    it('should create new objects', async () => {
      const result = await mockClient.repository.createObject(
        'PROG',
        'Z_NEW_PROGRAM',
        'REPORT z_new_program.'
      );

      expect(result.success).toBe(true);

      // Should be able to retrieve the created object
      const object = await mockClient.repository.getObject(
        'PROG',
        'Z_NEW_PROGRAM'
      );
      expect(object.objectName).toBe('Z_NEW_PROGRAM');
    });

    it('should update existing objects', async () => {
      const result = await mockClient.repository.updateObject(
        'CLAS',
        'ZCL_TEST_CLASS',
        'updated content'
      );
      expect(result.success).toBe(true);
    });

    it('should fail to update non-existent objects', async () => {
      const result = await mockClient.repository.updateObject(
        'CLAS',
        'NON_EXISTENT',
        'content'
      );
      expect(result.success).toBe(false);
      expect(result.messages).toContain('Object not found');
    });
  });

  describe('CTS Service', () => {
    it('should return transport list', async () => {
      const transports = await mockClient.cts.getTransports();

      expect(transports).toBeDefined();
      expect(transports.transports).toBeInstanceOf(Array);
      expect(transports.totalCount).toBeGreaterThanOrEqual(0);
    });

    it('should create new transport', async () => {
      const result = await mockClient.cts.createTransport({
        description: 'Test transport',
        targetSystem: 'PRD',
      });

      expect(result.success).toBe(true);
      expect(result.transportNumber).toMatch(/^T\d+$/);
    });

    it('should release transport', async () => {
      // First create a transport
      const createResult = await mockClient.cts.createTransport({
        description: 'Test transport',
        targetSystem: 'PRD',
      });

      // Then release it
      const releaseResult = await mockClient.cts.releaseTransport(
        createResult.transportNumber!
      );
      expect(releaseResult.success).toBe(true);
    });

    it('should fail to release non-existent transport', async () => {
      const result = await mockClient.cts.releaseTransport('NON_EXISTENT');
      expect(result.success).toBe(false);
      expect(result.messages).toContain('Transport not found');
    });
  });

  describe('ATC Service', () => {
    it('should return ATC results', async () => {
      const result = await mockClient.atc.run({
        objectType: 'CLAS',
        objectName: 'ZCL_TEST_CLASS',
      });

      expect(result).toBeDefined();
      expect(result.findings).toBeInstanceOf(Array);
      expect(result.summary).toBeDefined();
      expect(result.summary.total).toBe(1);
      expect(result.summary.warnings).toBe(1);
    });

    it('should return empty results for objects without findings', async () => {
      const result = await mockClient.atc.run({
        objectType: 'PROG',
        objectName: 'Z_CLEAN_PROGRAM',
      });

      expect(result.findings).toHaveLength(0);
      expect(result.summary.total).toBe(0);
    });
  });

  describe('Discovery Service', () => {
    it('should return system discovery info', async () => {
      const discovery = await mockClient.discovery.getDiscovery();

      expect(discovery).toBeDefined();
      expect(discovery.systemInfo).toBeDefined();
      expect(discovery.systemInfo.systemId).toBe('TST');
      expect(discovery.systemInfo.client).toBe('100');
      expect(discovery.systemInfo.supportedFeatures).toContain('ATC');
      expect(discovery.systemInfo.supportedFeatures).toContain('CTS');
    });
  });

  describe('Mock Data Management', () => {
    it('should allow adding custom mock objects', () => {
      mockClient.addMockObject('INTF', 'ZIF_TEST_INTERFACE', {
        description: 'Custom test interface',
      });

      // Should be able to retrieve the custom object
      expect(async () => {
        const object = await mockClient.repository.getObject(
          'INTF',
          'ZIF_TEST_INTERFACE'
        );
        expect(object.description).toBe('Custom test interface');
      }).not.toThrow();
    });

    it('should allow adding custom ATC results', async () => {
      mockClient.addMockAtcResult('PROG', 'Z_TEST_PROGRAM', {
        findings: [
          {
            messageId: 'CUSTOM001',
            messageText: 'Custom finding',
            severity: 'error',
            location: {
              uri: '/sap/bc/adt/programs/z_test_program',
              line: 5,
              column: 1,
            },
          },
        ],
        summary: {
          total: 1,
          errors: 1,
          warnings: 0,
          infos: 0,
        },
      });

      const result = await mockClient.atc.run({
        objectType: 'PROG',
        objectName: 'Z_TEST_PROGRAM',
      });

      expect(result.findings).toHaveLength(1);
      expect(result.findings[0].messageId).toBe('CUSTOM001');
      expect(result.summary.errors).toBe(1);
    });

    it('should clear mock data', async () => {
      // Add custom data
      mockClient.addMockObject('CLAS', 'ZCL_CUSTOM');

      // Clear all data
      mockClient.clearMockData();

      // Should have default data again
      const object = await mockClient.repository.getObject(
        'CLAS',
        'ZCL_TEST_CLASS'
      );
      expect(object).toBeDefined();

      // Custom object should be gone
      await expect(
        mockClient.repository.getObject('CLAS', 'ZCL_CUSTOM')
      ).rejects.toThrow();
    });
  });
});
