#!/usr/bin/env -S npx tsx

import { Command } from 'commander';
import {
  importPackageCommand,
  importTransportCommand,
  exportPackageCommand,
  searchCommand,
  discoveryCommand,
  infoCommand,
  fetchCommand,
  getCommand,
  outlineCommand,
  atcCommand,
  loginCommand,
  logoutCommand,
  statusCommand,
  authListCommand,
  setDefaultCommand,
  createTestLogCommand,
  createTestAdtCommand,
  createResearchSessionsCommand,
  createCtsCommand,
  createReplCommand,
  packageGetCommand,
} from './commands';
import { refreshCommand } from './commands/auth/refresh';
import { deployCommand } from './commands/deploy/index';
import { createUnlockCommand } from './commands/unlock/index';
import { createLockCommand } from './commands/lock';
import { createCliLogger, AVAILABLE_COMPONENTS } from './utils/logger-config';
import { setGlobalLogger } from './shared/clients';
import { setCliContext } from './utils/adt-client-v2';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

// Check for insecure SSL flag in stored session and apply it globally
function applyInsecureSslFlag(): void {
  try {
    const authFile = resolve(
      process.env.HOME || process.env.USERPROFILE || '.',
      '.adt',
      'auth.json'
    );

    if (existsSync(authFile)) {
      const session = JSON.parse(readFileSync(authFile, 'utf8'));
      if (session.insecure) {
        // process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Commented out for testing proper cert validation
      }
    }
  } catch (error) {
    // Silently ignore errors - session might not exist yet
  }
}

// Add global options help to all commands using afterAll hook
function addGlobalOptionsHelpToAll(rootProgram: Command): void {
  // Get global options from root program
  const globalOptions = rootProgram.options
    .filter(
      (option) =>
        !option.flags.includes('-h, --help') &&
        !option.flags.includes('-V, --version')
    )
    .map((option) => `  ${option.flags.padEnd(30)} ${option.description}`)
    .join('\n');

  if (globalOptions) {
    rootProgram.addHelpText('afterAll', (context) => {
      // Skip the main program to avoid duplicate global options
      if (context.command === rootProgram) {
        return '';
      }

      return `
Global Options:
${globalOptions}
`;
    });
  }
}

// Create main program
export async function createCLI(): Promise<Command> {
  const program = new Command();

  program
    .name('adt')
    .description('ADT CLI tool for managing SAP ADT services')
    .version('1.0.0')
    .option(
      '--sid <sid>',
      'SAP System ID (e.g., BHF, S0D) - overrides default system'
    )
    .option(
      '-v, --verbose [components]',
      `Enable verbose logging. Optionally filter by components: ${AVAILABLE_COMPONENTS.join(
        ', '
      )} or 'all'`
    )
    .option(
      '--log-level <level>',
      'Log level: trace|debug|info|warn|error',
      'info'
    )
    .option(
      '--log-output <dir>',
      'Output directory for log files',
      './tmp/logs'
    )
    .option(
      '--log-response-files',
      'Save ADT responses as separate files',
      false
    )
    .hook('preAction', (thisCommand) => {
      const opts = thisCommand.optsWithGlobals();

      // Create logger based on global options
      const logger = createCliLogger({
        verbose: opts.verbose,
      });

      // Store logger and logging config for use in commands
      (thisCommand as any).logger = logger;
      (thisCommand as any).loggingConfig = {
        logLevel: opts.logLevel || 'info',
        logOutput: opts.logOutput || './tmp/logs',
        logResponseFiles: opts.logResponseFiles || false,
      };
    });

  // Auth commands
  const authCmd = program
    .command('auth')
    .description('Authentication commands');

  authCmd.addCommand(loginCommand);
  authCmd.addCommand(logoutCommand);
  authCmd.addCommand(statusCommand);
  authCmd.addCommand(authListCommand);
  authCmd.addCommand(setDefaultCommand);
  authCmd.addCommand(refreshCommand);

  // Discovery command
  program.addCommand(discoveryCommand);

  // Info command (system and session info)
  program.addCommand(infoCommand);

  // Fetch command (authenticated HTTP requests)
  program.addCommand(fetchCommand);

  // Object inspector command
  program.addCommand(getCommand);
  
  // Get subcommands for specific object types
  getCommand.addCommand(packageGetCommand);

  // Object outline command
  program.addCommand(outlineCommand);

  // ATC (ABAP Test Cockpit) command
  program.addCommand(atcCommand);

  // Search command
  program.addCommand(searchCommand);

  // CTS commands (v2 client) - replaces old 'transport' command
  // Use: adt cts search, adt cts get <TR>
  // TODO: adt cts create, adt cts release, adt cts check
  program.addCommand(createCtsCommand());

  // Import commands
  const importCmd = program
    .command('import')
    .description('Import ABAP objects to various formats (OAT, abapGit, etc.)');

  importCmd.addCommand(importPackageCommand);
  importCmd.addCommand(importTransportCommand);

  // Export commands
  const exportCmd = program
    .command('export')
    .description('Export ABAP objects from various formats to SAP systems');

  exportCmd.addCommand(exportPackageCommand);

  // Deploy command (now unified - supports files, folders, and glob patterns)
  program.addCommand(deployCommand);

  // Lock command
  program.addCommand(createLockCommand());

  // Unlock command
  program.addCommand(createUnlockCommand());

  // Research command
  program.addCommand(createResearchSessionsCommand());

  // REPL - Interactive hypermedia navigator
  program.addCommand(createReplCommand());

  // Test commands for debugging
  program.addCommand(createTestLogCommand());
  program.addCommand(createTestAdtCommand());

  // Apply global options help to all commands using afterAll hook
  addGlobalOptionsHelpToAll(program);

  return program;
}

// Main execution function
export async function main(): Promise<void> {
  // Apply insecure SSL flag from session if present
  applyInsecureSslFlag();

  const program = await createCLI();

  // Add a hook to set up logger before command execution
  program.hook('preAction', (thisCommand, actionCommand) => {
    // Set CLI mode for ADT client logger to enable pretty formatting
    process.env.ADT_CLI_MODE = 'true';

    // Get global options from root program
    let rootCmd = actionCommand;
    while (rootCmd.parent) {
      rootCmd = rootCmd.parent;
    }
    const globalOptions = rootCmd.opts();

    // Create and set global logger for ADT client
    const logger = createCliLogger({ verbose: globalOptions.verbose });
    const loggingConfig = {
      logLevel: globalOptions.logLevel || 'info',
      logOutput: globalOptions.logOutput || './tmp/logs',
      logResponseFiles: Boolean(globalOptions.logResponseFiles),
    };
    setGlobalLogger(logger, loggingConfig);

    // Set CLI context for getAdtClientV2 (auto-reads these options)
    setCliContext({
      sid: globalOptions.sid,
      logger,
      logLevel: loggingConfig.logLevel,
      logOutput: loggingConfig.logOutput,
      logResponseFiles: loggingConfig.logResponseFiles,
      verbose: globalOptions.verbose,
    });
  });

  await program.parseAsync(process.argv);
}
