#!/usr/bin/env -S npx tsx

import { Command } from 'commander';
import {
  importPackageCommand,
  searchCommand,
  discoveryCommand,
  getCommand,
  outlineCommand,
  atcCommand,
  loginCommand,
  logoutCommand,
  transportListCommand,
  transportGetCommand,
  transportCreateCommand,
} from './commands';

// Create main program
export function createCLI(): Command {
  const program = new Command();

  program
    .name('adt')
    .description('ADT CLI tool for managing SAP ADT services')
    .version('1.0.0');

  // Auth commands
  const authCmd = program
    .command('auth')
    .description('Authentication commands');

  authCmd.addCommand(loginCommand);
  authCmd.addCommand(logoutCommand);

  // Discovery command
  program.addCommand(discoveryCommand);

  // Object inspector command
  program.addCommand(getCommand);

  // Object outline command
  program.addCommand(outlineCommand);

  // ATC (ABAP Test Cockpit) command
  program.addCommand(atcCommand);

  // Search command
  program.addCommand(searchCommand);

  // Transport commands
  const transportCmd = program
    .command('transport')
    .alias('tr')
    .description('Transport request management');

  transportCmd.addCommand(transportListCommand);
  transportCmd.addCommand(transportGetCommand);
  transportCmd.addCommand(transportCreateCommand);

  // Import commands
  const importCmd = program
    .command('import')
    .description('Import ABAP objects to various formats (OAT, abapGit, etc.)');

  importCmd.addCommand(importPackageCommand);

  return program;
}

// Main execution function
export async function main(): Promise<void> {
  const program = createCLI();
  await program.parseAsync(process.argv);
}
