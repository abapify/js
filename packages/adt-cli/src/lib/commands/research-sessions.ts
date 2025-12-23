/**
 * Research command for ADT Sessions endpoint
 * Usage: npx adt research-sessions [options]
 * 
 * TODO: Migrate to v2 client when sessions contracts are available
 * This command requires v1-specific features: AdtClientImpl, raw request handling
 * See: docs/plans/active/2025-12-20-adt-cli-api-compatibility.md
 */

import { Command } from 'commander';

export interface SessionsResearchOptions {
  verbose?: boolean;
  output?: string;
  format?: 'console' | 'json' | 'xml';
}

export async function researchSessions(_options: SessionsResearchOptions): Promise<void> {
  // Stub implementation - command needs migration to v2 client
  console.error(`❌ Research-sessions command is temporarily disabled pending v2 client migration.`);
  console.error(`💡 This is a development/debugging command that will be restored after v2 migration.`);
  process.exit(1);
}

export function createResearchSessionsCommand(): Command {
  return new Command('research-sessions')
    .description('Research ADT sessions endpoint (temporarily disabled)')
    .option('-v, --verbose', 'Enable verbose output')
    .option('-o, --output <file>', 'Output file path')
    .option('-f, --format <format>', 'Output format: console, json, xml', 'console')
    .action(async (options: SessionsResearchOptions) => {
      await researchSessions(options);
    });
}
