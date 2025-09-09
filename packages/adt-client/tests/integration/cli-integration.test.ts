import { describe, it, expect, beforeEach } from 'vitest';
import { createMockAdtClient } from '../utils/mock-adt-client';
import type { AdtClient } from '../../src/client/adt-client';

describe('CLI Integration Tests', () => {
  let mockClient: AdtClient;

  beforeEach(() => {
    mockClient = createMockAdtClient();
  });

  describe('ATC Workflow', () => {
    it('should run complete ATC check workflow', async () => {
      // Setup: Add object with ATC findings
      const mockClient = createMockAdtClient();
      mockClient.addMockObject('CLAS', 'ZCL_DIRTY_CLASS', {
        description: 'Class with code issues',
      });

      mockClient.addMockAtcResult('CLAS', 'ZCL_DIRTY_CLASS', {
        findings: [
          {
            messageId: 'NAMING_001',
            messageText: 'Variable name should start with lv_',
            severity: 'warning',
            location: {
              uri: '/sap/bc/adt/oo/classes/zcl_dirty_class',
              line: 15,
              column: 8,
            },
          },
          {
            messageId: 'PERFORMANCE_001',
            messageText: 'Use SELECT SINGLE instead of SELECT',
            severity: 'error',
            location: {
              uri: '/sap/bc/adt/oo/classes/zcl_dirty_class',
              line: 25,
              column: 4,
            },
          },
        ],
        summary: {
          total: 2,
          errors: 1,
          warnings: 1,
          infos: 0,
        },
      });

      await mockClient.connect({
        baseUrl: 'https://test.sap.com',
        username: 'testuser',
        password: 'testpass',
      });

      // Execute ATC check
      const atcResult = await mockClient.atc.run({
        objectType: 'CLAS',
        objectName: 'ZCL_DIRTY_CLASS',
      });

      // Verify results
      expect(atcResult.summary.total).toBe(2);
      expect(atcResult.summary.errors).toBe(1);
      expect(atcResult.summary.warnings).toBe(1);
      expect(atcResult.findings).toHaveLength(2);

      // Check specific findings
      const errorFinding = atcResult.findings.find(
        (f) => f.severity === 'error'
      );
      expect(errorFinding?.messageText).toContain('SELECT SINGLE');

      const warningFinding = atcResult.findings.find(
        (f) => f.severity === 'warning'
      );
      expect(warningFinding?.messageText).toContain('lv_');
    });

    it('should handle clean code with no findings', async () => {
      const mockClient = createMockAdtClient();
      mockClient.addMockObject('CLAS', 'ZCL_CLEAN_CLASS');

      await mockClient.connect({
        baseUrl: 'https://test.sap.com',
        username: 'testuser',
        password: 'testpass',
      });

      const atcResult = await mockClient.atc.run({
        objectType: 'CLAS',
        objectName: 'ZCL_CLEAN_CLASS',
      });

      expect(atcResult.summary.total).toBe(0);
      expect(atcResult.findings).toHaveLength(0);
    });
  });

  describe('Transport Workflow', () => {
    it('should create transport and add objects', async () => {
      const mockClient = createMockAdtClient();
      await mockClient.connect({
        baseUrl: 'https://test.sap.com',
        username: 'testuser',
        password: 'testpass',
      });

      // Create transport
      const createResult = await mockClient.cts.createTransport({
        description: 'Test development transport',
        targetSystem: 'PRD',
      });

      expect(createResult.success).toBe(true);
      expect(createResult.transportNumber).toMatch(/^T\d+$/);

      // Get transport list to verify creation
      const transports = await mockClient.cts.getTransports();
      const createdTransport = transports.transports.find(
        (t) => t.transportNumber === createResult.transportNumber
      );

      expect(createdTransport).toBeDefined();
      expect(createdTransport?.description).toBe('Test development transport');
      expect(createdTransport?.status).toBe('modifiable');
    });

    it('should release transport', async () => {
      const mockClient = createMockAdtClient();
      await mockClient.connect({
        baseUrl: 'https://test.sap.com',
        username: 'testuser',
        password: 'testpass',
      });

      // Create transport first
      const createResult = await mockClient.cts.createTransport({
        description: 'Transport to release',
        targetSystem: 'PRD',
      });

      // Release it
      const releaseResult = await mockClient.cts.releaseTransport(
        createResult.transportNumber!
      );

      expect(releaseResult.success).toBe(true);
    });
  });

  describe('Object Management Workflow', () => {
    it('should create, read, update, delete objects', async () => {
      const mockClient = createMockAdtClient();
      await mockClient.connect({
        baseUrl: 'https://test.sap.com',
        username: 'testuser',
        password: 'testpass',
      });

      const objectType = 'PROG';
      const objectName = 'Z_CRUD_TEST';

      // Create
      const createResult = await mockClient.repository.createObject(
        objectType,
        objectName,
        "REPORT z_crud_test.\nWRITE: 'Hello World'."
      );
      expect(createResult.success).toBe(true);

      // Read
      const object = await mockClient.repository.getObject(
        objectType,
        objectName
      );
      expect(object.objectName).toBe(objectName);
      expect(object.objectType).toBe(objectType);

      // Get source
      const source = await mockClient.repository.getObjectSource(
        objectType,
        objectName
      );
      expect(source).toContain('Mock source code');
      expect(source).toContain(objectName);

      // Update
      const updateResult = await mockClient.repository.updateObject(
        objectType,
        objectName,
        "REPORT z_crud_test.\nWRITE: 'Updated Hello World'."
      );
      expect(updateResult.success).toBe(true);

      // Delete
      const deleteResult = await mockClient.repository.deleteObject(
        objectType,
        objectName
      );
      expect(deleteResult.success).toBe(true);

      // Verify deletion
      await expect(
        mockClient.repository.getObject(objectType, objectName)
      ).rejects.toThrow('not found');
    });
  });

  describe('Discovery Workflow', () => {
    it('should get system information', async () => {
      const mockClient = createMockAdtClient();
      await mockClient.connect({
        baseUrl: 'https://test.sap.com',
        username: 'testuser',
        password: 'testpass',
      });

      const discovery = await mockClient.discovery.getDiscovery();

      expect(discovery.systemInfo).toBeDefined();
      expect(discovery.systemInfo.systemId).toBe('TST');
      expect(discovery.systemInfo.client).toBe('100');
      expect(discovery.systemInfo.supportedFeatures).toContain('ATC');
      expect(discovery.systemInfo.supportedFeatures).toContain('CTS');
      expect(discovery.systemInfo.supportedFeatures).toContain('REPOSITORY');
    });
  });

  describe('Error Scenarios', () => {
    it('should handle non-existent objects gracefully', async () => {
      const mockClient = createMockAdtClient();
      await mockClient.connect({
        baseUrl: 'https://test.sap.com',
        username: 'testuser',
        password: 'testpass',
      });

      await expect(
        mockClient.repository.getObject('CLAS', 'NON_EXISTENT_CLASS')
      ).rejects.toThrow('Object CLAS NON_EXISTENT_CLASS not found');
    });

    it('should handle transport operations on non-existent transports', async () => {
      const mockClient = createMockAdtClient();
      await mockClient.connect({
        baseUrl: 'https://test.sap.com',
        username: 'testuser',
        password: 'testpass',
      });

      const result = await mockClient.cts.releaseTransport(
        'NON_EXISTENT_TRANSPORT'
      );
      expect(result.success).toBe(false);
      expect(result.messages).toContain('Transport not found');
    });
  });
});
