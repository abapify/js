import assert from 'node:assert/strict';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, it } from 'vitest';
import { outputGitLabCodeQuality } from '../../src/formatters/gitlab';
import { createAbapGitResolver } from '../../src/resolvers/abapgit';
import type { AtcResult, FindingResolver } from '../../src/types';

const temporaryDirectories: string[] = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
  delete process.env.CI_PROJECT_DIR;
  delete process.env.ADT_CONFIG_PATH;
});

function createAbapGitFixture(): string {
  const repositoryRoot = mkdtempSync(join('/tmp', 'adt-atc-abapgit-'));
  temporaryDirectories.push(repositoryRoot);

  mkdirSync(join(repositoryRoot, 'abap', 'fugr'), { recursive: true });
  writeFileSync(
    join(repositoryRoot, '.abapgit.xml'),
    '<STARTING_FOLDER>/abap/</STARTING_FOLDER><FOLDER_LOGIC>PREFIX</FOLDER_LOGIC>',
  );
  writeFileSync(
    join(repositoryRoot, 'adt.config.ts'),
    "export default { flow: { format: { id: 'abapgit', options: { folderLogic: 'prefix' } } } };\n",
  );

  for (const functionModule of ['zfm_tax_custline', 'zfm_tax_splititm']) {
    writeFileSync(
      join(
        repositoryRoot,
        'abap',
        'fugr',
        `zfg_tax_custline.fugr.${functionModule}.abap`,
      ),
      `FUNCTION ${functionModule}\nENDFUNCTION.\n`,
    );
  }

  return repositoryRoot;
}

function resolveWithLocation(
  resolver: FindingResolver,
  objectType: string,
  objectName: string,
  line: number,
  location: string,
) {
  return (
    resolver.resolve as unknown as (
      type: string,
      name: string,
      atcLine: number,
      methodName: string | undefined,
      atcLocation: string,
    ) => Promise<Awaited<ReturnType<FindingResolver['resolve']>>>
  )(objectType, objectName, line, undefined, location);
}

describe('abapGit ATC finding resolver', () => {
  it('uses the full ATC URI and PREFIX metadata to resolve compound objects', async () => {
    const repositoryRoot = createAbapGitFixture();
    process.env.CI_PROJECT_DIR = repositoryRoot;
    process.env.ADT_CONFIG_PATH = join(repositoryRoot, 'adt.config.ts');

    const resolver = createAbapGitResolver();
    const resolved = await resolveWithLocation(
      resolver,
      'FUGR',
      'ZFG_TAX_CUSTLINE',
      211,
      '/sap/bc/adt/functions/groups/zfg_tax_custline/fmodules/zfm_tax_custline/source/main#start=211,0',
    );

    assert.deepEqual(resolved, {
      path: 'abap/fugr/zfg_tax_custline.fugr.zfm_tax_custline.abap',
      line: 211,
    });
  });

  it('passes the full ATC URI through the GitLab formatter', async () => {
    const repositoryRoot = createAbapGitFixture();
    process.env.CI_PROJECT_DIR = repositoryRoot;
    process.env.ADT_CONFIG_PATH = join(repositoryRoot, 'adt.config.ts');

    const outputFile = join(repositoryRoot, 'report.json');
    const result: AtcResult = {
      checkVariant: 'DEFAULT',
      totalFindings: 2,
      errorCount: 0,
      warningCount: 0,
      infoCount: 2,
      findings: [
        {
          checkId: 'CHECK',
          checkTitle: 'Check',
          messageId: '001',
          priority: 3,
          messageText: 'first',
          objectUri: '/sap/bc/adt/functions/groups/zfg_tax_custline',
          objectType: 'FUGR',
          objectName: 'ZFG_TAX_CUSTLINE',
          location:
            '/sap/bc/adt/functions/groups/zfg_tax_custline/fmodules/zfm_tax_custline/source/main#start=211,0',
        },
        {
          checkId: 'CHECK',
          checkTitle: 'Check',
          messageId: '002',
          priority: 3,
          messageText: 'second',
          objectUri: '/sap/bc/adt/functions/groups/zfg_tax_custline',
          objectType: 'FUGR',
          objectName: 'ZFG_TAX_CUSTLINE',
          location:
            '/sap/bc/adt/functions/groups/zfg_tax_custline/fmodules/zfm_tax_splititm/source/main#start=195,0',
        },
      ],
    };

    await outputGitLabCodeQuality(result, outputFile, {
      resolver: createAbapGitResolver(),
    });

    const report = JSON.parse(readFileSync(outputFile, 'utf8')) as Array<{
      location: { path: string; lines: { begin: number; end: number } };
    }>;
    assert.deepEqual(
      report.map((finding) => [
        finding.location.path,
        finding.location.lines.begin,
      ]),
      [
        ['abap/fugr/zfg_tax_custline.fugr.zfm_tax_custline.abap', 211],
        ['abap/fugr/zfg_tax_custline.fugr.zfm_tax_splititm.abap', 195],
      ],
    );
  });
});
