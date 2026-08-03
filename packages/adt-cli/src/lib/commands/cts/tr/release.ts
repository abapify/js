/**
 * adt cts tr release <TR> - Release transport request
 *
 * Uses ADK layer for proper transport release.
 * Optionally runs pre-release checks (ATC).
 *
 * Usage:
 *   adt cts tr release TRLK900123
 *   adt cts tr release TRLK900123 --skip-check
 *   adt cts tr release TRLK900123 --json
 */

import { Command } from 'commander';
import { confirm } from '@inquirer/prompts';
import { getAdtClientV2, getCliContext } from '../../../utils/adt-client-v2';
import { createProgressReporter } from '../../../utils/progress-reporter';
import { createCliLogger } from '../../../utils/logger-config';
import { CtsTransportLifecycleService } from '../../../services/cts';

export const ctsReleaseCommand = new Command('release')
  .description('Release transport request')
  .argument('<transport>', 'Transport number (e.g., TRLK900123)')
  .option('--skip-check', 'Skip pre-release validation')
  .option('--release-all', 'Release all tasks first, then the transport')
  .option('-y, --yes', 'Skip confirmation prompt')
  .option('--json', 'Output result as JSON')
  .action(async function (this: Command, transport: string, options) {
    const globalOpts = this.optsWithGlobals?.() ?? {};
    const ctx = getCliContext();
    const verboseFlag = globalOpts.verbose ?? ctx.verbose ?? false;
    const compact = !verboseFlag;
    const logger =
      (this as any).logger ??
      ctx.logger ??
      createCliLogger({ verbose: verboseFlag });
    const progress = createProgressReporter({ compact, logger });

    try {
      const client = await getAdtClientV2();
      const lifecycle = new CtsTransportLifecycleService(client);

      progress.step(`🔍 Getting transport ${transport}...`);
      let summary;
      try {
        summary = await lifecycle.getTransport(transport);
      } catch (_err) {
        console.error(`❌ Transport ${transport} not found or not accessible`);
        process.exit(1);
      }

      progress.done();

      // Check if already released
      if (summary.status === 'R') {
        console.log(`ℹ️  Transport ${transport} is already released`);
        if (options.json) {
          console.log(
            JSON.stringify({ transport, status: 'already_released' }, null, 2),
          );
        }
        return;
      }

      // Display transport info
      if (!options.json) {
        console.log(`\n📋 Transport: ${summary.transport}`);
        console.log(`   Description: ${summary.description || '-'}`);
        console.log(`   Owner: ${summary.owner || '-'}`);
        console.log(
          `   Target: ${summary.targetDescription || summary.target || 'LOCAL'}`,
        );
        console.log(`   Status: ${summary.statusText}`);
        console.log(`   Tasks: ${summary.taskCount}`);
        console.log(`   Objects: ${summary.objectCount}`);
      }

      // Step 2: Pre-release check (not yet implemented - check endpoint not available)
      if (!options.skipCheck) {
        // For now, just warn that checks are not implemented
        if (!options.json) {
          console.log(
            '\n💡 Pre-release checks not yet implemented (use --skip-check to suppress)',
          );
        }
      }

      // Step 3: Confirm release
      if (!options.yes && !options.json) {
        const shouldRelease = await confirm({
          message: `Release transport ${transport}?`,
          default: true,
        });

        if (!shouldRelease) {
          console.log('\n❌ Release cancelled');
          process.exit(0);
        }
      }

      progress.step(`🚀 Releasing transport ${transport}...`);
      const result = await lifecycle.release({
        transport,
        releaseAll: options.releaseAll,
      });
      progress.done();

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(`\n✅ Transport ${transport} released successfully!`);
        console.log(
          `   Target: ${summary.targetDescription || summary.target || 'LOCAL'}`,
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      progress.done(`❌ Release failed: ${message}`);
      console.error('❌ Release failed:', message);
      process.exit(1);
    }
  });
