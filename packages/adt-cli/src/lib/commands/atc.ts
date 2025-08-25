import { Command } from 'commander';
import { AtcService } from '../services/atc/service';
import { adtClient } from '../shared/clients';
import { outputGitLabCodeQuality } from '../formatters/gitlab-formatter';
import { outputSarifReport } from '../formatters/sarif-formatter';

export const atcCommand = new Command('atc')
  .description('⚠️ EXPERIMENTAL: Run ABAP Test Cockpit (ATC) checks')
  .option('-p, --package <package>', 'Run ATC on package')
  .option('-t, --transport <transport>', 'Run ATC on transport request')
  .option('--variant <variant>', 'ATC check variant to use')
  .option('--max-results <number>', 'Maximum number of results', '100')
  .option(
    '--format <format>',
    'Output format: console, json, gitlab, sarif',
    'console'
  )
  .option('--output <file>', 'Output file (required for gitlab format)')
  .option('--debug', 'Enable debug output', false)
  .action(async (options) => {
    try {
      if (!options.package && !options.transport) {
        console.error('❌ Either --package or --transport is required');
        process.exit(1);
      }

      if (options.package && options.transport) {
        console.error('❌ Cannot specify both --package and --transport');
        process.exit(1);
      }

      // Validate format and output options
      if (
        (options.format === 'gitlab' || options.format === 'sarif') &&
        !options.output
      ) {
        console.error(
          `❌ --output <file> is required when using --format=${options.format}`
        );
        process.exit(1);
      }

      if (!['console', 'json', 'gitlab', 'sarif'].includes(options.format)) {
        console.error(
          '❌ Invalid format. Use: console, json, gitlab, or sarif'
        );
        process.exit(1);
      }

      const atcService = new AtcService(adtClient);

      console.log('🔍 Running ABAP Test Cockpit checks...');

      let target: 'package' | 'transport';
      let targetName: string;

      if (options.package) {
        target = 'package';
        targetName = options.package;
        console.log(`📦 Target: Package ${targetName}`);
      } else {
        target = 'transport';
        targetName = options.transport;
        console.log(`🚛 Target: Transport ${targetName}`);
      }

      const result = await atcService.runAtcCheck({
        target,
        targetName,
        checkVariant: options.variant,
        maxResults: parseInt(options.maxResults),
        includeExempted: false,
        debug: options.debug,
      });

      // Display results based on format
      if (options.format === 'json') {
        console.log(JSON.stringify(result, null, 2));
      } else if (options.format === 'gitlab') {
        await outputGitLabCodeQuality(result, options.output);
      } else if (options.format === 'sarif') {
        await outputSarifReport(result, options.output, targetName);
      } else {
        displayAtcResults(result);
      }
    } catch (error) {
      console.error(
        `❌ ATC failed:`,
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }
  });

function displayAtcResults(result: any): void {
  if (result.totalFindings === 0) {
    console.log(`\n✅ ATC check passed - No issues found!`);
  } else {
    console.log(`\n📊 ATC Results Summary:`);
    if (result.errorCount > 0)
      console.log(`   ❌ Errors: ${result.errorCount}`);
    if (result.warningCount > 0)
      console.log(`   ⚠️ Warnings: ${result.warningCount}`);
    if (result.infoCount > 0) console.log(`   ℹ️ Info: ${result.infoCount}`);
    console.log(`   📋 Total Issues: ${result.totalFindings}`);

    if (result.findings && result.findings.length > 0) {
      console.log(`\n📄 Findings:`);
      result.findings.slice(0, 5).forEach((finding: any) => {
        const priorityIcon =
          finding.priority === 1 ? '❌' : finding.priority === 2 ? '⚠️' : 'ℹ️';
        console.log(
          `   ${priorityIcon} ${finding.checkTitle || finding.checkId}`
        );
        console.log(`      ${finding.messageText}`);
        console.log(
          `      Object: ${finding.objectName} (${finding.objectType})`
        );
      });

      if (result.findings.length > 5) {
        console.log(`   ... (${result.findings.length - 5} more findings)`);
      }
    }

    console.log(`\n💡 Use --debug for detailed results`);
  }
}
