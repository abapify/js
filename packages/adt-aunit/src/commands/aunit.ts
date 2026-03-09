/**
 * AUnit Command Plugin
 *
 * CLI-agnostic command for running ABAP Unit tests.
 * Uses the CliContext.getAdtClient() factory for API access.
 *
 * Supports JUnit XML output for GitLab CI integration:
 * @see https://docs.gitlab.com/ci/testing/unit_test_reports/
 */

import type { CliCommandPlugin, CliContext } from '@abapify/adt-plugin';
// Simple ANSI color helpers (no external dependency)
const ansi = {
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
};
import { outputJunitReport } from '../formatters';
import type {
  AunitResult,
  AunitProgram,
  AunitTestClass,
  AunitTestMethod,
  AunitAlert,
  OutputFormat,
} from '../types';

// Client type - the plugin receives a typed client from context
// The client.adt.aunit namespace provides the testruns operation
interface AdtClient {
  adt: {
    aunit: {
      testruns: {
        post: (body: RunConfigurationBody) => Promise<RunResultResponse>;
      };
    };
  };
}

// Request body shape (matches aunitRun schema)
interface RunConfigurationBody {
  runConfiguration: {
    external?: {
      coverage?: { active?: string };
    };
    options?: {
      uriType?: { value?: string };
      testDeterminationStrategy?: {
        sameProgram?: string;
        assignedTests?: string;
        appendAssignedTestsPreview?: string;
      };
      testRiskLevels?: {
        harmless?: string;
        dangerous?: string;
        critical?: string;
      };
      testDurations?: {
        short?: string;
        medium?: string;
        long?: string;
      };
      withNavigationUri?: { enabled?: string };
    };
    objectSets: {
      objectSet: Array<{
        kind: string;
        objectReferences?: {
          objectReference: Array<{ uri: string }>;
        };
      }>;
    };
  };
}

// Response shape (matches aunitResult schema)
interface RunResultResponse {
  runResult: {
    program?: Array<{
      uri?: string;
      type?: string;
      name?: string;
      uriType?: string;
      testClasses?: {
        testClass?: Array<{
          uri?: string;
          name?: string;
          uriType?: string;
          durationCategory?: string;
          riskLevel?: string;
          testMethods?: {
            testMethod?: Array<{
              uri?: string;
              name?: string;
              executionTime?: string;
              uriType?: string;
              unit?: string;
              alerts?: {
                alert?: Array<{
                  kind?: string;
                  severity?: string;
                  title?: string;
                  details?: {
                    detail?: Array<{ text?: string }>;
                  };
                  stack?: {
                    stackEntry?: Array<{
                      uri?: string;
                      type?: string;
                      name?: string;
                      description?: string;
                    }>;
                  };
                }>;
              };
            }>;
          };
          alerts?: {
            alert?: Array<{
              kind?: string;
              severity?: string;
              title?: string;
              details?: {
                detail?: Array<{ text?: string }>;
              };
              stack?: {
                stackEntry?: Array<{
                  uri?: string;
                  type?: string;
                  name?: string;
                  description?: string;
                }>;
              };
            }>;
          };
        }>;
      };
      alerts?: {
        alert?: Array<{
          kind?: string;
          severity?: string;
          title?: string;
        }>;
      };
    }>;
  };
}

/**
 * Build the default runConfiguration request body
 */
function buildRunConfiguration(targetUris: string[]): RunConfigurationBody {
  return {
    runConfiguration: {
      external: {
        coverage: { active: 'false' },
      },
      options: {
        uriType: { value: 'semantic' },
        testDeterminationStrategy: {
          sameProgram: 'true',
          assignedTests: 'false',
          appendAssignedTestsPreview: 'true',
        },
        testRiskLevels: {
          harmless: 'true',
          dangerous: 'true',
          critical: 'true',
        },
        testDurations: {
          short: 'true',
          medium: 'true',
          long: 'true',
        },
        withNavigationUri: { enabled: 'false' },
      },
      objectSets: {
        objectSet: [
          {
            kind: 'inclusive',
            objectReferences: {
              objectReference: targetUris.map((uri) => ({ uri })),
            },
          },
        ],
      },
    },
  };
}

/**
 * Convert SAP AUnit response to our normalized AunitResult
 */
