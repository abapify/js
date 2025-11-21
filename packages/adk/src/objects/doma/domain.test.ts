import { describe, it, expect } from 'vitest';
import { Domain } from './';
import { Kind } from '../../registry';

describe('Domain ADK Object', () => {
  const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<blue:bluePrint xmlns:blue="http://www.sap.com/adt/ddic/domains" xmlns:adtcore="http://www.sap.com/adt/core">
  <adtcore:name>ZTEST_DOMAIN</adtcore:name>
  <adtcore:type>DOMA/DD</adtcore:type>
  <adtcore:description>Test Domain</adtcore:description>
</blue:bluePrint>`;

  describe('fromAdtXml', () => {
    it('should create Domain from XML', () => {
      const domain = Domain.fromAdtXml(sampleXml);
      
      expect(domain).toBeInstanceOf(Domain);
      expect(domain.kind).toBe(Kind.Domain);
      expect(domain.name).toBe('ZTEST_DOMAIN');
      expect(domain.type).toBe('DOMA/DD');
      expect(domain.description).toBe('Test Domain');
    });
  });

  describe('getData', () => {
    it('should return fully typed data', () => {
      const domain = Domain.fromAdtXml(sampleXml);
      const data = domain.getData();
      
      expect(data).toBeDefined();
      expect(data.name).toBe('ZTEST_DOMAIN');
      expect(data.type).toBe('DOMA/DD');
      expect(data.description).toBe('Test Domain');
    });
  });

  describe('toAdtXml', () => {
    it('should serialize back to XML', () => {
      const domain = Domain.fromAdtXml(sampleXml);
      const xml = domain.toAdtXml();
      
      expect(xml).toContain('ZTEST_DOMAIN');
      expect(xml).toContain('DOMA/DD');
      expect(xml).toContain('Test Domain');
    });
  });

  describe('type safety', () => {
    it('should have fully typed properties', () => {
      const domain = Domain.fromAdtXml(sampleXml);
      
      expect(domain.kind).toBe(Kind.Domain);
      expect(domain.name).toBe('ZTEST_DOMAIN');
      expect(domain.type).toBe('DOMA/DD');
      expect(domain.description).toBe('Test Domain');
    });
  });
});
