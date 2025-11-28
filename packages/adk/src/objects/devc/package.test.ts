import { describe, it, expect } from 'vitest';
import { Package } from './';
import { Kind } from '../../registry';

// Helper to create test packages with minimal required fields
function createTestPackage(name: string, description?: string): Package {
  const base = Package.fromAdtXml(`<?xml version="1.0" encoding="UTF-8"?>
<pak:package xmlns:pak="http://www.sap.com/adt/packages" xmlns:adtcore="http://www.sap.com/adt/core">
  <adtcore:name>${name}</adtcore:name>
  <adtcore:type>DEVC/K</adtcore:type>
  ${description ? `<adtcore:description>${description}</adtcore:description>` : ''}
</pak:package>`);
  
  // Create a proper Package instance with hierarchical features
  const pkg = Object.create(Package.prototype);
  Object.assign(pkg, base);
  pkg.children = [];
  pkg.subpackages = [];
  return pkg;
}

describe('Package', () => {
  describe('constructor', () => {
    it('should create a package with name and description', () => {
      const pkg = createTestPackage('Z_TEST_PKG', 'Test Package');
      
      expect(pkg.name).toBe('Z_TEST_PKG');
      expect(pkg.description).toBe('Test Package');
      expect(pkg.kind).toBe(Kind.Package);
      expect(pkg.type).toBe('DEVC/K');
    });

    it('should create a package without description', () => {
      const pkg = createTestPackage('Z_TEST_PKG');
      
      expect(pkg.name).toBe('Z_TEST_PKG');
      expect(pkg.description).toBeUndefined();
    });
  });

  describe('children and subpackages', () => {
    it('should start with empty children and subpackages', () => {
      const pkg = createTestPackage('Z_TEST_PKG');
      
      expect(pkg.children).toEqual([]);
      expect(pkg.subpackages).toEqual([]);
    });

    it('should add child objects', () => {
      const pkg = createTestPackage('Z_TEST_PKG');
      const mockChild = {
        kind: Kind.Class,
        name: 'ZCL_TEST',
        type: 'CLAS/OC',
        toAdtXml: () => '<xml/>'
      };
      
      pkg.addChild(mockChild);
      
      expect(pkg.children).toHaveLength(1);
      expect(pkg.children[0]).toBe(mockChild);
    });

    it('should add subpackages', () => {
      const parent = createTestPackage('Z_PARENT');
      const child = createTestPackage('Z_PARENT_CHILD');
      
      parent.addSubpackage(child);
      
      expect(parent.subpackages).toHaveLength(1);
      expect(parent.subpackages[0]).toBe(child);
    });
  });

  describe('lazy loading', () => {
    it('should start as not loaded', () => {
      const pkg = createTestPackage('Z_TEST_PKG');
      
      expect(pkg.isLoaded).toBe(false);
    });

    it('should mark as loaded after load() without callback', async () => {
      const pkg = createTestPackage('Z_TEST_PKG');
      
      await pkg.load();
      
      expect(pkg.isLoaded).toBe(true);
    });

    it('should call load callback when loading', async () => {
      const pkg = createTestPackage('Z_TEST_PKG');
      let callbackCalled = false;
      
      pkg.setLoadCallback(async () => {
        callbackCalled = true;
      });
      
      await pkg.load();
      
      expect(callbackCalled).toBe(true);
      expect(pkg.isLoaded).toBe(true);
    });

    it('should not call callback twice', async () => {
      const pkg = createTestPackage('Z_TEST_PKG');
      let callCount = 0;
      
      pkg.setLoadCallback(async () => {
        callCount++;
      });
      
      await pkg.load();
      await pkg.load(); // Second call
      
      expect(callCount).toBe(1);
      expect(pkg.isLoaded).toBe(true);
    });
  });

  describe('toAdtXml', () => {
    it('should generate ADT XML with description', () => {
      const pkg = createTestPackage('Z_TEST_PKG', 'Test Package');
      const xml = pkg.toAdtXml();
      
      expect(xml).toContain('<DEVCLASS>Z_TEST_PKG</DEVCLASS>');
      expect(xml).toContain('<CTEXT>Test Package</CTEXT>');
    });

    it('should use name as description if not provided', () => {
      const pkg = createTestPackage('Z_TEST_PKG');
      const xml = pkg.toAdtXml();
      
      expect(xml).toContain('<DEVCLASS>Z_TEST_PKG</DEVCLASS>');
      expect(xml).toContain('<CTEXT>Z_TEST_PKG</CTEXT>');
    });
  });

  describe('fromAdtXml', () => {
    it('should parse package from ADT XML', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
    <DEVC>
      <DEVCLASS>Z_TEST_PKG</DEVCLASS>
      <CTEXT>Test Package</CTEXT>
    </DEVC>
  </asx:values>
</asx:abap>`;
      
      const pkg = Package.fromAdtXml(xml);
      
      expect(pkg.name).toBe('Z_TEST_PKG');
      expect(pkg.description).toBe('Test Package');
    });

    it('should handle XML without description', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
    <DEVC>
      <DEVCLASS>Z_TEST_PKG</DEVCLASS>
    </DEVC>
  </asx:values>
</asx:abap>`;
      
      const pkg = Package.fromAdtXml(xml);
      
      expect(pkg.name).toBe('Z_TEST_PKG');
      expect(pkg.description).toBeUndefined();
    });
  });

});