function convertResponse(response: RunResultResponse): AunitResult {
  const programs: AunitProgram[] = [];
  let totalTests = 0;
  let passCount = 0;
  let failCount = 0;
  let errorCount = 0;
  let skipCount = 0;
  let totalTime = 0;

  for (const prog of response.runResult.program || []) {
    const testClasses: AunitTestClass[] = [];

    for (const tc of prog.testClasses?.testClass || []) {
      const methods: AunitTestMethod[] = [];

      for (const tm of tc.testMethods?.testMethod || []) {
        const execTime = parseFloat(tm.executionTime || '0');
        totalTime += execTime;

        const alerts: AunitAlert[] = [];
        let status: AunitTestMethod['status'] = 'pass';

        for (const alert of tm.alerts?.alert || []) {
          const details = (alert.details?.detail || []).map(
            (d) => d.text || '',
          );
          const stack = (alert.stack?.stackEntry || []).map((s) => ({
            uri: s.uri,
            type: s.type,
            name: s.name,
            description: s.description,
          }));

          alerts.push({
            kind: alert.kind || 'unknown',
            severity: alert.severity || 'unknown',
            title: alert.title || '',
            details,
            stack,
          });

          // Determine status from alert severity/kind
          if (
            alert.severity === 'critical' ||
            alert.kind === 'failedAssertion'
          ) {
            status = 'fail';
          } else if (alert.severity === 'fatal' || alert.kind === 'error') {
            status = 'error';
          }
        }

        totalTests++;
        if (status === 'pass') passCount++;
        else if (status === 'fail') failCount++;
        else if (status === 'error') errorCount++;
        else if (status === 'skip') skipCount++;

        methods.push({
          name: tm.name || 'UNKNOWN',
          uri: tm.uri,
          executionTime: execTime,
          status,
          alerts,
        });
      }

      testClasses.push({
        name: tc.name || 'UNKNOWN',
        uri: tc.uri,
        riskLevel: tc.riskLevel,
        durationCategory: tc.durationCategory,
        methods,
      });
    }

    programs.push({
      name: prog.name || 'UNKNOWN',
      type: prog.type,
      uri: prog.uri,
      testClasses,
    });
  }

  return {
    programs,
    totalTests,
    passCount,
    failCount,
    errorCount,
    skipCount,
    totalTime,
  };
}

/**
 * Create OSC 8 hyperlink for terminal
 */
function hyperlink(text: string, url: string): string {
  const OSC = '\x1b]';
  const BEL = '\x07';
  const SEP = ';';
  return `${OSC}8${SEP}${SEP}${url}${BEL}${text}${OSC}8${SEP}${SEP}${BEL}`;
}

/**
 * Create ADT Eclipse link
 */
function adtLink(name: string, uri: string, systemName?: string): string {
  if (!systemName || !name || !uri) {
    return name ? ansi.cyan(name) : '';
  }
  const path = uri.startsWith('/sap/bc/adt') ? uri : `/sap/bc/adt${uri}`;
  const url = `adt://${systemName}${path}`;
  return hyperlink(ansi.cyan(name), url);
}

/**
 * Display AUnit results in console
 */
function displayResults(result: AunitResult, systemName?: string): void {
  if (result.totalTests === 0) {
    console.log(`\n⚠️  No tests found`);
    return;
  }

  const allPassed = result.failCount === 0 && result.errorCount === 0;

  console.log(`\n${allPassed ? '✅' : '❌'} ABAP Unit Test Results:`);
  console.log(
    `   📋 Total: ${result.totalTests} tests in ${result.totalTime.toFixed(3)}s`,
  );
  if (result.passCount > 0)
    console.log(`   ${ansi.green(`✓ ${result.passCount} passed`)}`);
  if (result.failCount > 0)
    console.log(`   ${ansi.red(`✗ ${result.failCount} failed`)}`);
  if (result.errorCount > 0)
    console.log(`   ${ansi.red(`⚠ ${result.errorCount} errors`)}`);
  if (result.skipCount > 0)
    console.log(`   ${ansi.yellow(`○ ${result.skipCount} skipped`)}`);

  // Show failed tests
  for (const prog of result.programs) {
    for (const tc of prog.testClasses) {
      const failedMethods = tc.methods.filter(
        (m) => m.status === 'fail' || m.status === 'error',
      );
      if (failedMethods.length === 0) continue;

      const classLink = adtLink(
        `${prog.name} → ${tc.name}`,
        tc.uri || prog.uri || '',
        systemName,
      );
      console.log(`\n   ${classLink}`);

      for (const method of failedMethods) {
        const icon = method.status === 'fail' ? ansi.red('✗') : ansi.red('⚠');
        console.log(`     ${icon} ${method.name} (${method.executionTime}s)`);
        for (const alert of method.alerts) {
          console.log(`       ${ansi.dim(alert.title)}`);
          for (const detail of alert.details) {
            console.log(`       ${ansi.dim(`  ${detail}`)}`);
          }
        }
      }
    }
  }
}

