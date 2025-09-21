import { describe, it, expect } from 'vitest';
import {
  fromFastXMLObject,
  getClassMetadata,
  getAllPropertyMetadata,
} from 'xmld';
import { IntfSpec } from '../namespaces/intf/intf';

describe('Zero-dependency plugin parsing', () => {
  it('should read metadata from IntfSpec', () => {
    console.log('Testing metadata...');

    // Check class metadata both ways
    const classMetadata1 = getClassMetadata(IntfSpec);
    const classMetadata2 = getClassMetadata(IntfSpec.prototype);
    console.log('Class metadata (direct):', classMetadata1);
    console.log('Class metadata (prototype):', classMetadata2);

    // Check property metadata both ways
    const propertyMetadata1 = getAllPropertyMetadata(IntfSpec);
    const propertyMetadata2 = getAllPropertyMetadata(IntfSpec.prototype);
    console.log('Property metadata (direct):', propertyMetadata1);
    console.log('Property metadata (prototype):', propertyMetadata2);

    // Test if the .prototype approach works for properties too
    const hasPropertiesViaPrototype = propertyMetadata2.size > 0;
    console.log('Properties via prototype:', hasPropertiesViaPrototype);
  });

  it('should parse JSON using fromFastXMLObject plugin approach', () => {
    // fromFastXMLObject expects already-parsed JSON, not XML string
    const parsedJson = {
      'intf:abapInterface': {
        '@_adtcore:name': 'ZIF_TEST',
        '@_adtcore:type': 'INTF/OI',
      },
    };

    console.log('Input JSON:', JSON.stringify(parsedJson, null, 2));

    const result = fromFastXMLObject(parsedJson, IntfSpec);
    console.log('Result instance:', result);
    console.log('Result.core:', result.core);

    expect(result).toBeInstanceOf(IntfSpec);

    // Debug: let's see what we actually got
    if (!result.core || !result.core.name) {
      console.log('❌ Property parsing failed - core is:', result.core);
      console.log('All result properties:', Object.keys(result));
      for (const [key, value] of Object.entries(result)) {
        console.log(`  ${key}:`, value);
      }
    }

    expect(result.core?.name).toBe('ZIF_TEST');
  });
});
