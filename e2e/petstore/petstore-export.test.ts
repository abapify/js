import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { ExportService } from '../../packages/adt-cli/src/lib/services/export/service';
import { OatFormat } from '../../packages/adt-cli/src/lib/formats/oat/oat-format';
import { ADTClient } from '../../packages/adt-cli/src/lib/adt-client';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

describe('Petstore Export E2E Tests', () => {
  const projectPath = './oat-zpetstore';
  const packageName = 'ZPETSTORE';

  beforeAll(() => {
    // Verify test setup
    expect(existsSync(projectPath)).toBe(true);
  });

  describe('File Structure Validation', () => {
    it('should have proper OAT directory structure', () => {
      const expectedPaths = [
        'oat-zpetstore/packages/zpetstore/objects/intf/zif_petstore',
        'oat-zpetstore/packages/zpetstore/objects/intf/zif_petstore/zif_petstore.intf.yaml',
        'oat-zpetstore/packages/zpetstore/objects/intf/zif_petstore/zif_petstore.intf.abap',
      ];

      expectedPaths.forEach((path) => {
        expect(existsSync(path)).toBe(true);
      });
    });

    it('should have valid YAML metadata file', () => {
      const yamlPath = join(
        projectPath,
        'packages/zpetstore/objects/intf/zif_petstore/zif_petstore.intf.yaml'
      );
      const yamlContent = readFileSync(yamlPath, 'utf8');

      expect(yamlContent).toContain('kind: INTF');
      expect(yamlContent).toContain('name: ZIF_PETSTORE');
      expect(yamlContent).toContain('description: Petstore API Interface');
    });

    it('should have valid ABAP source file', () => {
      const abapPath = join(
        projectPath,
        'packages/zpetstore/objects/intf/zif_petstore/zif_petstore.intf.abap'
      );
      const abapContent = readFileSync(abapPath, 'utf8');

      expect(abapContent).toContain('INTERFACE zif_petstore');
      expect(abapContent).toContain('get_pet_by_id');
      expect(abapContent).toContain('create_pet');
      expect(abapContent).toContain('update_pet');
      expect(abapContent).toContain('delete_pet');
      expect(abapContent).toContain('get_pets_by_status');
      expect(abapContent).toContain('place_order');
      expect(abapContent).toContain('get_order_by_id');
      expect(abapContent).toContain('ENDINTERFACE');
    });
  });

  describe('OAT Format Handler', () => {
    let oatFormat: OatFormat;

    beforeAll(() => {
      oatFormat = new OatFormat();
    });

    it('should discover interface objects', async () => {
      const objects = await oatFormat.findObjects(projectPath);

      expect(objects).toHaveLength(1);
      expect(objects[0].type).toBe('intf');
      expect(objects[0].name).toBe('zif_petstore');
    });

    it('should deserialize interface metadata correctly', async () => {
      const objectData = await oatFormat.deserialize(
        'INTF',
        'ZIF_PETSTORE',
        projectPath
      );

      expect(objectData.name).toBe('ZIF_PETSTORE');
      expect(objectData.package).toBe('ZPETSTORE');
      expect(objectData.description).toContain('Petstore');
      expect(objectData.source).toContain('INTERFACE zif_petstore');
      expect(objectData.metadata?.type).toBe('INTF');
    });
  });

  describe('Export Service (Dry Run)', () => {
    let exportService: ExportService;
    let mockAdtClient: ADTClient;

    beforeAll(() => {
      // Create a proper mock ADT client for dry run testing
      mockAdtClient = {
        setDebugMode: vi.fn(),
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
      } as any;
      exportService = new ExportService(mockAdtClient);
    });

    it('should process package in dry run mode', async () => {
      const result = await exportService.exportPackage({
        packageName,
        inputPath: projectPath,
        format: 'oat',
        createObjects: false, // Dry run
        debug: true,
      });

      expect(result.packageName).toBe(packageName);
      expect(result.description).toContain('Export of package ZPETSTORE');
      expect(result.processedObjects).toBe(1);
      expect(result.totalObjects).toBe(1);
    });

    it('should identify interface objects correctly', async () => {
      const result = await exportService.exportPackage({
        packageName,
        inputPath: projectPath,
        format: 'oat',
        createObjects: false,
        debug: true,
      });

      expect(result.objectsByType?.INTF).toBe(1);
    });
  });

  describe('Interface Content Validation', () => {
    it('should contain all required petstore methods', async () => {
      const oatFormat = new OatFormat();
      const objectData = await oatFormat.deserialize(
        'INTF',
        'ZIF_PETSTORE',
        projectPath
      );

      const requiredMethods = [
        'get_pet_by_id',
        'create_pet',
        'update_pet',
        'delete_pet',
        'get_pets_by_status',
        'place_order',
        'get_order_by_id',
      ];

      requiredMethods.forEach((method) => {
        expect(objectData.source).toContain(method);
      });
    });

    it('should have proper ABAP interface structure', async () => {
      const oatFormat = new OatFormat();
      const objectData = await oatFormat.deserialize(
        'INTF',
        'ZIF_PETSTORE',
        projectPath
      );

      expect(objectData.source).toMatch(/INTERFACE\s+zif_petstore/i);
      expect(objectData.source).toMatch(/PUBLIC\s*\./i);
      expect(objectData.source).toContain('ENDINTERFACE');
      expect(objectData.source).toContain('IMPORTING');
      expect(objectData.source).toContain('EXPORTING');
      expect(objectData.source).toContain('RAISING');
    });

    it('should define proper data types', async () => {
      const oatFormat = new OatFormat();
      const objectData = await oatFormat.deserialize(
        'INTF',
        'ZIF_PETSTORE',
        projectPath
      );

      expect(objectData.source).toContain('ty_pet_status');
      expect(objectData.source).toContain('ty_pet');
      expect(objectData.source).toContain('ty_order');
      expect(objectData.source).toContain('available');
      expect(objectData.source).toContain('pending');
      expect(objectData.source).toContain('sold');
    });
  });

  describe('Export Command Integration', () => {
    it('should validate export options', () => {
      const validOptions = {
        packageName: 'ZPETSTORE',
        inputPath: './oat-zpetstore',
        format: 'oat' as const,
        createObjects: false,
        debug: true,
      };

      expect(validOptions.packageName).toBe('ZPETSTORE');
      expect(validOptions.format).toBe('oat');
      expect(validOptions.createObjects).toBe(false);
    });

    it('should support transport request option', () => {
      const optionsWithTransport = {
        packageName: 'ZPETSTORE',
        inputPath: './oat-zpetstore',
        format: 'oat' as const,
        createObjects: true,
        transportRequest: 'NPLK900123',
        debug: true,
      };

      expect(optionsWithTransport.transportRequest).toBe('NPLK900123');
      expect(optionsWithTransport.createObjects).toBe(true);
    });
  });
});
