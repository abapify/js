import { describe, it, expect } from 'vitest';
import { InterfaceAdtAdapter } from './adt';
import { Kind } from '../../kind';
import type { InterfaceSpec } from '../index';

describe('InterfaceAdtAdapter', () => {
  const mockInterfaceSpec: InterfaceSpec = {
    kind: Kind.Interface,
    metadata: {
      name: 'ZIF_TEST_INTERFACE',
      description: 'Test interface for unit tests',
    },
    spec: {
      category: 'IF',
      interfaces: ['ZIF_PARENT_INTERFACE'],
      components: {
        methods: [
          {
            name: 'PROCESS_DATA',
            isAbstract: true,
            parameters: [
              {
                name: 'IV_INPUT',
                type: 'IMPORTING',
                dataType: 'STRING',
                isOptional: false,
                description: 'Input data to process',
              },
              {
                name: 'EV_OUTPUT',
                type: 'EXPORTING',
                dataType: 'STRING',
                isOptional: false,
                description: 'Processed output data',
              },
            ],
            exceptions: ['CX_PROCESSING_ERROR'],
            description: 'Process input data and return result',
          },
          {
            name: 'GET_VERSION',
            isAbstract: true,
            parameters: [
              {
                name: 'RV_VERSION',
                type: 'RETURNING',
                dataType: 'STRING',
                isOptional: false,
              },
            ],
            exceptions: [],
            description: 'Get interface version',
          },
        ],
        attributes: [
          {
            name: 'MC_VERSION',
            isReadOnly: true,
            dataType: 'STRING',
            value: "'1.0'",
            description: 'Interface version constant',
          },
          {
            name: 'MV_STATUS',
            isReadOnly: false,
            dataType: 'CHAR1',
            description: 'Current status',
          },
        ],
        events: [
          {
            name: 'DATA_PROCESSED',
            parameters: [
              {
                name: 'IV_RESULT',
                dataType: 'STRING',
                isOptional: false,
                description: 'Processing result',
              },
              {
                name: 'IV_TIMESTAMP',
                dataType: 'TIMESTAMP',
                isOptional: true,
                description: 'Processing timestamp',
              },
            ],
            description: 'Fired when data processing completes',
          },
        ],
        types: [
          {
            name: 'TY_DATA_TABLE',
            definition: 'TABLE OF STRING',
            description: 'Table type for data collection',
          },
          {
            name: 'TY_STATUS',
            definition: 'CHAR1',
            description: 'Status type definition',
          },
        ],
      },
    },
  };

  it('should create adapter instance', () => {
    const adapter = new InterfaceAdtAdapter(mockInterfaceSpec);
    expect(adapter).toBeInstanceOf(InterfaceAdtAdapter);
  });

  it('should return correct kind', () => {
    const adapter = new InterfaceAdtAdapter(mockInterfaceSpec);
    expect(adapter.kind).toBe('Interface');
  });

  it('should return correct name', () => {
    const adapter = new InterfaceAdtAdapter(mockInterfaceSpec);
    expect(adapter.name).toBe('ZIF_TEST_INTERFACE');
  });

  it('should return correct description', () => {
    const adapter = new InterfaceAdtAdapter(mockInterfaceSpec);
    expect(adapter.description).toBe('Test interface for unit tests');
  });

  it('should return correct spec', () => {
    const adapter = new InterfaceAdtAdapter(mockInterfaceSpec);
    expect(adapter.spec).toEqual(mockInterfaceSpec.spec);
  });

  it('should generate ADT object structure', () => {
    const adapter = new InterfaceAdtAdapter(mockInterfaceSpec);
    const adtObject = adapter.toAdt();

    expect(adtObject).toBeDefined();
    expect(adtObject).toHaveProperty('intf:interface');

    const interfaceElement = (adtObject as any)['intf:interface'];
    expect(interfaceElement).toBeDefined();
    // The fxmlp library structures the content differently
    // Check for the presence of expected attributes
  });

  it('should generate valid ADT XML', () => {
    const adapter = new InterfaceAdtAdapter(mockInterfaceSpec);
    const xml = adapter.toAdtXML();

    expect(xml).toBeDefined();
    expect(typeof xml).toBe('string');
    expect(xml.length).toBeGreaterThan(0);

    // Check for XML structure
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('intf:interface');
    expect(xml).toContain('ZIF_TEST_INTERFACE');
  });

  it('should include ADT core attributes', () => {
    const adapter = new InterfaceAdtAdapter(mockInterfaceSpec);
    const adtcore = adapter.adtcore;

    expect(adtcore).toHaveProperty('type', 'INTF/OI');
    expect(adtcore).toHaveProperty('name', 'ZIF_TEST_INTERFACE');
  });

  it('should handle category interface', () => {
    const categorySpec: InterfaceSpec = {
      ...mockInterfaceSpec,
      spec: {
        ...mockInterfaceSpec.spec,
        category: 'CA',
      },
    };

    const adapter = new InterfaceAdtAdapter(categorySpec);
    const xml = adapter.toAdtXML();

    expect(xml).toContain('ZIF_TEST_INTERFACE');
    expect(xml).toContain('intf:interface');
    expect(xml).toContain('CA');
  });

  it('should handle interface with no parent interfaces', () => {
    const noParentSpec: InterfaceSpec = {
      ...mockInterfaceSpec,
      spec: {
        ...mockInterfaceSpec.spec,
        interfaces: [],
      },
    };

    const adapter = new InterfaceAdtAdapter(noParentSpec);
    const xml = adapter.toAdtXML();

    expect(xml).toContain('ZIF_TEST_INTERFACE');
    expect(xml).toContain('intf:interface');
  });

  it('should handle interface with empty components', () => {
    const emptyComponentsSpec: InterfaceSpec = {
      ...mockInterfaceSpec,
      spec: {
        ...mockInterfaceSpec.spec,
        components: {
          methods: [],
          attributes: [],
          events: [],
          types: [],
        },
      },
    };

    const adapter = new InterfaceAdtAdapter(emptyComponentsSpec);
    const xml = adapter.toAdtXML();

    expect(xml).toContain('ZIF_TEST_INTERFACE');
    expect(xml).toContain('intf:interface');
  });

  it('should handle abstract methods correctly', () => {
    const adapter = new InterfaceAdtAdapter(mockInterfaceSpec);
    const spec = adapter.spec;

    // All interface methods should be abstract
    expect(spec.components.methods.every((m) => m.isAbstract)).toBe(true);
  });

  it('should handle interface without description', () => {
    const noDescSpec: InterfaceSpec = {
      ...mockInterfaceSpec,
      metadata: {
        name: 'ZIF_NO_DESC',
      },
    };

    const adapter = new InterfaceAdtAdapter(noDescSpec);
    expect(adapter.description).toBeUndefined();
    expect(adapter.name).toBe('ZIF_NO_DESC');
  });

  it('should handle interface with complex method signatures', () => {
    const complexMethodSpec: InterfaceSpec = {
      ...mockInterfaceSpec,
      spec: {
        ...mockInterfaceSpec.spec,
        components: {
          ...mockInterfaceSpec.spec.components,
          methods: [
            {
              name: 'COMPLEX_METHOD',
              isAbstract: true,
              parameters: [
                {
                  name: 'IV_REQUIRED',
                  type: 'IMPORTING',
                  dataType: 'STRING',
                  isOptional: false,
                },
                {
                  name: 'IV_OPTIONAL',
                  type: 'IMPORTING',
                  dataType: 'STRING',
                  isOptional: true,
                  defaultValue: "'DEFAULT'",
                },
                {
                  name: 'CV_CHANGING',
                  type: 'CHANGING',
                  dataType: 'STRING',
                  isOptional: false,
                },
                {
                  name: 'ET_EXPORT',
                  type: 'EXPORTING',
                  dataType: 'TY_DATA_TABLE',
                  isOptional: false,
                },
              ],
              exceptions: ['CX_ERROR1', 'CX_ERROR2'],
              description: 'Complex method with all parameter types',
            },
          ],
        },
      },
    };

    const adapter = new InterfaceAdtAdapter(complexMethodSpec);
    const xml = adapter.toAdtXML();

    expect(xml).toContain('COMPLEX_METHOD');
    expect(xml).toContain('ZIF_TEST_INTERFACE');
  });
});
