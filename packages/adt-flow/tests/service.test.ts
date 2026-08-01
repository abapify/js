import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { TransportSourceManifest } from '@abapify/adk';
import type { SourceVersionRef } from '@abapify/adt-client';
import type { FormatPlugin } from '@abapify/adt-plugin';
import { createAdtFlowService, type FlowCheckoutDependencies } from '../src';

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});

async function root(): Promise<string> {
  const value = await mkdtemp(join(tmpdir(), 'adt-flow-'));
  roots.push(value);
  return value;
}

function version(
  id: string,
  sourceUri = `/sap/bc/adt/source/${id}`,
): SourceVersionRef {
  return { id, ordinal: 0, sourceUri, transports: [] };
}

function manifest(
  changeKind: 'modified' | 'deleted' | 'added',
  base: SourceVersionRef | undefined,
  head: SourceVersionRef | undefined,
  transport = 'DEVK900001',
): TransportSourceManifest {
  return {
    requestedTransports: [transport],
    scopeTransports: [transport],
    entries: [
      {
        object: {
          pgmid: 'R3TR',
          type: 'CLAS',
          name: 'ZCL_SAMPLE',
          packageName: 'ZROOT_FEATURE',
        },
        component: { id: 'main' },
        sourceTransport: transport,
        changeKind,
        exact: true,
        ...(base ? { base } : {}),
        ...(head ? { head } : {}),
      },
    ],
  };
}

const format: FormatPlugin = {
  id: 'abapgit',
  description: 'fixture',
  supportedTypes: ['CLAS'],
  getHandler: () => undefined,
  parseFilename(filename) {
    const match = /^(?<name>.+)\.clas\.(?<extension>abap|xml)$/.exec(filename);
    return match?.groups
      ? {
          name: (match.groups['name'] ?? '').toUpperCase(),
          type: 'CLAS',
          extension: match.groups['extension'] ?? '',
        }
      : undefined;
  },
  async materialize(input) {
    expect(this).toBe(format);
    const object = input.object as { name: string };
    const directory = input.packagePath
      .slice(1)
      .map((part, index) => {
        const parent = input.packagePath[index] ?? '';
        const prefix = `${parent}_`;
        return (
          part.startsWith(prefix) ? part.slice(prefix.length) : part
        ).toLowerCase();
      })
      .join('/');
    const prefix = `src/${directory ? `${directory}/` : ''}${object.name.toLowerCase()}.clas`;
    return {
      files: [
        {
          path: `${prefix}.abap`,
          content: input.sources?.['main'] ?? '',
          role: 'source',
          sourceComponent: 'main',
        },
        {
          path: `${prefix}.xml`,
          content: `<CLASS NAME="${object.name}"/>\n`,
          role: 'metadata',
        },
      ],
    };
  },
};

function dependencies(
  current: () => TransportSourceManifest,
): FlowCheckoutDependencies & {
  buildManifest: ReturnType<typeof vi.fn>;
  readSource: ReturnType<typeof vi.fn>;
  loadObject: ReturnType<typeof vi.fn>;
} {
  return {
    format,
    buildManifest: vi.fn(async () => current()),
    readSource: vi.fn(
      async (selected: SourceVersionRef) => `source ${selected.id}\n`,
    ),
    loadObject: vi.fn(async () => ({
      object: { name: 'ZCL_SAMPLE' },
      packagePath: ['ZROOT', 'ZROOT_FEATURE'],
    })),
  };
}

const config = {
  format: { id: 'abapgit', options: { folderLogic: 'prefix' } },
  include: { objectTypes: ['CLAS'] },
};

