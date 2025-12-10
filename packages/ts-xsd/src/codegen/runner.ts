/**
 * Config Runner
 * 
 * Executes the generator pipeline based on configuration.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, relative, isAbsolute } from 'node:path';
import { parseXsd } from '../xsd';
import type {
  CodegenConfig,
  SchemaInfo,
  SourceInfo,
  SetupContext,
  TransformContext,
  FinalizeContext,
  AfterAllContext,
} from './types';

// ============================================================================
// Runner
// ============================================================================

export interface RunnerOptions {
  /** Root directory (where config file is located) */
  rootDir: string;
  /** Dry run - don't write files, just return what would be written */
  dryRun?: boolean;
  /** Verbose logging */
  verbose?: boolean;
}

export interface RunnerResult {
  /** Files that were written (or would be written in dry run) */
  files: Array<{ path: string; source: string }>;
  /** Schemas that were processed */
  schemas: Array<{ name: string; source: string }>;
  /** Errors that occurred */
  errors: Array<{ schema?: string; source?: string; error: Error }>;
}

/**
 * Run the codegen pipeline
 */
export async function runCodegen(
  config: CodegenConfig,
  options: RunnerOptions
): Promise<RunnerResult> {
  const { rootDir, dryRun = false, verbose = false } = options;
  const result: RunnerResult = { files: [], schemas: [], errors: [] };

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const log = verbose ? console.log.bind(console) : () => {};

  // Build source info map
  const sources: Record<string, SourceInfo> = {};
  for (const [name, sourceConfig] of Object.entries(config.sources)) {
    sources[name] = {
      name,
      xsdDir: isAbsolute(sourceConfig.xsdDir) ? sourceConfig.xsdDir : join(rootDir, sourceConfig.xsdDir),
      outputDir: isAbsolute(sourceConfig.outputDir) ? sourceConfig.outputDir : join(rootDir, sourceConfig.outputDir),
      schemas: sourceConfig.schemas,
    };
  }

  // Setup context
  const setupCtx: SetupContext = { sources, rootDir };

  // Run beforeAll hook
  if (config.beforeAll) {
    log(`\n🔧 Running beforeAll hook...`);
    await config.beforeAll({ sources, rootDir });
  }

  // Run setup for all generators
  for (const generator of config.generators) {
    if (generator.setup) {
      log(`[${generator.name}] Running setup...`);
      await generator.setup(setupCtx);
    }
  }

  // First pass: parse ALL schemas from ALL sources into a global map
  // This is needed for cross-source type resolution (e.g., custom schemas importing SAP schemas)
  const processedSchemas = new Map<string, SchemaInfo[]>();
  const globalAllSchemas = new Map<string, SchemaInfo>();

  for (const [sourceName, source] of Object.entries(sources)) {
    log(`\n📦 Processing source: ${sourceName}`);
    const schemaInfos: SchemaInfo[] = [];

    for (const schemaName of source.schemas) {
      const xsdPath = join(source.xsdDir, `${schemaName}.xsd`);
      
      if (!existsSync(xsdPath)) {
        log(`  ⚠️  Skipping ${schemaName} - XSD not found`);
        continue;
      }

      try {
        const xsdContent = readFileSync(xsdPath, 'utf-8');
        const schema = parseXsd(xsdContent);
        
        // Set $filename for schema identification (used by linkSchemas and interface generator)
        (schema as { $filename?: string }).$filename = `${schemaName}.xsd`;
        
        const schemaInfo: SchemaInfo = {
          name: schemaName,
          xsdContent,
          schema,
          sourceName,
          xsdPath,
        };
        
        schemaInfos.push(schemaInfo);
        // Add to global map with unique key (sourceName/schemaName to avoid collisions)
        globalAllSchemas.set(schemaName, schemaInfo);
        result.schemas.push({ name: schemaName, source: sourceName });
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        log(`  ❌ Failed to parse ${schemaName}: ${err.message}`);
        result.errors.push({ schema: schemaName, source: sourceName, error: err });
      }
    }

    processedSchemas.set(sourceName, schemaInfos);
  }

  // Second pass: run transforms with global schema map
  for (const [sourceName, source] of Object.entries(sources)) {
    const schemaInfos = processedSchemas.get(sourceName) ?? [];
    
    for (const schemaInfo of schemaInfos) {
      const transformCtx: TransformContext = {
        schema: schemaInfo,
        source,
        allSchemas: globalAllSchemas, // Use global map for cross-source resolution
        allSources: sources,
        rootDir,
        resolveImport: createImportResolver(schemaInfo, source, sources, config),
      };

      for (const generator of config.generators) {
        if (generator.transform) {
          try {
            const files = await generator.transform(transformCtx);
            for (const file of files) {
              const fullPath = join(source.outputDir, file.path);
              
              if (!dryRun) {
                mkdirSync(dirname(fullPath), { recursive: true });
                writeFileSync(fullPath, file.content);
              }
              
              result.files.push({ path: fullPath, source: sourceName });
              log(`  ✅ [${generator.name}] Generated ${file.path}`);
            }
          } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            log(`  ❌ [${generator.name}] Failed ${schemaInfo.name}: ${err.message}`);
            result.errors.push({ schema: schemaInfo.name, source: sourceName, error: err });
          }
        }
      }
    }
  }

  // Run finalize for all generators
  const finalizeCtx: FinalizeContext = {
    processedSchemas,
    sources,
    rootDir,
  };

  for (const generator of config.generators) {
    if (generator.finalize) {
      try {
        log(`\n[${generator.name}] Running finalize...`);
        const files = await generator.finalize(finalizeCtx);
        
        for (const file of files) {
          // Finalize files go to each source's output dir
          for (const [sourceName, source] of Object.entries(sources)) {
            const fullPath = join(source.outputDir, file.path);
            
            if (!dryRun) {
              mkdirSync(dirname(fullPath), { recursive: true });
              writeFileSync(fullPath, file.content);
            }
            
            result.files.push({ path: fullPath, source: sourceName });
            log(`  ✅ [${generator.name}] Generated ${file.path} for ${sourceName}`);
          }
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        log(`  ❌ [${generator.name}] Finalize failed: ${err.message}`);
        result.errors.push({ error: err });
      }
    }
  }

  // Run afterAll hook
  if (config.afterAll) {
    log(`\n🔧 Running afterAll hook...`);
    const afterAllCtx: AfterAllContext = {
      sources,
      rootDir,
      processedSchemas,
      generatedFiles: result.files.map(f => ({ path: f.path, content: '' })), // Content not tracked
    };
    
    const extraFiles = await config.afterAll(afterAllCtx);
    if (extraFiles && Array.isArray(extraFiles)) {
      for (const file of extraFiles) {
        const fullPath = join(rootDir, file.path);
        
        if (!dryRun) {
          mkdirSync(dirname(fullPath), { recursive: true });
          writeFileSync(fullPath, file.content);
        }
        
        result.files.push({ path: fullPath, source: 'afterAll' });
        log(`  ✅ [afterAll] Generated ${file.path}`);
      }
    }
  }

  return result;
}

// ============================================================================
// Import Resolution
// ============================================================================

function createImportResolver(
  currentSchema: SchemaInfo,
  currentSource: SourceInfo,
  allSources: Record<string, SourceInfo>,
  config: CodegenConfig
): (schemaLocation: string) => string | null {
  const ext = config.importExtension ?? '';  // Default to extensionless for bundler compatibility
  
  return (schemaLocation: string) => {
    // Extract schema name from location (e.g., "../sap/adtcore.xsd" -> "adtcore")
    const schemaName = schemaLocation.replace(/\.xsd$/, '').replace(/^.*\//, '');
    
    // Check if it's in the current source
    if (currentSource.schemas.includes(schemaName)) {
      return `./${schemaName}${ext}`;
    }
    
    // Check other sources
    for (const [sourceName, source] of Object.entries(allSources)) {
      if (sourceName === currentSource.name) continue;
      
      if (source.schemas.includes(schemaName)) {
        // Calculate relative path from current output to other source output
        const relPath = relative(currentSource.outputDir, source.outputDir);
        return `${relPath}/${schemaName}${ext}`.replace(/\\/g, '/');
      }
    }
    
    return null;
  };
}
