import { describe, it, expect } from 'vitest';
import { Class } from './';
import { Kind } from '../../registry';

describe('Class ADK Object', () => {
  const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<class:class xmlns:class="http://www.sap.com/adt/oo/classes" xmlns:adtcore="http://www.sap.com/adt/core">
  <adtcore:name>ZCL_TEST</adtcore:name>
  <adtcore:type>CLAS/OC</adtcore:type>
  <adtcore:description>Test Class</adtcore:description>
</class:class>`;

  describe('fromAdtXml', () => {
    it('should create Class from XML', () => {
      const cls = Class.fromAdtXml(sampleXml);
      
      expect(cls).toBeInstanceOf(Class);
      expect(cls.kind).toBe(Kind.Class);
      expect(cls.name).toBe('ZCL_TEST');
      expect(cls.type).toBe('CLAS/OC');
      expect(cls.description).toBe('Test Class');
    });
  });

  describe('getData', () => {
    it('should return fully typed data', () => {
      const cls = Class.fromAdtXml(sampleXml);
      const data = cls.getData();
      
      expect(data).toBeDefined();
      expect(data.name).toBe('ZCL_TEST');
      expect(data.type).toBe('CLAS/OC');
      expect(data.description).toBe('Test Class');
    });
  });

  describe('toAdtXml', () => {
    it('should serialize back to XML', () => {
      const cls = Class.fromAdtXml(sampleXml);
      const xml = cls.toAdtXml();
      
      expect(xml).toContain('ZCL_TEST');
      expect(xml).toContain('CLAS/OC');
      expect(xml).toContain('Test Class');
    });
  });

  describe('type safety', () => {
    it('should have fully typed properties', () => {
      const cls = Class.fromAdtXml(sampleXml);
      
      expect(cls.kind).toBe(Kind.Class);
      expect(cls.name).toBe('ZCL_TEST');
      expect(cls.type).toBe('CLAS/OC');
      expect(cls.description).toBe('Test Class');
    });
  });
});
