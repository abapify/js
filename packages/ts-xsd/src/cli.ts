#!/usr/bin/env node
/**
 * ts-xsd CLI
 *
 * Import XSD schemas into TypeScript
 *
 * Usage:
 *   ts-xsd import schema.xsd              # Output to stdout
 *   ts-xsd import schema.xsd -o dir/      # Write to file
 *   cat schema.xsd | ts-xsd import        # Read from stdin
 *   ts-xsd import schema.xsd --json       # Output JSON instead of TypeScript
 *   ts-xsd codegen .xsd/*.xsd -o generated/  # Generate multiple schemas + index
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { parse as parsePath, join, basename, dirname, resolve } from 'node:path';
import { generateFromXsd, generateBatch, type CodegenOptions, type ImportResolver } from './codegen';
import type { Generator } from './codegen/generator';
import type { CodegenConfig } from './config';

interface CliOptions {
  output?: string;
  prefix?: string;
  json?: boolean;
  resolver?: string;
  generator?: string;
  factory?: string;
  config?: string;
  schemas?: string[];
  extractTypes?: boolean;
  help?: boolean;
  version?: boolean;
}

const VERSION = '0.1.0';

const HELP = `
ts-xsd - Type-safe XSD schemas for TypeScript

Usage:
  ts-xsd import [xsd-files...] [options]
  ts-xsd codegen [options]                    # Uses tsxsd.config.ts
  ts-xsd codegen -c <config>                  # Uses custom config
  ts-xsd codegen [xsd-files...] -o <dir>      # CLI mode (no config)
  cat schema.xsd | ts-xsd import [options]

Commands:
  import      Import single XSD schema to TypeScript (stdout or file)
  codegen     Generate multiple schemas + index file to directory

Arguments:
  [xsd-files...]    XSD files or glob patterns (reads stdin if omitted for import)

Options:
  -c, --config <file>     Config file (default: tsxsd.config.ts)
  -o, --output <dir>      Output directory (required for codegen without config)
  -p, --prefix <name>     Namespace prefix to use in generated code
  -r, --resolver <file>   Resolver module for xsd:import paths
  -g, --generator <name>  Generator: raw (default) or factory
  --factory <path>        Factory import path (for factory generator)
  --schemas <list>        Comma-separated schema names to generate
  --extract-types         Extract expanded types to .types.ts files
  --json                  Output JSON schema instead of TypeScript
  -h, --help              Show this help message
  -v, --version           Show version number

Examples:
  ts-xsd codegen                              # Use tsxsd.config.ts
  ts-xsd codegen -c my.config.ts              # Use custom config
  ts-xsd import schema.xsd                    # Print TypeScript to stdout
  ts-xsd import schema.xsd -o generated/      # Write to generated/schema.ts
  ts-xsd codegen .xsd/*.xsd -o generated/     # Generate all schemas + index
  ts-xsd codegen .xsd/*.xsd -o out/ -g factory --factory ../speci
  cat schema.xsd | ts-xsd import              # Read from stdin
  ts-xsd import schema.xsd --json             # Output JSON schema
`;

function parseArgs(args: string[]): { command: string; files: string[]; options: CliOptions } {
  const files: string[] = [];
  const options: CliOptions = {};
  let command = '';

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    if (arg === '-h' || arg === '--help') {
      options.help = true;
    } else if (arg === '-v' || arg === '--version') {
      options.version = true;
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '-o' || arg === '--output') {
      options.output = args[++i];
    } else if (arg === '-p' || arg === '--prefix') {
      options.prefix = args[++i];
    } else if (arg === '-r' || arg === '--resolver') {
      options.resolver = args[++i];
    } else if (arg === '-g' || arg === '--generator') {
      options.generator = args[++i];
    } else if (arg === '--factory') {
      options.factory = args[++i];
    } else if (arg === '-c' || arg === '--config') {
      options.config = args[++i];
    } else if (arg === '--schemas') {
      options.schemas = args[++i].split(',').map(s => s.trim());
    } else if (arg === '--extract-types') {
      options.extractTypes = true;
    } else if (!arg.startsWith('-')) {
      if (!command) {
        command = arg;
      } else {
        files.push(arg);
      }
    } else {
      console.error(`Unknown option: ${arg}`);
      process.exit(1);
    }

    i++;
  }

  return { command, files, options };
}

/**
 * Expand glob patterns
 */
