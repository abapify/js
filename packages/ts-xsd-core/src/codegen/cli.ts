#!/usr/bin/env node
/**
 * XSD to TypeScript Codegen CLI
 * 
 * Usage:
 *   npx tsx src/codegen/cli.ts <input.xsd> [output.ts] [--name=SchemaName]
 * 
 * Examples:
 *   npx tsx src/codegen/cli.ts person.xsd
 *   npx tsx src/codegen/cli.ts person.xsd ./generated/person-schema.ts
 *   npx tsx src/codegen/cli.ts person.xsd --name=PersonSchema
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, basename, resolve } from 'node:path';
import { generateSchemaFile } from './generate';

interface CliOptions {
  input: string;
  output: string;
  name: string;
}

function parseArgs(args: string[]): CliOptions {
  const positional: string[] = [];
  let name: string | undefined;

  for (const arg of args) {
    if (arg.startsWith('--name=')) {
      name = arg.slice(7);
    } else if (!arg.startsWith('-')) {
      positional.push(arg);
    }
  }

  const input = positional[0];
  if (!input) {
    console.error('Usage: ts-xsd-codegen <input.xsd> [output.ts] [--name=SchemaName]');
    process.exit(1);
  }

  // Default output: same name as input but .ts extension
  const defaultOutput = input.replace(/\.xsd$/i, '-schema.ts');
  const output = positional[1] || defaultOutput;

  // Default name: derive from filename
  const defaultName = basename(input, '.xsd')
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^./, s => s.toLowerCase()) + 'Schema';

  return {
    input: resolve(input),
    output: resolve(output),
    name: name || defaultName,
  };
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
XSD to TypeScript Codegen

Usage:
  ts-xsd-codegen <input.xsd> [output.ts] [--name=SchemaName]

Arguments:
  input.xsd     Input XSD file
  output.ts     Output TypeScript file (default: <input>-schema.ts)
  --name=NAME   Schema variable name (default: derived from filename)

Examples:
  ts-xsd-codegen person.xsd
  ts-xsd-codegen person.xsd ./generated/person-schema.ts
  ts-xsd-codegen person.xsd --name=PersonSchema
`);
    process.exit(0);
  }

  const options = parseArgs(args);

  console.log(`Reading: ${options.input}`);
  const xsdContent = readFileSync(options.input, 'utf-8');

  console.log(`Generating schema: ${options.name}`);
  const tsContent = generateSchemaFile(xsdContent, {
    name: options.name,
    comment: `Source: ${basename(options.input)}`,
  });

  // Ensure output directory exists
  mkdirSync(dirname(options.output), { recursive: true });

  console.log(`Writing: ${options.output}`);
  writeFileSync(options.output, tsContent);

  console.log(`Done! Generated ${tsContent.length} characters`);
  console.log(`\nUsage in TypeScript:`);
  console.log(`  import { ${options.name} } from './${basename(options.output, '.ts')}';`);
  console.log(`  import type { InferSchema } from '@abapify/ts-xsd-core';`);
  console.log(`  type MyType = InferSchema<typeof ${options.name}>;`);
}

main();
