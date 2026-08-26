import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { abapgitFormatPlugin } from '../src/lib/format-plugin.ts';

describe('abapGit format materialization', () => {
  it('materializes every supported CDS and RAP source type in its abapGit layout', async () => {
    const sourceTypes = [
      ['BDEF', 'abdl'],
      ['DCLS', 'acds'],
      ['DDLS', 'acds'],
      ['DDLX', 'acds'],
      ['DRAS', 'acds'],
      ['DRTY', 'acds'],
      ['DSFD', 'acds'],
      ['DTDC', 'acds'],
      ['DTEB', 'acds'],
      ['DTIX', 'acds'],
      ['DTSC', 'acds'],
      ['SRVD', 'acds'],
    ] as const;

    for (const [objectType, sourceExtension] of sourceTypes) {
      const objectName = `Z_FIXTURE_${objectType}`;
      const source = `define ${objectType.toLowerCase()} ${objectName}.`;
      const result = await abapgitFormatPlugin.materialize!({
        object: {
          name: objectName,
          description: `${objectType} fixture`,
          originalLanguage: 'EN',
        },
        objectType,
        packagePath: ['ZROOT'],
        sources: { main: source },
      });

      const suffix = objectType.toLowerCase();
      assert.deepStrictEqual(
        result.files.map((file) => file.path),
        [
          `src/z_fixture_${suffix}.${suffix}.${sourceExtension}`,
          `src/z_fixture_${suffix}.${suffix}.json`,
        ],
      );
      assert.strictEqual(result.files[0]?.content, source);
    }
  });

  it('materializes every supported CDS and RAP metadata-only type in its abapGit layout', async () => {
    const desd = await abapgitFormatPlugin.materialize!({
      object: {
        name: 'Z_FIXTURE_DESD',
        description: 'DESD fixture',
        originalLanguage: 'EN',
      },
      objectType: 'DESD',
      packagePath: ['ZROOT'],
    });
    assert.deepStrictEqual(
      desd.files.map((file) => file.path),
      ['src/z_fixture_desd.desd.json'],
    );

    const dsfiDefinition = {
      formatVersion: '1' as const,
      header: { description: 'DSFI fixture', originalLanguage: 'en' },
      scalarFunctionName: 'Z_FIXTURE_DSFI',
      engine: 'analyticalEngine' as const,
    };
    const dsfi = await abapgitFormatPlugin.materialize!({
      object: {
        name: 'Z_FIXTURE_DSFI',
        getSource: async () => dsfiDefinition,
      },
      objectType: 'DSFI',
      packagePath: ['ZROOT'],
    });
    assert.deepStrictEqual(
      dsfi.files.map((file) => file.path),
      ['src/z_fixture_dsfi.dsfi.json'],
    );
    assert.deepStrictEqual(JSON.parse(dsfi.files[0]!.content), dsfiDefinition);

    const srvb = await abapgitFormatPlugin.materialize!({
      object: { name: 'Z_FIXTURE_SRVB' },
      objectType: 'SRVB',
      packagePath: ['ZROOT'],
    });
    assert.deepStrictEqual(
      srvb.files.map((file) => file.path),
      ['src/z_fixture_srvb.srvb.xml'],
    );
  });

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
