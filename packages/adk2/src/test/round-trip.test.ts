import { describe, it, expect } from 'vitest';
import { IntfSpec } from '../namespaces/intf';
import { ClassSpec } from '../namespaces/class';
import { DomainSpec } from '../namespaces/ddic';

describe('ADK2 Round-trip Tests', () => {
  it('should parse and serialize IntfSpec', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<intf:abapInterface
  xmlns:intf="http://www.sap.com/adt/oo/interfaces"
  xmlns:adtcore="http://www.sap.com/adt/core"
  xmlns:abapoo="http://www.sap.com/adt/oo"
  xmlns:abapsource="http://www.sap.com/adt/abapsource"
  adtcore:name="ZIF_TEST"
  adtcore:type="INTF/OI"
  abapoo:modeled="false"
  abapsource:fixPointArithmetic="true">
  <atom:link xmlns:atom="http://www.w3.org/2005/Atom" href="source/main" rel="http://www.sap.com/adt/relations/source" />
</intf:abapInterface>`;

    const parsed = IntfSpec.fromXMLString(xml);
    expect(parsed.core.name).toBe('ZIF_TEST');
    expect(parsed.core.type).toBe('INTF/OI');
    expect(parsed.oo.modeled).toBe('false');
    expect(parsed.source.fixPointArithmetic).toBe('true');
    expect(parsed.links).toHaveLength(1);
    expect(parsed.links?.[0].href).toBe('source/main');

    const serialized = parsed.toXMLString();
    expect(serialized).toContain('intf:abapInterface');
    expect(serialized).toContain('adtcore:name="ZIF_TEST"');
  });

  it('should parse and serialize ClassSpec', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<class:abapClass
  xmlns:class="http://www.sap.com/adt/oo/classes"
  xmlns:adtcore="http://www.sap.com/adt/core"
  xmlns:abapoo="http://www.sap.com/adt/oo"
  xmlns:abapsource="http://www.sap.com/adt/abapsource"
  class:final="true"
  class:visibility="public"
  adtcore:name="ZCL_TEST"
  adtcore:type="CLAS/OC"
  abapoo:modeled="false"
  abapsource:fixPointArithmetic="true">
  <atom:link xmlns:atom="http://www.w3.org/2005/Atom" href="source/main" rel="http://www.sap.com/adt/relations/source" />
</class:abapClass>`;

    const parsed = ClassSpec.fromXMLString(xml);
    expect(parsed.core.name).toBe('ZCL_TEST');
    expect(parsed.core.type).toBe('CLAS/OC');
    expect(parsed.class.final).toBe('true');
    expect(parsed.class.visibility).toBe('public');
    expect(parsed.oo.modeled).toBe('false');
    expect(parsed.source.fixPointArithmetic).toBe('true');

    const serialized = parsed.toXMLString();
    expect(serialized).toContain('class:abapClass');
    expect(serialized).toContain('adtcore:name="ZCL_TEST"');
  });

  it('should parse and serialize DomainSpec', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ddic:domain
  xmlns:ddic="http://www.sap.com/adt/ddic"
  xmlns:adtcore="http://www.sap.com/adt/core"
  adtcore:name="ZDO_TEST"
  adtcore:type="DOMA/DD">
  <atom:link xmlns:atom="http://www.w3.org/2005/Atom" href="source/main" rel="http://www.sap.com/adt/relations/source" />
  <ddic:dataType>CHAR</ddic:dataType>
  <ddic:length>10</ddic:length>
</ddic:domain>`;

    const parsed = DomainSpec.fromXMLString(xml);
    expect(parsed.core.name).toBe('ZDO_TEST');
    expect(parsed.core.type).toBe('DOMA/DD');
    expect(parsed.dataType).toBe('CHAR');
    expect(parsed.length).toBe('10');

    const serialized = parsed.toXMLString();
    expect(serialized).toContain('ddic:domain');
    expect(serialized).toContain('adtcore:name="ZDO_TEST"');
  });
});
