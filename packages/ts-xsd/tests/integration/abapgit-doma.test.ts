/**
 * Integration test for abapGit DOMA schema with xs:import
 * 
 * Tests xs:import handling variants:
 * 1. raw - preserves import directives as-is (no linking)
 * 2. linked - converts to $imports with TypeScript imports
 * 
 * Schema structure:
 * - doma.xsd (only root: abapGit)
 *   - xs:import asx.xsd (different namespace: http://www.sap.com/abapxml)
 * - asx.xsd (SAP ABAP XML envelope)
 * 
 * Key validation: DD01V cannot be root element (only abapGit can)
 */
import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runCodegen } from '../../src/codegen/runner.ts';
import { rawSchema } from '../../src/generators/raw-schema.ts';
import type { CodegenConfig } from '../../src/codegen/types.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, '../fixtures/abapgit-doma');
const generatedDir = join(__dirname, 'generated/abapgit-doma');

// Output directories for each variant
const outputDirs = {
  raw: 'raw',
  linked: 'linked',
};

describe('abapGit DOMA xs:include + xs:import integration', () => {
  before(() => {
    // Ensure all output directories exist
    for (const dir of Object.values(outputDirs)) {
      const fullPath = join(generatedDir, dir);
      if (!existsSync(fullPath)) {
        mkdirSync(fullPath, { recursive: true });
      }
    }
  });

  it('should generate RAW output - preserves include/import directives as-is', async () => {
    const config: CodegenConfig = {
      sources: {
        'abapgit-doma': {
          xsdDir: '.',
          outputDir: join(generatedDir, outputDirs.raw),
          schemas: ['doma', 'abapgit', 'asx'],
        },
      },
      generators: [
        rawSchema({ $includes: false, $imports: false }),  // Disable linking
      ],
    };

    const result = await runCodegen(config, { rootDir: fixturesDir });
    assert.strictEqual(result.errors.length, 0, `Errors: ${JSON.stringify(result.errors)}`);

    const domaFile = result.files.find(f => f.path.includes('doma') && !f.path.includes('index'));
    assert.ok(domaFile, 'Should generate doma.ts');

    const content = readFileSync(domaFile.path, 'utf-8');

    // RAW: Should have raw include/import directives
    // Note: "import" is quoted in output because it's a reserved word
    assert.ok(content.includes('include:') || content.includes('include: ['), 'RAW should have include property');
    assert.ok(content.includes('"import"') || content.includes("'import'"), 'RAW should have import property');
    assert.ok(content.includes('schemaLocation'), 'RAW should have schemaLocation');
    assert.ok(content.includes('abapgit.xsd'), 'RAW should reference abapgit.xsd');
    assert.ok(content.includes('asx.xsd'), 'RAW should reference asx.xsd');
    assert.ok(!content.includes('$includes'), 'RAW should NOT have $includes');
    assert.ok(!content.includes('$imports'), 'RAW should NOT have $imports');
    assert.ok(!content.includes("import abapgit from"), 'RAW should NOT have import statement');
  });

  it('should generate LINKED output - $includes/$imports with TypeScript imports', async () => {
    const config: CodegenConfig = {
      sources: {
        'abapgit-doma': {
          xsdDir: '.',
          outputDir: join(generatedDir, outputDirs.linked),
          schemas: ['doma', 'abapgit', 'asx'],
        },
      },
      generators: [
        rawSchema({ $includes: true, $imports: true }),  // Enable linking (default)
      ],
    };

    const result = await runCodegen(config, { rootDir: fixturesDir });
    assert.strictEqual(result.errors.length, 0, `Errors: ${JSON.stringify(result.errors)}`);

    const domaFile = result.files.find(f => f.path.includes('doma') && !f.path.includes('index'));
    assert.ok(domaFile, 'Should generate doma.ts');

    const content = readFileSync(domaFile.path, 'utf-8');

    // LINKED: Should have $includes/$imports and import statements
    assert.ok(content.includes('$includes'), 'LINKED should have $includes');
    assert.ok(content.includes('$imports'), 'LINKED should have $imports');
    assert.ok(content.includes("import abapgit from './abapgit'"), 'LINKED should have abapgit import');
    assert.ok(content.includes("import asx from './asx'"), 'LINKED should have asx import');
    assert.ok(!content.includes('include:'), 'LINKED should NOT have include: property');
    assert.ok(!content.includes('schemaLocation'), 'LINKED should NOT have schemaLocation');

    // Should have doma's own content
    assert.ok(content.includes('Dd01vType'), 'LINKED should have Dd01vType');
    assert.ok(content.includes('DD01V'), 'LINKED should have DD01V element');
  });

  it('should produce different outputs for RAW vs LINKED', async () => {
    // Read both generated files
    const rawContent = readFileSync(join(generatedDir, outputDirs.raw, 'doma.ts'), 'utf-8');
    const linkedContent = readFileSync(join(generatedDir, outputDirs.linked, 'doma.ts'), 'utf-8');

    // RAW and LINKED should be different
    assert.notStrictEqual(rawContent, linkedContent, 'RAW and LINKED should be different');

    // RAW has "import": [...] directive
    assert.ok(rawContent.includes('"import"'), 'RAW should have import directive');
    
    // LINKED has $imports: [...] with TypeScript import
    assert.ok(linkedContent.includes('$imports'), 'LINKED should have $imports');
    assert.ok(linkedContent.includes("import asx from"), 'LINKED should have TypeScript import');

    console.log('\n=== Output sizes ===');
    console.log(`RAW:    ${rawContent.length} chars`);
    console.log(`LINKED: ${linkedContent.length} chars`);
  });
});
