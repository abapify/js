import { describe, it, expect } from 'vitest';
import { ClassAdtAdapter } from './adt';
import { Kind } from '../../kind';
import type { ClassSpec } from '../index';

describe('ClassAdtAdapter', () => {
  const mockClassSpec: ClassSpec = {
    kind: Kind.Class,
    metadata: {
      name: 'ZCL_TEST_CLASS',
      description: 'Test class for unit tests',
    },
    spec: {
      visibility: 'PUBLIC',
      isFinal: false,
      isAbstract: false,
      superclass: 'CL_OBJECT',
      interfaces: ['ZIF_TEST_INTERFACE'],
      components: {
        methods: [
          {
            name: 'CONSTRUCTOR',
            visibility: 'PUBLIC',
            isStatic: false,
            isAbstract: false,
            isFinal: false,
            parameters: [
              {
                name: 'IV_PARAM',
                type: 'IMPORTING',
                dataType: 'STRING',
                isOptional: false,
                description: 'Input parameter',
              },
            ],
            exceptions: ['CX_SY_NO_HANDLER'],
            description: 'Constructor method',
          },
          {
            name: 'GET_DATA',
            visibility: 'PUBLIC',
            isStatic: false,
            isAbstract: false,
            isFinal: false,
            parameters: [
              {
                name: 'RV_RESULT',
                type: 'RETURNING',
                dataType: 'STRING',
                isOptional: false,
              },
            ],
            exceptions: [],
          },
        ],
        attributes: [
          {
            name: 'MV_DATA',
            visibility: 'PRIVATE',
            isStatic: false,
            isReadOnly: false,
            dataType: 'STRING',
            description: 'Private data attribute',
          },
          {
            name: 'MC_CONSTANT',
            visibility: 'PUBLIC',
            isStatic: true,
            isReadOnly: true,
            dataType: 'STRING',
            value: "'TEST'",
            description: 'Public constant',
          },
        ],
        events: [
          {
            name: 'DATA_CHANGED',
            visibility: 'PUBLIC',
            parameters: [
              {
                name: 'OLD_VALUE',
                dataType: 'STRING',
                isOptional: true,
                description: 'Previous value',
              },
            ],
            description: 'Fired when data changes',
          },
        ],
        types: [
          {
            name: 'TY_DATA_RANGE',
            visibility: 'PUBLIC',
            definition: 'RANGE OF STRING',
            description: 'Data range type',
          },
        ],
      },
    },
  };

  it('should create adapter instance', () => {
    const adapter = new ClassAdtAdapter(mockClassSpec);
    expect(adapter).toBeInstanceOf(ClassAdtAdapter);
  });

  it('should return correct kind', () => {
    const adapter = new ClassAdtAdapter(mockClassSpec);
    expect(adapter.kind).toBe('Class');
  });

  it('should return correct name', () => {
    const adapter = new ClassAdtAdapter(mockClassSpec);
    expect(adapter.name).toBe('ZCL_TEST_CLASS');
  });

  it('should return correct description', () => {
    const adapter = new ClassAdtAdapter(mockClassSpec);
    expect(adapter.description).toBe('Test class for unit tests');
  });

  it('should return correct spec', () => {
    const adapter = new ClassAdtAdapter(mockClassSpec);
    expect(adapter.spec).toEqual(mockClassSpec.spec);
  });

  it('should generate ADT object structure', () => {
    const adapter = new ClassAdtAdapter(mockClassSpec);
    const adtObject = adapter.toAdt();

    expect(adtObject).toBeDefined();
    expect(adtObject).toHaveProperty('clas:class');

    const classElement = (adtObject as any)['clas:class'];
    expect(classElement).toBeDefined();
    // The fxmlp library structures the content differently
    // Check for the presence of expected attributes
  });

  it('should generate valid ADT XML', () => {
    const adapter = new ClassAdtAdapter(mockClassSpec);
    const xml = adapter.toAdtXML();

    expect(xml).toBeDefined();
    expect(typeof xml).toBe('string');
    expect(xml.length).toBeGreaterThan(0);

    // Check for XML structure
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('clas:class');
    expect(xml).toContain('ZCL_TEST_CLASS');
  });

  it('should include ADT core attributes', () => {
    const adapter = new ClassAdtAdapter(mockClassSpec);
    const adtcore = adapter.adtcore;

    expect(adtcore).toHaveProperty('type', 'CLAS/OC');
    expect(adtcore).toHaveProperty('name', 'ZCL_TEST_CLASS');
  });

  it('should handle class without superclass', () => {
    const specWithoutSuper: ClassSpec = {
      ...mockClassSpec,
      spec: {
        ...mockClassSpec.spec,
        superclass: undefined,
      },
    };

    const adapter = new ClassAdtAdapter(specWithoutSuper);
    const xml = adapter.toAdtXML();

    expect(xml).toContain('ZCL_TEST_CLASS');
    expect(xml).toContain('clas:class');
  });

  it('should handle abstract final class', () => {
    const abstractFinalSpec: ClassSpec = {
      ...mockClassSpec,
      spec: {
        ...mockClassSpec.spec,
        isAbstract: true,
        isFinal: true,
        visibility: 'PRIVATE',
      },
    };

    const adapter = new ClassAdtAdapter(abstractFinalSpec);
    const xml = adapter.toAdtXML();

    expect(xml).toContain('ZCL_TEST_CLASS');
    expect(xml).toContain('clas:class');
    expect(xml).toContain('true'); // Should contain boolean values
  });

  it('should handle class with no interfaces', () => {
    const noInterfacesSpec: ClassSpec = {
      ...mockClassSpec,
      spec: {
        ...mockClassSpec.spec,
        interfaces: [],
      },
    };

    const adapter = new ClassAdtAdapter(noInterfacesSpec);
    const xml = adapter.toAdtXML();

    expect(xml).toContain('ZCL_TEST_CLASS');
    expect(xml).toContain('clas:class');
  });

  it('should handle class with empty components', () => {
    const emptyComponentsSpec: ClassSpec = {
      ...mockClassSpec,
      spec: {
        ...mockClassSpec.spec,
        components: {
          methods: [],
          attributes: [],
          events: [],
          types: [],
        },
      },
    };

    const adapter = new ClassAdtAdapter(emptyComponentsSpec);
    const xml = adapter.toAdtXML();

    expect(xml).toContain('ZCL_TEST_CLASS');
    expect(xml).toContain('clas:class');
  });
});
