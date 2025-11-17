import { describe, it, expect } from 'vitest';
import { Interface } from './';
import { Kind } from '../../registry';

describe('Interface ADK Object', () => {
  const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<intf:abapInterface xmlns:intf="http://www.sap.com/adt/oo/interfaces" xmlns:adtcore="http://www.sap.com/adt/core" adtcore:name="ZIF_TEST" adtcore:type="INTF/OI" adtcore:description="Test Interface">
</intf:abapInterface>`;

  describe('fromAdtXml', () => {
    it('should create Interface from XML', () => {
      const iface = Interface.fromAdtXml(sampleXml);
      
      expect(iface).toBeInstanceOf(Interface);
      expect(iface.kind).toBe(Kind.Interface);
      expect(iface.name).toBe('ZIF_TEST');
      expect(iface.type).toBe('INTF/OI');
      expect(iface.description).toBe('Test Interface');
    });
  });

  describe('getData', () => {
    it('should return fully typed data', () => {
      const iface = Interface.fromAdtXml(sampleXml);
      const data = iface.getData();
      
      // Verify data structure exists and has expected properties
      expect(data).toBeDefined();
      expect(data.name).toBe('ZIF_TEST');
      expect(data.type).toBe('INTF/OI');
      expect(data.description).toBe('Test Interface');
    });
  });

  describe('toAdtXml', () => {
    it('should serialize back to XML', () => {
      const iface = Interface.fromAdtXml(sampleXml);
      const xml = iface.toAdtXml();
      
      expect(xml).toContain('ZIF_TEST');
      expect(xml).toContain('INTF/OI');
      expect(xml).toContain('Test Interface');
    });
  });

  describe('type safety', () => {
    it('should have fully typed properties', () => {
      const iface = Interface.fromAdtXml(sampleXml);
      
      // These type assertions will fail typecheck if types are wrong
      const kind: string = iface.kind;
      const name: string = iface.name;
      const type: string = iface.type;
      const description: string | undefined = iface.description;
      
      expect(kind).toBe(Kind.Interface);
      expect(name).toBe('ZIF_TEST');
      expect(type).toBe('INTF/OI');
      expect(description).toBe('Test Interface');
    });
  });
});
