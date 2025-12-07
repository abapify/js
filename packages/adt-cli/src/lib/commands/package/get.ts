/**
 * Package Get Command
 *
 * Get details about a specific ABAP package.
 * Usage: npx adt get package <name>
 */

import { Command } from 'commander';
import { getAdtClientV2 } from '../../utils/adt-client';
import { render, router } from '../../ui';

export const packageGetCommand = new Command('package')
  .argument('<name>', 'Package name to inspect')
  .description('Get details about a specific ABAP package')
  .option('--json', 'Output as JSON', false)
  .action(async (name, options) => {
    try {
      const client = await getAdtClientV2();

      // Fetch package directly via packages contract
      const pkg = await client.adt.packages.get(name);

      // JSON output
      if (options.json) {
        console.log(JSON.stringify(pkg, null, 2));
        return;
      }

      // Use router to render the package page
      const route = router.get('DEVC');
      if (route) {
        const page = route.page(pkg, { name });
        render(page);
      } else {
        // Fallback: simple output
        console.log(`📦 Package: ${pkg.name}`);
        console.log(`   Type: ${pkg.type}`);
        console.log(`   Description: ${pkg.description || 'N/A'}`);
        console.log(`   Package Type: ${pkg.attributes?.packageType || 'N/A'}`);
      }
    } catch (error) {
      console.error(
        `❌ Failed to get package:`,
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }
  });