describe('transport checkout', () => {
  it('materializes before then head so the workspace contains a real update', async () => {
    const workspace = await root();
    let current = manifest('modified', version('before'), version('after'));
    const ports = dependencies(() => current);
    const flow = createAdtFlowService(ports);

    const base = await flow.checkout({
      root: workspace,
      transports: ['DEVK900001'],
      mode: 'base',
      config,
    });
    expect(
      await readFile(
        join(workspace, 'src/feature/zcl_sample.clas.abap'),
        'utf8',
      ),
    ).toBe('source before\n');
    await expect(
      readFile(join(workspace, '.adt/tr/DEVK900001.json'), 'utf8'),
    ).rejects.toMatchObject({ code: 'ENOENT' });
    expect(base.changed).toEqual([
      'src/feature/zcl_sample.clas.abap',
      'src/feature/zcl_sample.clas.xml',
    ]);

    current = manifest('modified', version('before'), version('after'));
    const head = await flow.checkout({
      root: workspace,
      transports: ['DEVK900001'],
      config,
    });
    expect(
      await readFile(
        join(workspace, 'src/feature/zcl_sample.clas.abap'),
        'utf8',
      ),
    ).toBe('source after\n');
    expect(head.changed).toEqual(['src/feature/zcl_sample.clas.abap']);
    expect(head.removed).toEqual([]);
    expect(
      JSON.parse(
        await readFile(join(workspace, '.adt/tr/DEVK900001.json'), 'utf8'),
      ),
    ).not.toHaveProperty('fetchedAt');
  });

  it('repeats an exact released head with zero SAP calls and zero writes', async () => {
    const workspace = await root();
    const ports = dependencies(() =>
      manifest('modified', version('before'), version('after')),
    );
    const flow = createAdtFlowService(ports);
    await flow.checkout({
      root: workspace,
      transports: ['DEVK900001'],
      config,
    });
    ports.buildManifest.mockClear();
    ports.readSource.mockClear();
    ports.loadObject.mockClear();

    const result = await flow.checkout({
      root: workspace,
      transports: ['DEVK900001'],
      config,
    });

    expect(result.fastPath).toBe('exact-head');
    expect(result.changed).toEqual([]);
    expect(result.sapCalls).toEqual({ manifest: 0, metadata: 0, source: 0 });
    expect(ports.buildManifest).not.toHaveBeenCalled();
    expect(ports.readSource).not.toHaveBeenCalled();
    expect(ports.loadObject).not.toHaveBeenCalled();
  });

  it('reuses an indexed component as the base of the next transport', async () => {
    const workspace = await root();
    let current = manifest(
      'modified',
      version('initial'),
      version('indexed'),
      'DEVK900001',
    );
    const ports = dependencies(() => current);
    const flow = createAdtFlowService(ports);
    await flow.checkout({
      root: workspace,
      transports: ['DEVK900001'],
      config,
    });
    ports.readSource.mockClear();
    current = manifest(
      'modified',
      version('indexed'),
      version('next'),
      'DEVK900002',
    );

    const result = await flow.checkout({
      root: workspace,
      transports: ['DEVK900002'],
      mode: 'base',
      config,
    });

    expect(result.fastPath).toBe('indexed-components');
    expect(result.sapCalls).toEqual({ manifest: 1, metadata: 0, source: 0 });
    expect(ports.readSource).not.toHaveBeenCalled();
    expect(ports.loadObject).toHaveBeenCalledTimes(1);
    expect(
      await readFile(
        join(workspace, 'src/feature/zcl_sample.clas.abap'),
        'utf8',
      ),
    ).toBe('source indexed\n');
  });

  it('shows a first-observed deletion even when no descriptor exists', async () => {
    const workspace = await root();
    await mkdir(join(workspace, 'src/feature'), { recursive: true });
    await writeFile(
      join(workspace, 'src/feature/zcl_sample.clas.abap'),
      'old source\n',
    );
    await writeFile(
      join(workspace, 'src/feature/zcl_sample.clas.xml'),
      '<CLASS/>\n',
    );
    const ports = dependencies(() =>
      manifest('deleted', version('before'), undefined),
    );

    const result = await createAdtFlowService(ports).checkout({
      root: workspace,
      transports: ['DEVK900001'],
      config,
    });

    expect(result.removed).toEqual([
      'src/feature/zcl_sample.clas.abap',
      'src/feature/zcl_sample.clas.xml',
    ]);
    expect(ports.loadObject).not.toHaveBeenCalled();
    expect(
      JSON.parse(
        await readFile(
          join(workspace, '.adt/objects/CLAS/zcl_sample.clas.adt.json'),
          'utf8',
        ),
      ).state,
    ).toBe('deleted');
  });

  it('fails before source reads when an indexed file was edited locally', async () => {
    const workspace = await root();
    const ports = dependencies(() =>
      manifest('modified', version('before'), version('after')),
    );
    const flow = createAdtFlowService(ports);
    await flow.checkout({
      root: workspace,
      transports: ['DEVK900001'],
      mode: 'base',
      config,
    });
    await writeFile(
      join(workspace, 'src/feature/zcl_sample.clas.abap'),
      'local edit\n',
    );
    ports.readSource.mockClear();

    await expect(
      flow.checkout({ root: workspace, transports: ['DEVK900001'], config }),
    ).rejects.toMatchObject({ code: 'working_tree_diverged' });
    expect(ports.readSource).not.toHaveBeenCalled();
    expect(
      await readFile(
        join(workspace, 'src/feature/zcl_sample.clas.abap'),
        'utf8',
      ),
    ).toBe('local edit\n');
  });

  it('validates exactness for the complete scope before any source read', async () => {
    const workspace = await root();
    const current = manifest('modified', version('before'), version('after'));
    current.entries.push({
      object: {
        pgmid: 'R3TR',
        type: 'CLAS',
        name: 'ZCL_ZZZ_INEXACT',
        packageName: 'ZROOT_FEATURE',
      },
      component: { id: 'main' },
      sourceTransport: 'DEVK900001',
      changeKind: 'ambiguous',
      exact: false,
      diagnostic: {
        code: 'SOURCE_HISTORY_SCOPE_VERSION_MISSING',
        message: 'No exact version belongs to the scope.',
      },
    });
    const ports = dependencies(() => current);

    await expect(
      createAdtFlowService(ports).checkout({
        root: workspace,
        transports: ['DEVK900001'],
        config,
      }),
    ).rejects.toMatchObject({ code: 'manifest_inexact' });
    expect(ports.readSource).not.toHaveBeenCalled();
    expect(ports.loadObject).not.toHaveBeenCalled();
  });

  it('reconciles a package reassignment as old-path removal plus new-path writes', async () => {
    const workspace = await root();
    let current = manifest(
      'modified',
      version('old'),
      version('first'),
      'DEVK900001',
    );
    let packagePath = ['ZROOT', 'ZROOT_OLD'];
    const ports = dependencies(() => current);
    ports.readSource.mockImplementation(async () => 'stable source\n');
    ports.loadObject.mockImplementation(async () => ({
      object: { name: 'ZCL_SAMPLE' },
      packagePath,
    }));
    const flow = createAdtFlowService(ports);
    await flow.checkout({
      root: workspace,
      transports: ['DEVK900001'],
      config,
    });

    current = manifest(
      'modified',
      version('first'),
      version('second'),
      'DEVK900002',
    );
    packagePath = ['ZROOT', 'ZROOT_NEW'];
    const result = await flow.checkout({
      root: workspace,
      transports: ['DEVK900002'],
      config,
    });

    await expect(
      readFile(join(workspace, 'src/old/zcl_sample.clas.abap')),
    ).rejects.toMatchObject({ code: 'ENOENT' });
    expect(
      await readFile(join(workspace, 'src/new/zcl_sample.clas.abap'), 'utf8'),
    ).toBe('stable source\n');
    expect(result.moved).toEqual([
      {
        from: 'src/old/zcl_sample.clas.abap',
        to: 'src/new/zcl_sample.clas.abap',
      },
      {
        from: 'src/old/zcl_sample.clas.xml',
        to: 'src/new/zcl_sample.clas.xml',
      },
    ]);
    expect(result.changed).toEqual([]);
    expect(result.removed).toEqual([]);
  });

  it('reconstructs the same source tree after the optional index is removed', async () => {
    const workspace = await root();
    const ports = dependencies(() =>
      manifest('modified', version('before'), version('after')),
    );
    const flow = createAdtFlowService(ports);
    await flow.checkout({
      root: workspace,
      transports: ['DEVK900001'],
      config,
    });
    const before = await readFile(
      join(workspace, 'src/feature/zcl_sample.clas.abap'),
      'utf8',
    );
    await rm(join(workspace, '.adt'), { recursive: true, force: true });
    ports.readSource.mockClear();

    const result = await flow.checkout({
      root: workspace,
      transports: ['DEVK900001'],
      config,
    });

    expect(
      await readFile(
        join(workspace, 'src/feature/zcl_sample.clas.abap'),
        'utf8',
      ),
    ).toBe(before);
    expect(result.fastPath).toBe('none');
    expect(ports.readSource).toHaveBeenCalledOnce();
  });
});
