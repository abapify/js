import { describe, it, expect } from 'vitest';
import { Package } from './package';
import { Kind } from '../registry/kinds';

describe('Package', () => {
  describe('constructor', () => {
    it('should create a package with name and description', () => {
      const pkg = new Package('Z_TEST_PKG', 'Test Package');
      
      expect(pkg.name).toBe('Z_TEST_PKG');
      expect(pkg.description).toBe('Test Package');
      expect(pkg.kind).toBe(Kind.Package);
      expect(pkg.type).toBe('DEVC/K');
    });

    it('should create a package without description', () => {
      const pkg = new Package('Z_TEST_PKG');
      
      expect(pkg.name).toBe('Z_TEST_PKG');
      expect(pkg.description).toBeUndefined();
    });
  });

  describe('children and subpackages', () => {
    it('should start with empty children and subpackages', () => {
      const pkg = new Package('Z_TEST_PKG');
      
      expect(pkg.children).toEqual([]);
      expect(pkg.subpackages).toEqual([]);
    });

    it('should add child objects', () => {
      const pkg = new Package('Z_TEST_PKG');
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
      const parent = new Package('Z_PARENT');
      const child = new Package('Z_PARENT_CHILD');
      
      parent.addSubpackage(child);
      
      expect(parent.subpackages).toHaveLength(1);
      expect(parent.subpackages[0]).toBe(child);
    });
  });

  describe('lazy loading', () => {
    it('should start as not loaded', () => {
      const pkg = new Package('Z_TEST_PKG');
      
      expect(pkg.isLoaded).toBe(false);
    });

    it('should mark as loaded after load() without callback', async () => {
      const pkg = new Package('Z_TEST_PKG');
      
      await pkg.load();
      
      expect(pkg.isLoaded).toBe(true);
    });

    it('should call load callback when loading', async () => {
      const pkg = new Package('Z_TEST_PKG');
      let callbackCalled = false;
      
      pkg.setLoadCallback(async () => {
        callbackCalled = true;
      });
      
      await pkg.load();
      
      expect(callbackCalled).toBe(true);
      expect(pkg.isLoaded).toBe(true);
    });

    it('should not call callback twice', async () => {
      const pkg = new Package('Z_TEST_PKG');
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
      const pkg = new Package('Z_TEST_PKG', 'Test Package');
      const xml = pkg.toAdtXml();
      
      expect(xml).toContain('<DEVCLASS>Z_TEST_PKG</DEVCLASS>');
      expect(xml).toContain('<CTEXT>Test Package</CTEXT>');
    });

    it('should use name as description if not provided', () => {
      const pkg = new Package('Z_TEST_PKG');
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

  describe('description resolution', () => {
    describe('isChildPackage', () => {
      it('should identify child packages', () => {
        expect(Package.isChildPackage('Z_PARENT_CHILD', 'Z_PARENT')).toBe(true);
        expect(Package.isChildPackage('Z_PARENT_SUB_CHILD', 'Z_PARENT')).toBe(true);
      });

      it('should not identify root package as child', () => {
        expect(Package.isChildPackage('Z_PARENT', 'Z_PARENT')).toBe(false);
      });

      it('should not identify unrelated packages as children', () => {
        expect(Package.isChildPackage('Z_OTHER', 'Z_PARENT')).toBe(false);
        expect(Package.isChildPackage('Z_PARENT2', 'Z_PARENT')).toBe(false);
      });

      it('should be case insensitive', () => {
        expect(Package.isChildPackage('z_parent_child', 'Z_PARENT')).toBe(true);
        expect(Package.isChildPackage('Z_PARENT_CHILD', 'z_parent')).toBe(true);
      });
    });

    describe('deriveChildDescription', () => {
      it('should derive description from suffix', () => {
        expect(Package.deriveChildDescription('Z_PARENT_MODELS', 'Z_PARENT')).toBe('Models');
        expect(Package.deriveChildDescription('Z_PARENT_SERVICES', 'Z_PARENT')).toBe('Services');
        expect(Package.deriveChildDescription('Z_PARENT_UTILS', 'Z_PARENT')).toBe('Utils');
      });

      it('should return undefined for root package', () => {
        expect(Package.deriveChildDescription('Z_PARENT', 'Z_PARENT')).toBeUndefined();
      });

      it('should return undefined for unrelated packages', () => {
        expect(Package.deriveChildDescription('Z_OTHER', 'Z_PARENT')).toBeUndefined();
      });

      it('should handle multi-part suffixes', () => {
        expect(Package.deriveChildDescription('Z_PARENT_SUB_MODELS', 'Z_PARENT')).toBe('Models');
      });

      it('should be case insensitive', () => {
        expect(Package.deriveChildDescription('z_parent_models', 'Z_PARENT')).toBe('Models');
        expect(Package.deriveChildDescription('Z_PARENT_MODELS', 'z_parent')).toBe('Models');
      });
    });
  });
});
