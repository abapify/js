/**
 * Transport Request (TR) Commands
 * 
 * Subcommands for transport request operations:
 * - adt cts tr list         - List transports
 * - adt cts tr get <TR>     - Get transport details
 * - adt cts tr create       - Create new transport
 * - adt cts tr release <TR> - Release transport (TODO)
 * - adt cts tr check <TR>   - Pre-release validation (TODO)
 */

import { Command } from 'commander';
import { ctsListCommand } from './list';
import { ctsGetCommand } from './get';
import { ctsCreateCommand } from './create';

export function createTrCommand(): Command {
  const trCmd = new Command('tr')
    .description('Transport request operations');

  trCmd.addCommand(ctsListCommand);
  trCmd.addCommand(ctsGetCommand);
  trCmd.addCommand(ctsCreateCommand);
  // TODO: trCmd.addCommand(ctsReleaseCommand);
  // TODO: trCmd.addCommand(ctsCheckCommand);

  return trCmd;
}
