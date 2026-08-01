import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { abapgitFormatPlugin } from '../src/lib/format-plugin.ts';

describe('abapGit format materialization', () => {
  it('materializes an explicit historical interface source without reading ADT', async () => {
    const object = {
      name: 'ZIF_FLOW_EXAMPLE',
      description: 'Flow example',
      dataSync: {
        name: 'ZIF_FLOW_EXAMPLE',
        description: 'Flow example',
        language: 'EN',
      },
      getSource: async () => {
        throw new Error('mutable source must not be read');
      },
    };

    const result = await abapgitFormatPlugin.materialize!({
      object,
      objectType: 'INTF',
      packagePath: ['ZROOT', 'ZROOT_FEATURE'],
      sources: { main: 'interface zif_flow_example public.' },
      formatOptions: { folderLogic: 'prefix' },
    });

    assert.deepStrictEqual(
      result.files.map(({ path, role, sourceComponent }) => ({
        path,
        role,
        sourceComponent,
      })),
      [
        {
          path: 'src/feature/zif_flow_example.intf.abap',
          role: 'source',
          sourceComponent: 'main',
        },
        {
          path: 'src/feature/zif_flow_example.intf.xml',
          role: 'metadata',
          sourceComponent: undefined,
        },
      ],
    );
    assert.strictEqual(
      result.files[0]?.content,
      'interface zif_flow_example public.',
    );
  });

  it('materializes only supplied class components with deterministic paths', async () => {
    const object = {
      name: 'ZCL_FLOW_EXAMPLE',
      description: 'Flow example',
      dataSync: {
        name: 'ZCL_FLOW_EXAMPLE',
        description: 'Flow example',
        language: 'EN',
        include: [
          { includeType: 'main' },
          { includeType: 'definitions' },
          { includeType: 'testclasses' },
        ],
      },
      getIncludeSource: async () => {
        throw new Error('mutable source must not be read');
      },
    };

    const result = await abapgitFormatPlugin.materialize!({
      object,
      objectType: 'CLAS',
      packagePath: ['ZROOT'],
      sources: {
        main: 'class zcl_flow_example definition.',
        definitions: 'class lcl_helper definition.',
      },
      formatOptions: { folderLogic: 'prefix' },
    });

    assert.deepStrictEqual(
      result.files.map(({ path, role, sourceComponent }) => ({
        path,
        role,
        sourceComponent,
      })),
      [
        {
          path: 'src/zcl_flow_example.clas.abap',
          role: 'source',
          sourceComponent: 'main',
        },
        {
          path: 'src/zcl_flow_example.clas.locals_def.abap',
          role: 'source',
          sourceComponent: 'definitions',
        },
        {
          path: 'src/zcl_flow_example.clas.xml',
          role: 'metadata',
          sourceComponent: undefined,
        },
      ],
    );
    assert.ok(result.files.every(({ path }) => !path.includes('testclasses')));
  });

  it('rejects unsupported object types without producing a partial tree', async () => {
    await assert.rejects(
      abapgitFormatPlugin.materialize!({
        object: { name: 'ZUNKNOWN', dataSync: {} },
        objectType: 'UNKNOWN',
        packagePath: ['ZROOT'],
        sources: { main: 'source' },
      }),
      (error: unknown) =>
        error instanceof Error &&
        'code' in error &&
        error.code === 'FORMAT_OBJECT_TYPE_UNSUPPORTED',
    );
  });
});
