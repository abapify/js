/**
 * Tests for createHandler factory and base handler functionality
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  createHandler,
  getHandler,
  getSupportedTypes,
} from '../../src/lib/handlers/base.ts';

describe('createHandler factory', () => {
  it('creates handler with string type', () => {
    // Use a mock schema with build method
    const mockSchema = {
      build: (data: unknown) => `<xml>${JSON.stringify(data)}</xml>`,
    };

    const handler = createHandler('TEST', {
      schema: mockSchema as any,
      version: 'v1.0.0',
      serializer: 'LCL_OBJECT_TEST',
      serializer_version: 'v1.0.0',
      toAbapGit: (obj) => ({ NAME: obj.name ?? '' }),
    });

    assert.strictEqual(handler.type, 'TEST');
    assert.strictEqual(handler.fileExtension, 'test');
    assert.ok(typeof handler.serialize === 'function');
  });

  it('auto-registers handler in registry', () => {
    // Handler should be registered when created
    const types = getSupportedTypes();
    assert.ok(types.includes('TEST'), 'Handler should be registered');
  });

  it('getHandler returns registered handler', () => {
    const handler = getHandler('TEST');
    assert.ok(handler !== undefined);
    assert.strictEqual(handler?.type, 'TEST');
  });

  it('getHandler returns undefined for unknown type', () => {
    const handler = getHandler('UNKNOWN_TYPE_XYZ');
    assert.strictEqual(handler, undefined);
  });
});

describe('default serialize behavior', () => {
  // Mock schema that returns XML-like content
  const mockSchema = {
    build: (data: unknown) =>
      `<?xml version="1.0"?><root>${JSON.stringify(data)}</root>`,
  };

  it('creates XML file when no getSource provided', async () => {
    const mockObject = {
      name: 'TEST_OBJ',
      description: 'Test description',
      dataSync: { name: 'TEST_OBJ', description: 'Test description' },
    };

    const handler = createHandler('XMLONLY', {
      schema: mockSchema as any,
      version: 'v1.0.0',
      serializer: 'LCL_OBJECT_XMLONLY',
      serializer_version: 'v1.0.0',
      toAbapGit: (obj) => ({ CTEXT: obj.description ?? '' }),
    });

    const files = await handler.serialize(mockObject as any);

    assert.strictEqual(files.length, 1);
    assert.ok(files[0].path.endsWith('.xmlonly.xml'));
    assert.ok(files[0].content.includes('<?xml'));
  });

  it('creates ABAP + XML files when getSource provided', async () => {
    const mockObject = {
      name: 'TEST_SRC',
      description: 'Test with source',
      dataSync: { name: 'TEST_SRC', description: 'Test with source' },
    };

    const handler = createHandler('WITHSRC', {
      schema: mockSchema as any,
      version: 'v1.0.0',
      serializer: 'LCL_OBJECT_WITHSRC',
      serializer_version: 'v1.0.0',
      toAbapGit: (obj) => ({ CTEXT: obj.description ?? '' }),
      getSource: async () => '* ABAP source code',
    });

    const files = await handler.serialize(mockObject as any);

    assert.strictEqual(files.length, 2);

    const abapFile = files.find((f) => f.path.endsWith('.abap'));
    const xmlFile = files.find((f) => f.path.endsWith('.xml'));

    assert.ok(abapFile, 'Should have ABAP file');
    assert.ok(xmlFile, 'Should have XML file');
    assert.strictEqual(abapFile?.content, '* ABAP source code');
  });

  it('treats explicit sources as authoritative and skips mutable getters', async () => {
    const mockObject = {
      name: 'TEST_OVERRIDE',
      dataSync: { name: 'TEST_OVERRIDE' },
    };
    let getterCalls = 0;

    const handler = createHandler('OVERRIDE', {
      schema: mockSchema as any,
      version: 'v1.0.0',
      serializer: 'LCL_OBJECT_OVERRIDE',
      serializer_version: 'v1.0.0',
      toAbapGit: (obj) => ({ NAME: obj.name }),
      getSource: async () => {
        getterCalls += 1;
        return 'mutable source';
      },
    });

    const files = await handler.serialize(mockObject as any, {
      sources: { main: 'immutable historical source' },
    });

    assert.strictEqual(getterCalls, 0);
    assert.strictEqual(
      files.find((file) => file.path.endsWith('.abap'))?.content,
      'immutable historical source',
    );
  });

  it('rejects source overrides for metadata-only handlers', async () => {
    const handler = createHandler('METADATA_ONLY', {
      schema: mockSchema as any,
      version: 'v1.0.0',
      serializer: 'LCL_OBJECT_METADATA_ONLY',
      serializer_version: 'v1.0.0',
      toAbapGit: (obj) => ({ NAME: obj.name }),
    });

    await assert.rejects(
      handler.serialize(
        {
          name: 'TEST_METADATA',
          dataSync: { name: 'TEST_METADATA' },
        } as any,
        { sources: { main: 'invalid source' } },
      ),
      (error: unknown) =>
        error instanceof Error &&
        'code' in error &&
        error.code === 'FORMAT_SOURCE_COMPONENT_UNSUPPORTED',
    );
  });

  it('creates multiple ABAP files when getSources provided', async () => {
    const mockObject = {
      name: 'TEST_MULTI',
      description: 'Test with multiple sources',
      dataSync: {
        name: 'TEST_MULTI',
        description: 'Test with multiple sources',
      },
    };

    const handler = createHandler('MULTISRC', {
      schema: mockSchema as any,
      version: 'v1.0.0',
      serializer: 'LCL_OBJECT_MULTISRC',
      serializer_version: 'v1.0.0',
      toAbapGit: (obj) => ({ CTEXT: obj.description ?? '' }),
      getSources: () => [
        { content: Promise.resolve('* Main source') },
        {
          suffix: 'locals_def',
          content: Promise.resolve('* Local definitions'),
        },
        { suffix: 'testclasses', content: Promise.resolve('') }, // Empty - should be filtered
      ],
    });

    const files = await handler.serialize(mockObject as any);

    // Should have 2 ABAP files (empty one filtered) + 1 XML
    const abapFiles = files.filter((f) => f.path.endsWith('.abap'));
    const xmlFiles = files.filter((f) => f.path.endsWith('.xml'));

    assert.strictEqual(
      abapFiles.length,
      2,
      'Should have 2 non-empty ABAP files',
    );
    assert.strictEqual(xmlFiles.length, 1, 'Should have 1 XML file');

    // Check suffixes
    assert.ok(
      abapFiles.some((f) => f.path === 'test_multi.multisrc.abap'),
      'Main file',
    );
    assert.ok(
      abapFiles.some((f) => f.path === 'test_multi.multisrc.locals_def.abap'),
      'Locals def file',
    );
  });

  it('uses custom xmlFileName when provided', async () => {
    const mockObject = {
      name: 'TEST_PKG',
      description: 'Test package',
      dataSync: { name: 'TEST_PKG', description: 'Test package' },
    };

    const handler = createHandler('CUSTXML', {
      schema: mockSchema as any,
      version: 'v1.0.0',
      serializer: 'LCL_OBJECT_CUSTXML',
      serializer_version: 'v1.0.0',
      xmlFileName: 'package.devc.xml',
      toAbapGit: (obj) => ({ CTEXT: obj.description ?? '' }),
    });

    const files = await handler.serialize(mockObject as any);

    assert.strictEqual(files.length, 1);
    assert.strictEqual(files[0].path, 'package.devc.xml');
  });
});
