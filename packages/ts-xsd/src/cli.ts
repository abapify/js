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
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { parse as parsePath, join, basename, dirname } from 'node:path';
import { generateFromXsd, type CodegenOptions, type ImportResolver } from './codegen';

interface CliOptions {
  output?: string;
  prefix?: string;
  json?: boolean;
  resolver?: string;
  help?: boolean;
  version?: boolean;
}

const VERSION = '0.1.0';

const HELP = `
ts-xsd - Type-safe XSD schemas for TypeScript

Usage:
  ts-xsd import [xsd-files...] [options]
  cat schema.xsd | ts-xsd import [options]

Commands:
  import      Import XSD schemas into TypeScript

Arguments:
  [xsd-files...]    XSD files or glob patterns (reads stdin if omitted)

Options:
  -o, --output <dir>      Write to files in directory (default: stdout)
  -p, --prefix <name>     Namespace prefix to use in generated code
  -r, --resolver <file>   Resolver module for xsd:import paths
  --json                  Output JSON schema instead of TypeScript
  -h, --help           Show this help message
  -v, --version        Show version number

Examples:
  ts-xsd import schema.xsd                    # Print TypeScript to stdout
  ts-xsd import schema.xsd -o generated/      # Write to generated/schema.ts
  ts-xsd import schemas/*.xsd -o out/         # Process multiple files
  cat schema.xsd | ts-xsd import              # Read from stdin
  ts-xsd import schema.xsd --json             # Output JSON schema
  ts-xsd import schema.xsd --json | jq .      # Pipe JSON to jq
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

  if (command !== 'import') {
    console.error(`Unknown command: ${command}`);
    console.log(HELP);
    process.exit(1);
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
