/**
 * CTS Commands - Change and Transport System
 * 
 * Uses v2 client with adt-contracts for type-safe API access.
 * 
 * Commands:
 * - adt cts search [--owner X] [--status modifiable]
 * - adt cts get <TR>
 * - adt cts create --type task|request --desc "..."
 * - adt cts release <TR>
 * - adt cts check <TR>
 */

import { Command } from 'commander';
import { ctsSearchCommand } from './search';
import { ctsGetCommand } from './get';

export function createCtsCommand(): Command {
  const ctsCmd = new Command('cts')
    .description('CTS (Change and Transport System) - v2 client');

  ctsCmd.addCommand(ctsSearchCommand);
  ctsCmd.addCommand(ctsGetCommand);
  // TODO: ctsCmd.addCommand(ctsCreateCommand);
  // TODO: ctsCmd.addCommand(ctsReleaseCommand);
  // TODO: ctsCmd.addCommand(ctsCheckCommand);

  return ctsCmd;
}
