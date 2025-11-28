/**
 * adt cts tree config - View search configuration
 *
 * Shows the current search configuration used by the transport tree.
 * Uses fully typed contracts with adt-schemas-xsd.
 */

import { Command } from 'commander';
import { getAdtClientV2 } from '../../../utils/adt-client-v2';

// Date filter preset names
const DATE_FILTER_PRESETS: Record<string, string> = {
  '0': 'Last Week',
  '1': 'Last 2 Weeks',
  '2': 'Last 4 Weeks',
  '3': 'Last 3 Months',
  '4': 'Custom',
  '5': 'All Time',
};

/**
 * Format date from YYYYMMDD to YYYY-MM-DD
 */
function formatDate(dateStr: string): string {
  if (dateStr.length !== 8) return dateStr;
  return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
}

/**
 * Extract config ID from URI path
 */
function extractConfigId(uri: string): string {
  const parts = uri.split('/');
  return parts[parts.length - 1];
}

/**
 * Convert properties from parsed configuration to key-value map
 * The schema parses text content as '$text' (speci convention)
 */
function propertiesToMap(config: unknown): Record<string, string> {
  const result: Record<string, string> = {};
  if (!config || typeof config !== 'object') return result;
  
  const configObj = config as Record<string, unknown>;
  const properties = configObj.properties as Record<string, unknown> | undefined;
  
  if (!properties) return result;
  
  const propArray = properties.property;
  if (!propArray) return result;
  
  const props = Array.isArray(propArray) ? propArray : [propArray];
  
  for (const prop of props) {
    if (prop && typeof prop === 'object') {
      const p = prop as Record<string, unknown>;
      const key = p.key as string | undefined;
      // speci uses '$text' for text content (not '#text')
      const value = p['$text'] as string | undefined;
      if (key && value !== undefined) {
        result[key] = String(value);
      }
    }
  }
  return result;
}

export const treeConfigCommand = new Command('config')
  .description('View search configuration')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    try {
      const client = await getAdtClientV2();

      console.log('🔍 Fetching search configuration...');

      // Get configurations list (typed)
      const configsResponse = await client.adt.cts.transportrequests.searchconfiguration.configurations.get();
      
      const configs = configsResponse?.configuration;
      if (!configs) {
        console.log('\n📭 No search configuration found');
        return;
      }

      const configArray = Array.isArray(configs) ? configs : [configs];
      if (configArray.length === 0) {
        console.log('\n📭 No search configuration found');
        return;
      }

      const firstConfig = configArray[0];
      const configUri = firstConfig?.link?.href;

      if (!configUri) {
        console.log('\n❌ No configuration URI found');
        return;
      }

      // Extract config ID and fetch details using typed contract
      const configId = extractConfigId(configUri);
      const configDetails = await client.adt.cts.transportrequests.searchconfiguration.configurations.getById(configId);

      // Convert properties to map for easy access
      const properties = propertiesToMap(configDetails);

      if (options.json) {
        const jsonOutput = {
          uri: configUri,
          configId,
          createdBy: configDetails?.createdBy,
          createdAt: configDetails?.createdAt,
          changedBy: configDetails?.changedBy,
          changedAt: configDetails?.changedAt,
          properties,
        };
        console.log(JSON.stringify(jsonOutput, null, 2));
      } else {
        console.log('\n📋 Search Configuration');
        console.log('═'.repeat(50));

        // Metadata
        if (configDetails?.changedBy) {
          console.log(`\n📝 Last modified by: ${configDetails.changedBy}`);
        }
        if (configDetails?.changedAt) {
          console.log(`   Last modified at: ${configDetails.changedAt}`);
        }

        // Request Types
        console.log('\n📦 Request Types:');
        const requestTypes = [
          { key: 'WorkbenchRequests', label: 'Workbench' },
          { key: 'CustomizingRequests', label: 'Customizing' },
          { key: 'TransportOfCopies', label: 'Transport of Copies' },
        ];
        for (const rt of requestTypes) {
          const enabled = properties[rt.key] === 'true';
          console.log(`   ${enabled ? '✅' : '⬜'} ${rt.label}`);
        }

        // Status Filters
        console.log('\n📊 Status Filters:');
        const statuses = [
          { key: 'Modifiable', label: 'Modifiable' },
          { key: 'Released', label: 'Released' },
        ];
        for (const s of statuses) {
          const enabled = properties[s.key] === 'true';
          console.log(`   ${enabled ? '✅' : '⬜'} ${s.label}`);
        }

        // Owner
        console.log('\n👤 Owner Filter:');
        console.log(`   ${properties.User || '*'}`);

        // Date Range
        console.log('\n📅 Date Range:');
        const datePreset = DATE_FILTER_PRESETS[properties.DateFilter] || 'Unknown';
        console.log(`   Preset: ${datePreset}`);
        if (properties.FromDate) {
          console.log(`   From: ${formatDate(properties.FromDate)}`);
        }
        if (properties.ToDate) {
          console.log(`   To: ${formatDate(properties.ToDate)}`);
        }

        console.log('\n' + '═'.repeat(50));
        console.log('💡 Configure in ADT Eclipse: Transport Organizer → Configure Tree');
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