function expandFiles(patterns: string[]): string[] {
  const files: string[] = [];

  for (const pattern of patterns) {
    if (pattern.includes('*')) {
      const dir = dirname(pattern);
      const filePattern = basename(pattern);
      const regex = new RegExp('^' + filePattern.replace(/\*/g, '.*') + '$');

      if (existsSync(dir)) {
        for (const file of readdirSync(dir)) {
          if (regex.test(file)) {
            const fullPath = join(dir, file);
            if (statSync(fullPath).isFile()) {
              files.push(fullPath);
            }
          }
        }
      }
    } else if (existsSync(pattern)) {
      if (statSync(pattern).isDirectory()) {
        for (const file of readdirSync(pattern)) {
          if (file.endsWith('.xsd')) {
            files.push(join(pattern, file));
          }
        }
      } else {
        files.push(pattern);
      }
    } else {
      console.error(`File not found: ${pattern}`);
    }
  }

  return files;
}

/**
 * Read from stdin
 */
async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

/**
 * Check if stdin has data (is being piped)
 */
function hasStdin(): boolean {
  return !process.stdin.isTTY;
}

/**
 * Load resolver module
 */
async function loadResolver(resolverPath: string): Promise<ImportResolver> {
  const module = await import(resolverPath);
  if (typeof module.default === 'function') {
    return module.default;
  }
  if (typeof module.resolve === 'function') {
    return module.resolve;
  }
  throw new Error(`Resolver module must export default function or 'resolve' function`);
}

/**
 * Load generator by name or path, with optional configuration
 */
async function loadGenerator(name: string, factoryPath?: string): Promise<Generator> {
  // Built-in generators
  if (name === 'raw') {
    const { raw } = await import('./generators/raw');
    return raw();
  }
  if (name === 'factory') {
    const { factory } = await import('./generators/factory');
    return factory({ path: factoryPath });
  }
  
  // Custom generator from path
  const generatorPath = name.startsWith('.')
    ? join(process.cwd(), name)
    : name;
  const module = await import(generatorPath);
  if (module.default) {
    return module.default;
  }
  throw new Error(`Generator module must export default Generator`);
}

/**
 * Process a single XSD content and return output
 */
function processXsd(xsdContent: string, options: CliOptions, resolver?: ImportResolver): string {
  const codegenOptions: CodegenOptions = {
    prefix: options.prefix,
    resolver,
  };

  const result = generateFromXsd(xsdContent, codegenOptions);

  if (options.json) {
    return JSON.stringify(result.schema, null, 2);
  }
  return result.code;
}

/**
 * Load config file
 */
async function loadConfig(configPath: string): Promise<CodegenConfig> {
  const absolutePath = resolve(process.cwd(), configPath);
  
  if (!existsSync(absolutePath)) {
    throw new Error(`Config file not found: ${configPath}`);
  }
  
  const module = await import(absolutePath);
  if (module.default) {
    return module.default;
  }
  throw new Error(`Config file must export default configuration`);
}

/**
 * Find default config file
 */
function findDefaultConfig(): string | undefined {
  const candidates = ['tsxsd.config.ts', 'tsxsd.config.js', 'tsxsd.config.mjs'];
  for (const name of candidates) {
    if (existsSync(join(process.cwd(), name))) {
      return name;
    }
  }
  return undefined;
}

/**
 * Run codegen command - generate multiple schemas + index
 */
