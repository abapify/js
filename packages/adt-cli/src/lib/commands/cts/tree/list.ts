/**
 * adt cts tree - List transports using search configuration
 *
 * Uses the /sap/bc/adt/cts/transportrequests endpoint with search configuration.
 * This endpoint supports full filtering (status, date range, request types).
 * 
 * Flow:
 * 1. GET /searchconfiguration/configurations → get config ID
 * 2. GET /transportrequests?targets=true&configUri=<encoded-path> → get transports
 */

import { Command } from 'commander';
import { getAdtClientV2 } from '../../../utils/adt-client-v2';
import { createTransportService, type TransportRequest } from '@abapify/adt-client-v2';

// Status icons
const STATUS_ICONS: Record<string, string> = {
  D: '📝', // Modifiable
  R: '🔒', // Released
  O: '🔄', // Release started
  P: '⏳', // Release in preparation
  L: '🔐', // Locked
};

// Human-readable status names
const STATUS_NAMES: Record<string, string> = {
  D: 'Modifiable',
  R: 'Released',
  O: 'Release Started',
  P: 'Release in Preparation',
  L: 'Locked',
};

/**
 * Format a single transport for display
 */
function formatTransport(tr: TransportRequest, index: number, total: number): void {
  const isLast = index === total - 1;
  const prefix = isLast ? '└──' : '├──';
  const statusIcon = STATUS_ICONS[tr.status || ''] || '📄';
  const statusName = STATUS_NAMES[tr.status || ''] || tr.status || 'Unknown';

  // Main line: transport number and description
  console.log(`${prefix} ${statusIcon} ${tr.number}`);
  console.log(`    ${tr.desc || '(no description)'}`);
  console.log(`    ${statusName} • ${tr.owner || 'Unknown'}`);

  // Show task count if any
  if (tr.tasks && tr.tasks.length > 0) {
    console.log(`    📋 ${tr.tasks.length} task(s)`);
  }

  // Show object count if any
  if (tr.objects && tr.objects.length > 0) {
    console.log(`    📦 ${tr.objects.length} object(s)`);
  }

  // Add spacing between entries
  if (!isLast) {
    console.log('');
  }
}

export const treeListCommand = new Command('list')
  .description('List transports using search configuration')
  .option('-m, --max <number>', 'Maximum results to display', '50')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    try {
      const client = await getAdtClientV2();

      console.log('🔍 Fetching transports from search configuration...');

      // Create transport service and fetch transports
      const transportService = createTransportService(client.adt);
      const transports = await transportService.list();

      const maxResults = options.max ? parseInt(options.max, 10) : 50;
      const displayTransports = transports.slice(0, maxResults);

      if (options.json) {
        console.log(JSON.stringify(transports, null, 2));
      } else {
        if (transports.length === 0) {
          console.log('\n📭 No transports found');
        } else {
          // Group by status for display
          const modifiable = displayTransports.filter((t) => t.status === 'D');
          const released = displayTransports.filter((t) => t.status === 'R');
          const other = displayTransports.filter(
            (t) => t.status !== 'D' && t.status !== 'R'
          );

          if (modifiable.length > 0) {
            console.log(`\n📂 Modifiable (${modifiable.length})`);
            modifiable.forEach((tr, i) => formatTransport(tr, i, modifiable.length));
          }

          if (released.length > 0) {
            console.log(`\n📁 Released (${released.length})`);
            released.forEach((tr, i) => formatTransport(tr, i, released.length));
          }

          if (other.length > 0) {
            console.log(`\n📋 Other (${other.length})`);
            other.forEach((tr, i) => formatTransport(tr, i, other.length));
          }

          if (transports.length > maxResults) {
            console.log(
              `\n💡 Showing ${maxResults} of ${transports.length} transports (use --max to see more)`
            );
          }
        }
      }

      console.log('\n✅ Done');
    } catch (error) {
      console.error(
        '❌ Failed:',
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }
  });
