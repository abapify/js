import { describe, it, expect } from 'vitest';
import { AdkPackageFactory } from './package-factory';
import { Kind } from '../kind';

describe('AdkPackageFactory', () => {
  describe('createPackageStructure', () => {
    it('should create a simple package with objects', async () => {
      const mockObjects = [
        {
          packageName: 'Z_TEST',
          object: {
            kind: Kind.Class,
            name: 'ZCL_TEST1',
            type: 'CLAS/OC',
            toAdtXml: () => '<xml/>'
          }
        },
        {
          packageName: 'Z_TEST',
          object: {
            kind: Kind.Class,
            name: 'ZCL_TEST2',
            type: 'CLAS/OC',
            toAdtXml: () => '<xml/>'
          }
        }
      ];

      const pkg = await AdkPackageFactory.createPackageStructure(
        mockObjects,
        'Z_TEST',
        'Test Package'
      );

      expect(pkg.name).toBe('Z_TEST');
      expect(pkg.description).toBe('Test Package');
      expect(pkg.children).toHaveLength(2);
      expect(pkg.subpackages).toHaveLength(0);
      expect(pkg.isLoaded).toBe(true);
    });

    it('should create package with subpackages', async () => {
      const mockObjects = [
        {
          packageName: 'Z_PARENT',
          object: {
            kind: Kind.Class,
            name: 'ZCL_PARENT',
            type: 'CLAS/OC',
            toAdtXml: () => '<xml/>'
          }
        },
        {
          packageName: 'Z_PARENT_MODELS',
          object: {
            kind: Kind.Class,
            name: 'ZCL_MODEL1',
            type: 'CLAS/OC',
            toAdtXml: () => '<xml/>'
          }
        },
        {
          packageName: 'Z_PARENT_SERVICES',
          object: {
            kind: Kind.Class,
            name: 'ZCL_SERVICE1',
            type: 'CLAS/OC',
            toAdtXml: () => '<xml/>'
          }
        }
      ];

      const pkg = await AdkPackageFactory.createPackageStructure(
        mockObjects,
        'Z_PARENT',
        'Parent Package'
      );

      expect(pkg.name).toBe('Z_PARENT');
      expect(pkg.children).toHaveLength(1);
      expect(pkg.subpackages).toHaveLength(2);

      const modelsPackage = pkg.subpackages.find(p => p.name === 'Z_PARENT_MODELS');
      expect(modelsPackage).toBeDefined();
      expect(modelsPackage?.description).toBe('Models');
      expect(modelsPackage?.children).toHaveLength(1);

      const servicesPackage = pkg.subpackages.find(p => p.name === 'Z_PARENT_SERVICES');
      expect(servicesPackage).toBeDefined();
      expect(servicesPackage?.description).toBe('Services');
      expect(servicesPackage?.children).toHaveLength(1);
    });

    it('should handle empty object list', async () => {
      const pkg = await AdkPackageFactory.createPackageStructure(
        [],
        'Z_EMPTY',
        'Empty Package'
      );

      expect(pkg.name).toBe('Z_EMPTY');
      expect(pkg.children).toHaveLength(0);
      expect(pkg.subpackages).toHaveLength(0);
      expect(pkg.isLoaded).toBe(true);
    });

    it('should group objects by package correctly', async () => {
      const mockObjects = [
        {
          packageName: 'Z_TEST',
          object: {
            kind: Kind.Class,
            name: 'ZCL_TEST1',
            type: 'CLAS/OC',
            toAdtXml: () => '<xml/>'
          }
        },
        {
          packageName: 'Z_TEST_SUB',
          object: {
            kind: Kind.Class,
            name: 'ZCL_SUB1',
            type: 'CLAS/OC',
            toAdtXml: () => '<xml/>'
          }
        },
        {
          packageName: 'Z_TEST',
          object: {
            kind: Kind.Interface,
            name: 'ZIF_TEST1',
            type: 'INTF/OI',
            toAdtXml: () => '<xml/>'
          }
        }
      ];

      const pkg = await AdkPackageFactory.createPackageStructure(
        mockObjects,
        'Z_TEST'
      );

      expect(pkg.children).toHaveLength(2);
      expect(pkg.subpackages).toHaveLength(1);
      expect(pkg.subpackages[0].children).toHaveLength(1);
    });
  });

  describe('createLazyPackage', () => {
    it('should create package with lazy loading callback', async () => {
      let callbackCalled = false;
      const loadCallback = async () => {
        callbackCalled = true;
      };

      const pkg = AdkPackageFactory.createLazyPackage(
        'Z_LAZY',
        'Lazy Package',
        loadCallback
      );

      expect(pkg.name).toBe('Z_LAZY');
      expect(pkg.description).toBe('Lazy Package');
      expect(pkg.isLoaded).toBe(false);

      await pkg.load();

      expect(callbackCalled).toBe(true);
      expect(pkg.isLoaded).toBe(true);
    });

    it('should handle undefined description', async () => {
      const pkg = AdkPackageFactory.createLazyPackage(
        'Z_LAZY',
        undefined,
        async () => {
          // Empty callback for testing
        }
      );

      expect(pkg.name).toBe('Z_LAZY');
      expect(pkg.description).toBeUndefined();
    });
  });
});
