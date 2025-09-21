import { describe, it, expect } from 'vitest';
import { xml, root, attributes, namespace } from 'xmld';
import { toFastXML } from 'xmld';

// Debug: Check what we're actually importing
console.log('attributes function:', attributes);
console.log('attributes function type:', typeof attributes);
console.log('attributes function toString:', attributes.toString());

describe('Debug @attributes decorator in ADK', () => {
  it('should work with exact same pattern as xmld', () => {
    interface CoreAttrs {
      version: string;
      responsible: string;
    }

    @xml
    @root('test:document')
    class TestDocument {
      @attributes
      @namespace('core', 'http://www.sap.com/adt/core')
      core!: CoreAttrs;
    }

    const doc = new TestDocument();
    doc.core = {
      version: '1.0',
      responsible: 'developer',
    };

    const fastXMLObject = toFastXML(doc);

    expect(fastXMLObject).toEqual({
      'test:document': {
        '@_core:version': '1.0',
        '@_core:responsible': 'developer',
        '@_xmlns:core': 'http://www.sap.com/adt/core',
      },
    });
  });

  it('should fail with adtcore namespace', () => {
    interface AdtCoreAttrs {
      name: string;
      type: string;
    }

    @xml
    @root('test:document')
    class TestDocument {
      @attributes
      @namespace('adtcore', 'http://www.sap.com/adt/core')
      core!: AdtCoreAttrs;
    }

    const doc = new TestDocument();
    doc.core = {
      name: 'TEST',
      type: 'TEST/T',
    };

    const fastXMLObject = toFastXML(doc);
    console.log('Result:', JSON.stringify(fastXMLObject, null, 2));

    // Let's see what we actually get
    expect(fastXMLObject).toBeDefined();
  });
});