/**
 * AUnit Command Plugin
 */
export const aunitCommand: CliCommandPlugin = {
  name: 'aunit',
  description: 'Run ABAP Unit tests',

  options: [
    {
      flags: '-p, --package <package>',
      description: 'Run tests on package',
    },
    {
      flags: '-o, --object <uri>',
      description:
        'Run tests on specific object (e.g., /sap/bc/adt/oo/classes/zcl_my_class)',
    },
    {
      flags: '-c, --class <name>',
      description: 'Run tests on ABAP class (e.g., ZCL_MY_CLASS)',
    },
    {
      flags: '-t, --transport <transport>',
      description:
        'Run tests on transport request (e.g., NPLK900042)',
    },
    {
      flags: '-f, --from-file <file>',
      description: 'Run tests on objects listed in file (one URI per line)',
    },
    {
      flags: '--format <format>',
      description: 'Output format: console, json, junit',
      default: 'console',
    },
    {
      flags: '--output <file>',
      description:
        'Output file (required for junit format, e.g., aunit-report.xml)',
    },
  ],

  async execute(args, ctx: CliContext) {
    const options = args as {
      package?: string;
      object?: string;
      class?: string;
      transport?: string;
      fromFile?: string;
      format?: OutputFormat;
      output?: string;
    };

    // Validate: at least one target
    const targetCount = [
      options.package,
      options.object,
      options.class,
      options.transport,
      options.fromFile,
    ].filter(Boolean).length;

    if (targetCount === 0) {
      ctx.logger.error(
        '❌ One of --package, --object, --class, --transport, or --from-file is required',
      );
      process.exit(1);
    }

    if (targetCount > 1) {
      ctx.logger.error(
        '❌ Only one of --package, --object, --class, --transport, or --from-file can be specified',
      );
      process.exit(1);
    }

    // Validate output file for junit format
    if (options.format === 'junit' && !options.output) {
      ctx.logger.error('❌ --output is required for junit format');
      process.exit(1);
    }

    // Get ADT client
    if (!ctx.getAdtClient) {
      ctx.logger.error('❌ ADT client not available. Run: adt auth login');
      process.exit(1);
    }

    const client = (await ctx.getAdtClient()) as AdtClient;

    // Determine targets
    let targetUris: string[];
    let targetName: string;

    if (options.fromFile) {
      const { readFileSync } = await import('fs');
      const content = readFileSync(options.fromFile, 'utf-8');
      targetUris = content
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#'));
      if (targetUris.length === 0) {
        ctx.logger.error(`❌ No objects found in ${options.fromFile}`);
        process.exit(1);
      }
      targetName = `${targetUris.length} objects from ${options.fromFile}`;
    } else if (options.transport) {
      targetUris = [`/sap/bc/adt/cts/transportrequests/${options.transport.toUpperCase()}`];
      targetName = `Transport ${options.transport.toUpperCase()}`;
    } else if (options.class) {
      targetUris = [`/sap/bc/adt/oo/classes/${options.class.toLowerCase()}`];
      targetName = `Class ${options.class.toUpperCase()}`;
    } else if (options.package) {
      targetUris = [`/sap/bc/adt/packages/${options.package.toUpperCase()}`];
      targetName = `Package ${options.package.toUpperCase()}`;
    } else {
      targetUris = [options.object!];
      targetName = options.object!;
    }

    ctx.logger.info(`🧪 Running ABAP Unit tests on ${targetName}...`);

    // Execute test run
    const body = buildRunConfiguration(targetUris);
    const response = await client.adt.aunit.testruns.post(body);

    // Convert to normalized result
    const result = convertResponse(response);

    // Output
    if (options.format === 'json') {
      console.log(JSON.stringify(result, null, 2));
    } else if (options.format === 'junit' && options.output) {
      await outputJunitReport(result, options.output);
      // Also print summary to console
      displayResults(result, ctx.adtSystemName);
    } else {
      displayResults(result, ctx.adtSystemName);
    }

    // Exit with error code if tests failed
    if (result.failCount > 0 || result.errorCount > 0) {
      process.exit(1);
    }
  },
};

export default aunitCommand;
