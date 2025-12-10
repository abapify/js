/**
 * Integration test for abapGit DOMA schema
 * 
 * Tests all XSD composition features as used in adt-plugin-abapgit:
 * - xs:include - types/dd01v.xsd, types/dd07v.xsd (same namespace)
 * - xs:redefine - asx.xsd (extends AbapValuesType)
 * - xs:import - abapgit.xsd (no namespace)
 * 
 * Schema structure (from adt-plugin-abapgit/xsd/):
 * - doma.xsd (targetNamespace: http://www.sap.com/abapxml)
 *   - xs:include types/dd01v.xsd (Dd01vType)
 *   - xs:include types/dd07v.xsd (Dd07vType, Dd07vTabType)
 *   - xs:redefine asx.xsd (extends AbapValuesType with DD01V, DD07V_TAB)
 *   - xs:import abapgit.xsd (abapGit root element)
 * - asx.xsd (SAP ABAP XML envelope with asx:abap)
 * - abapgit.xsd (abapGit root element wrapper)
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

describe('abapGit DOMA schema integration', () => {
  before(() => {
    // Ensure all output directories exist
    for (const dir of Object.values(outputDirs)) {
      const fullPath = join(generatedDir, dir);
      if (!existsSync(fullPath)) {
        mkdirSync(fullPath, { recursive: true });
      }
    }
  });

  it('should generate RAW output - preserves include/import/redefine directives as-is', async () => {
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

    // RAW: Should have raw XSD directives
    // doma.xsd has: xs:include (types), xs:redefine (asx.xsd), xs:import (abapgit.xsd)
    assert.ok(content.includes('include'), 'RAW should have include directive');
    assert.ok(content.includes('redefine'), 'RAW should have redefine directive');
    assert.ok(content.includes('"import"') || content.includes("'import'"), 'RAW should have import property');
    assert.ok(content.includes('schemaLocation'), 'RAW should have schemaLocation');
    assert.ok(content.includes('types/dd01v.xsd'), 'RAW should reference types/dd01v.xsd');
    assert.ok(content.includes('types/dd07v.xsd'), 'RAW should reference types/dd07v.xsd');
    assert.ok(content.includes('asx.xsd'), 'RAW should reference asx.xsd');
    assert.ok(content.includes('abapgit.xsd'), 'RAW should reference abapgit.xsd');
    assert.ok(!content.includes('$includes'), 'RAW should NOT have $includes');
    assert.ok(!content.includes('$imports'), 'RAW should NOT have $imports');
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

    // LINKED: Should have $imports for abapgit.xsd (xs:import)
    // Note: xs:include and xs:redefine reference same-namespace schemas
    // so they may appear as $includes or be handled differently
    assert.ok(content.includes('$imports'), 'LINKED should have $imports');
    assert.ok(content.includes("import abapgit from './abapgit'"), 'LINKED should have abapgit import');

    // Should have redefine content (AbapValuesType extension)
    assert.ok(content.includes('redefine'), 'LINKED should have redefine (extends AbapValuesType)');
    assert.ok(content.includes('AbapValuesType'), 'LINKED should have AbapValuesType');
  });

  it('should produce different outputs for RAW vs LINKED', async () => {
    // Read both generated files
    const rawContent = readFileSync(join(generatedDir, outputDirs.raw, 'doma.ts'), 'utf-8');
    const linkedContent = readFileSync(join(generatedDir, outputDirs.linked, 'doma.ts'), 'utf-8');

    // RAW and LINKED should be different
    assert.notStrictEqual(rawContent, linkedContent, 'RAW and LINKED should be different');

    // RAW has schemaLocation paths
    assert.ok(rawContent.includes('schemaLocation'), 'RAW should have schemaLocation');
    
    // LINKED has $imports with TypeScript import
    assert.ok(linkedContent.includes('$imports'), 'LINKED should have $imports');
    assert.ok(linkedContent.includes("import abapgit from"), 'LINKED should have TypeScript import');

    console.log('\n=== Output sizes ===');
    console.log(`RAW:    ${rawContent.length} chars`);
    console.log(`LINKED: ${linkedContent.length} chars`);
  });
});
