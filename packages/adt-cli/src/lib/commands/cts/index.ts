/**
 * CTS Commands - Change and Transport System
 *
 * Uses v2 client with adt-contracts for type-safe API access.
 * Replaces the deprecated 'transport' command.
 *
 * Implemented Commands:
 * - adt cts search [options] [--json] - Search transports (basic endpoint)
 *     -u, --user <user>               - Filter by owner (* for all, default: *)
 *     -t, --type <type>               - Filter by type: workbench/customizing/copies or K/W/T
 *     -m, --max <number>              - Maximum results (default: 50)
 * - adt cts tree [options] [--json]   - List transports using search configuration
 *     -m, --max <number>              - Maximum results (default: 50)
 * - adt cts get <TR> [--objects]      - Get transport details
 *
 * Note: 'search' uses the basic find endpoint with limited filtering.
 * 'tree' uses the search configuration endpoint which respects ADT tree settings.
 *
 * TODO - Missing features:
 * - adt cts create --desc "..." [--type K] [--target LOCAL] [--project X] [--owner Y]
 * - adt cts release <TR>              - Release transport
 * - adt cts check <TR>                - Pre-release validation
 */

import { Command } from 'commander';
import { ctsSearchCommand } from './search';
import { createTreeCommand } from './tree';
import { ctsGetCommand } from './get';

export function createCtsCommand(): Command {
  const ctsCmd = new Command('cts')
    .alias('tr')  // Backward compatibility alias
    .description('CTS (Change and Transport System) operations');

  ctsCmd.addCommand(ctsSearchCommand);
  ctsCmd.addCommand(createTreeCommand());
  ctsCmd.addCommand(ctsGetCommand);
  // TODO: ctsCmd.addCommand(ctsCreateCommand);
  // TODO: ctsCmd.addCommand(ctsReleaseCommand);
  // TODO: ctsCmd.addCommand(ctsCheckCommand);

  return ctsCmd;
}
