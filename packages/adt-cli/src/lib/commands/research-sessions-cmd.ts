/**
 * CLI Command wrapper for sessions research
 */

import { Command } from 'commander';
import { researchSessions, SessionsResearchOptions } from './research-sessions';

export function createResearchSessionsCommand(): Command {
  return new Command('research-sessions')
    .description('Research ADT sessions endpoint and related URLs')
    .option('-v, --verbose', 'Show detailed response data')
    .option('-o, --output <file>', 'Save results to file')
    .option(
      '-f, --format <format>',
      'Output format: console|json|xml',
      'console'
    )
    .action(async (options: SessionsResearchOptions) => {
      try {
        await researchSessions(options);
      } catch (error: any) {
        console.error('❌ Research failed:', error.message);
        process.exit(1);
      }
    });
}
