#!/usr/bin/env node
/**
 * ts-xml-codegen CLI
 *
 * Generate ts-xml schemas from XSD files
 *
 * Usage:
 *   ts-xml-codegen <xsd-files...> [options]
 *   ts-xml-codegen schemas/*.xsd -o generated/
 *   ts-xml-codegen schema.xsd --prefix myns
 *
 * No external dependencies - uses only Node.js built-ins
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { parse as parsePath, join, basename, dirname } from 'node:path';
import { parse } from 'ts-xml';
import { XsdSchemaSchema } from 'ts-xml-xsd';
import { generateTsXmlSchemas, type GeneratorOptions } from './generator';

interface CliOptions {
  output?: string;
  prefix?: string;
  stdout?: boolean;
  help?: boolean;
  version?: boolean;
}

const VERSION = '0.1.0';

const HELP = `
ts-xml-codegen - Generate ts-xml schemas from XSD files

Usage:
  ts-xml-codegen <xsd-files...> [options]

Arguments:
  <xsd-files...>    XSD files or glob patterns to process

Options:
  -o, --output <dir>   Output directory (default: same as input)
  -p, --prefix <name>  Namespace prefix to use in generated code
  --stdout             Output to stdout instead of files
  -h, --help           Show this help message
  -v, --version        Show version number

Examples:
  ts-xml-codegen schema.xsd
  ts-xml-codegen schemas/*.xsd -o generated/
  ts-xml-codegen schema.xsd --prefix myns --stdout
`;

function parseArgs(args: string[]): { files: string[]; options: CliOptions } {
  const files: string[] = [];
  const options: CliOptions = {};

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    if (arg === '-h' || arg === '--help') {
      options.help = true;
    } else if (arg === '-v' || arg === '--version') {
      options.version = true;
    } else if (arg === '--stdout') {
      options.stdout = true;
    } else if (arg === '-o' || arg === '--output') {
      options.output = args[++i];
    } else if (arg === '-p' || arg === '--prefix') {
      options.prefix = args[++i];
    } else if (!arg.startsWith('-')) {
      // It's a file or pattern
      files.push(arg);
    } else {
      console.error(`Unknown option: ${arg}`);
      process.exit(1);
    }

    i++;
  }

  return { files, options };
}

/**
 * Expand glob patterns (simple implementation)
 */
function expandFiles(patterns: string[]): string[] {
  const files: string[] = [];

  for (const pattern of patterns) {
    if (pattern.includes('*')) {
      // Simple glob expansion
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
        // Process all .xsd files in directory
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

function processFile(
  inputPath: string,
  options: CliOptions,
  generatorOptions: GeneratorOptions
): string {
  const xsdContent = readFileSync(inputPath, 'utf-8');
  const schema = parse(XsdSchemaSchema, xsdContent);
  return generateTsXmlSchemas(schema, generatorOptions);
}

function main(): void {
  const args = process.argv.slice(2);
  const { files: patterns, options } = parseArgs(args);

  if (options.help) {
    console.log(HELP);
    process.exit(0);
  }

  if (options.version) {
    console.log(`ts-xml-codegen v${VERSION}`);
    process.exit(0);
  }

  if (patterns.length === 0) {
    console.error('Error: No input files specified');
    console.log(HELP);
    process.exit(1);
  }

  const files = expandFiles(patterns);

  if (files.length === 0) {
    console.error('Error: No XSD files found');
    process.exit(1);
  }

  const generatorOptions: GeneratorOptions = {
    prefix: options.prefix,
    exportTypes: true,
    includeComments: true,
  };

  // Ensure output directory exists
  if (options.output && !existsSync(options.output)) {
    mkdirSync(options.output, { recursive: true });
  }

  for (const file of files) {
    try {
      console.error(`Processing: ${file}`);
      const output = processFile(file, options, generatorOptions);

      if (options.stdout) {
        console.log(output);
      } else {
        const parsed = parsePath(file);
        const outputDir = options.output || parsed.dir || '.';
        const outputFile = join(outputDir, parsed.name + '.schema.ts');

        writeFileSync(outputFile, output, 'utf-8');
        console.error(`Generated: ${outputFile}`);
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
      process.exit(1);
    }
  }

  console.error(`Done! Processed ${files.length} file(s)`);
}

main();