async function runCodegen(patterns: string[], options: CliOptions): Promise<void> {
  // Try to load config file
  const configPath = options.config || findDefaultConfig();
  
  if (configPath) {
    // Config-based mode
    console.error(`Using config: ${configPath}`);
    let config: CodegenConfig;
    try {
      config = await loadConfig(configPath);
    } catch (error) {
      console.error(`Error loading config: ${error}`);
      process.exit(1);
    }
    
    // Expand input patterns from config
    const inputPatterns = Array.isArray(config.input) ? config.input : [config.input];
    const files = expandFiles(inputPatterns);
    
    if (files.length === 0) {
      console.error('Error: No XSD files found matching input patterns');
      process.exit(1);
    }
    
    // Resolve resolver if it's a string path
    let resolver: ImportResolver | undefined;
    if (typeof config.resolver === 'string') {
      resolver = await loadResolver(resolve(process.cwd(), config.resolver));
    } else {
      resolver = config.resolver;
    }
    
    // Run batch generation with config
    const result = await generateBatch(files, {
      output: config.output,
      generator: config.generator,
      resolver,
      prefix: config.prefix,
      schemas: config.schemas,
      stubs: config.stubs,
      clean: config.clean,
      extractTypes: config.extractTypes || options.extractTypes,
      factoryPath: config.factoryPath,
    }, (name: string, success: boolean, error?: string) => {
      if (!name) {
        console.error(''); // blank line
      } else if (success) {
        console.error(`✓ ${name}`);
      } else {
        console.error(`✗ ${name}: ${error}`);
      }
    });
    
    console.error('');
    console.error(`Done! Generated ${result.generated.length} schema(s)`);
    if (result.failed.length > 0) {
      console.error(`Failed: ${result.failed.length} (${result.failed.join(', ')})`);
      process.exit(1);
    }
    return;
  }
  
  // CLI mode (no config)
  if (!options.output) {
    console.error('Error: --output is required for codegen command (or use a config file)');
    process.exit(1);
  }

  const files = expandFiles(patterns);
  if (files.length === 0) {
    console.error('Error: No XSD files found');
    process.exit(1);
  }

  // Load generator (with factory path if specified)
  const generatorName = options.generator || 'raw';
  let generator: Generator;
  try {
    generator = await loadGenerator(generatorName, options.factory);
  } catch (error) {
    console.error(`Error loading generator: ${error}`);
    process.exit(1);
  }

  // Load resolver if specified
  let resolver: ImportResolver | undefined;
  if (options.resolver) {
    try {
      const resolverPath = options.resolver.startsWith('.')
        ? join(process.cwd(), options.resolver)
        : options.resolver;
      resolver = await loadResolver(resolverPath);
    } catch (error) {
      console.error(`Error loading resolver: ${error}`);
      process.exit(1);
    }
  }

  // Run batch generation
  const result = await generateBatch(files, {
    output: options.output,
    generator,
    resolver,
    prefix: options.prefix,
    schemas: options.schemas,
    extractTypes: options.extractTypes,
  }, (name: string, success: boolean, error?: string) => {
    if (!name) {
      console.error(''); // blank line
    } else if (success) {
      console.error(`✓ ${name}`);
    } else {
      console.error(`✗ ${name}: ${error}`);
    }
  });

  console.error('');
  console.error(`Done! Generated ${result.generated.length} schema(s)`);
  if (result.failed.length > 0) {
    console.error(`Failed: ${result.failed.length} (${result.failed.join(', ')})`);
    process.exit(1);
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const { command, files: patterns, options } = parseArgs(args);

  if (options.help || !command) {
    console.log(HELP);
    process.exit(0);
  }

  if (options.version) {
    console.log(`ts-xsd v${VERSION}`);
    process.exit(0);
  }

  if (command !== 'import' && command !== 'codegen') {
    console.error(`Unknown command: ${command}`);
    console.log(HELP);
    process.exit(1);
  }

  // Handle codegen command
  if (command === 'codegen') {
    await runCodegen(patterns, options);
    return;
  }

  // Load resolver if specified
  let resolver: ImportResolver | undefined;
  if (options.resolver) {
    try {
      // Convert to absolute path if relative
      const resolverPath = options.resolver.startsWith('.')
        ? join(process.cwd(), options.resolver)
        : options.resolver;
      resolver = await loadResolver(resolverPath);
    } catch (error) {
      console.error(`Error loading resolver: ${error}`);
      process.exit(1);
    }
  }

  // Handle stdin input
  if (patterns.length === 0) {
    if (hasStdin()) {
      try {
        const xsdContent = await readStdin();
        const output = processXsd(xsdContent, options, resolver);
        console.log(output);
      } catch (error) {
        console.error('Error processing stdin:', error);
        process.exit(1);
      }
      return;
    } else {
      console.error('Error: No input files specified and no stdin data');
      console.log(HELP);
      process.exit(1);
    }
  }

  const files = expandFiles(patterns);

  if (files.length === 0) {
    console.error('Error: No XSD files found');
    process.exit(1);
  }

  // Ensure output directory exists if specified
  if (options.output && !existsSync(options.output)) {
    mkdirSync(options.output, { recursive: true });
  }

  for (const file of files) {
    try {
      const xsdContent = readFileSync(file, 'utf-8');
      const output = processXsd(xsdContent, options, resolver);

      if (options.output) {
        // Write to file
        const parsed = parsePath(file);
        const ext = options.json ? '.json' : '.ts';
        const outputFile = join(options.output, parsed.name + ext);
        writeFileSync(outputFile, output, 'utf-8');
        console.error(`Generated: ${outputFile}`);
      } else {
        // Output to stdout
        console.log(output);
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
      process.exit(1);
    }
  }

  if (options.output) {
    console.error(`Done! Processed ${files.length} file(s)`);
  }
}

main();
