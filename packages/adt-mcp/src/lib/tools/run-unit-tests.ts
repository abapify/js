/**
 * Tool: run_unit_tests – run ABAP Unit tests on an object or package
 *
 * CLI equivalent: `adt aunit` (from @abapify/adt-aunit plugin)
 *
 * Reuses the AUnit contract from adt-contracts via client.adt.aunit.testruns.post().
 * Follows the same body-typing pattern as packages/adt-aunit (local interface that
 * includes objectReferences, which the auto-generated AunitRunSchema omits because it
 * references the adtcoreObjectSets XSD externally).
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ToolContext } from '../types';
import { sessionOrConnectionShape } from './shared-schemas';
import { resolveClient } from './session-helpers';
import { isKnownAdtHttpFailure, resolveObjectUri } from './utils';
import type { InferTypedSchema } from '@abapify/adt-schemas';
import { aunitResult } from '@abapify/adt-schemas';
import { extractCoverageMeasurementId } from '@abapify/adt-contracts';
import {
  toJacocoXml,
  toSonarGenericCoverageXml,
} from '@abapify/adt-aunit/formatters/jacoco';
import { normalizeUnitTestOptions } from './scope-catalogue.js';

type AunitResultData = InferTypedSchema<typeof aunitResult>;
type AunitProgram = NonNullable<
  AunitResultData['runResult']['program']
>[number];

/**
 * Full run-configuration body type including objectReferences.
 *
 * The auto-generated AunitRunSchema omits `objectReferences` inside `objectSet`
 * because the XSD references it from a separate adtcoreObjectSets schema.  The
 * schema's build() method handles it correctly at runtime.  This interface
 * mirrors the same workaround used in packages/adt-aunit/src/commands/aunit.ts.
 */
interface RunConfigurationBody {
  runConfiguration: {
    external?: { coverage?: { active?: string } };
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
      testDurations?: { short?: string; medium?: string; long?: string };
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

function buildRunConfiguration(
  targetUris: string[],
  withCoverage = false,
): RunConfigurationBody {
  return {
    runConfiguration: {
      external: { coverage: { active: withCoverage ? 'true' : 'false' } },
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
        testDurations: { short: 'true', medium: 'true', long: 'true' },
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

/** Normalize AUnit response into a simple summary using proper schema types */
function normalizeResult(response: AunitResultData): {
  totalTests: number;
  passCount: number;
  failCount: number;
  errorCount: number;
  programs: AunitProgram[];
} {
  const programs = response.runResult.program ?? [];
  let totalTests = 0;
  let passCount = 0;
  let failCount = 0;
  let errorCount = 0;

  for (const prog of programs) {
    const testClasses = prog.testClasses?.testClass ?? [];
    for (const tc of Array.isArray(testClasses) ? testClasses : [testClasses]) {
      const methods = tc?.testMethods?.testMethod ?? [];
      for (const tm of Array.isArray(methods) ? methods : [methods]) {
        totalTests++;
        const alerts = tm?.alerts?.alert ?? [];
        const alertArr = Array.isArray(alerts) ? alerts : [alerts];
        if (alertArr.length === 0) {
          passCount++;
        } else {
          const hasFail = alertArr.some(
            (a) => a?.kind === 'failedAssertion' || a?.severity === 'critical',
          );
          const hasError = alertArr.some(
            (a) => a?.kind === 'error' || a?.severity === 'fatal',
          );
          if (hasError) errorCount++;
          else if (hasFail) failCount++;
          else passCount++;
        }
      }
    }
  }

  return { totalTests, passCount, failCount, errorCount, programs };
}

function resultCounts(programs: AunitProgram[]): {
  programs: number;
  testClasses: number;
  testMethods: number;
  findings: number;
} {
  let testClasses = 0;
  let testMethods = 0;
  let findings = 0;
  for (const program of programs) {
    const rawClasses = program.testClasses?.testClass ?? [];
    const classes = Array.isArray(rawClasses) ? rawClasses : [rawClasses];
    testClasses += classes.length;
    for (const testClass of classes) {
      const rawMethods = testClass?.testMethods?.testMethod ?? [];
      const methods = Array.isArray(rawMethods) ? rawMethods : [rawMethods];
      testMethods += methods.length;
      for (const method of methods) {
        const rawAlerts = method?.alerts?.alert ?? [];
        findings += Array.isArray(rawAlerts) ? rawAlerts.length : 1;
      }
    }
  }
  return {
    programs: programs.length,
    testClasses,
    testMethods,
    findings,
  };
}

function coverageMeasurementCount(value: unknown): number {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return 0;
  const record = value as Record<string, unknown>;
  const nodes = record.nodes;
  if (!nodes || typeof nodes !== 'object' || Array.isArray(nodes)) return 0;
  const rawChildren = (nodes as Record<string, unknown>).node;
  const children = Array.isArray(rawChildren)
    ? rawChildren
    : rawChildren
      ? [rawChildren]
      : [];
  return children.reduce(
    (total, child) => total + 1 + coverageMeasurementCount(child),
    0,
  );
}

function limitExceeded() {
  return {
    isError: true as const,
    content: [{ type: 'text' as const, text: 'safe_execute_limit_exceeded' }],
  };
}

export function registerRunUnitTestsTool(
  server: McpServer,
  ctx: ToolContext,
): void {
  server.tool(
    'run_unit_tests',
    'Run ABAP Unit tests on an object or package and return pass/fail counts per method',
    {
      ...sessionOrConnectionShape,
      objectName: z
        .string()
        .describe('ABAP object name (class, program, or package)'),
      objectType: z
        .string()
        .optional()
        .describe(
          'Object type (e.g. CLAS, PROG, DEVC). Speeds up URI resolution.',
        ),
      withCoverage: z
        .boolean()
        .optional()
        .describe('Whether to collect code coverage data'),
      coverage: z
        .boolean()
        .optional()
        .describe(
          'Alias for withCoverage. If true, returns coverage report XML alongside the results.',
        ),
      coverageFormat: z
        .enum(['jacoco', 'sonar-generic'])
        .optional()
        .default('jacoco')
        .describe('Coverage report format when coverage is enabled'),
    },
    async (args, extra) => {
      const access = ctx.requestAccess?.(extra ?? {});
      const safePolicy =
        access?.scoped?.operationClass === 'safe_execute' &&
        access.scoped.safeExecutePolicy?.operationId === 'run_unit_tests'
          ? access.scoped.safeExecutePolicy
          : undefined;
      try {
        const normalizedOptions = normalizeUnitTestOptions(args);
        if (!normalizedOptions) {
          return {
            isError: true,
            content: [
              {
                type: 'text' as const,
                text: 'Run unit tests failed: coverage options disagree',
              },
            ],
          };
        }
        const { client } = await resolveClient(ctx, args, extra ?? {});

        const objectUri = await resolveObjectUri(
          client,
          args.objectName,
          args.objectType,
        );
        if (!objectUri) {
          return {
            isError: true,
            content: [
              {
                type: 'text' as const,
                text: `Object '${args.objectName}' not found`,
              },
            ],
          };
        }

        const wantsCoverage = normalizedOptions.effectiveWithCoverage;

        const body = buildRunConfiguration([objectUri], wantsCoverage);

        // Use the typed AUnit contract – adapter calls aunitRun.build(body) for the request
        // and aunitResult.parse(responseXml) for the response automatically.
        // Body is typed via RunConfigurationBody (see comment above buildRunConfiguration).
        const response = await client.adt.aunit.testruns.post(
          body as Parameters<typeof client.adt.aunit.testruns.post>[0],
        );
        const result = normalizeResult(response as AunitResultData);
        const counts = resultCounts(result.programs);
        if (safePolicy) {
          if (counts.findings > safePolicy.maxFindings) {
            return limitExceeded();
          }
          if (
            safePolicy.check === 'aunit' &&
            (counts.testClasses > safePolicy.maxTestClasses ||
              counts.testMethods > safePolicy.maxTestMethods)
          ) {
            return limitExceeded();
          }
          if (
            safePolicy.check === 'coverage' &&
            counts.programs > safePolicy.maxPrograms
          ) {
            return limitExceeded();
          }
        }

        // Optional: follow the coverage link and serialise a JaCoCo / Sonar report.
        let coveragePayload:
          { format: string; xml: string; warning?: string } | undefined;

        if (wantsCoverage) {
          const measurementId = extractCoverageMeasurementId(response);
          const runtime = (
            client as unknown as {
              adt: {
                runtime?: {
                  traces: {
                    coverage: {
                      measurements: { post: (id: string) => Promise<unknown> };
                      statements: { get: (id: string) => Promise<unknown> };
                    };
                  };
                };
              };
            }
          ).adt.runtime;

          if (!measurementId) {
            coveragePayload = {
              format: normalizedOptions.effectiveCoverageFormat ?? 'jacoco',
              xml: '',
              warning:
                'Coverage requested but SAP returned no measurement link.',
            };
          } else if (!runtime) {
            coveragePayload = {
              format: normalizedOptions.effectiveCoverageFormat ?? 'jacoco',
              xml: '',
              warning: 'runtime/traces contract not available on this client.',
            };
          } else {
            const cov = runtime.traces.coverage;
            try {
              const measurements = (await cov.measurements.post(
                measurementId,
              )) as Parameters<typeof toJacocoXml>[0]['measurements'];
              if (
                safePolicy?.check === 'coverage' &&
                coverageMeasurementCount(measurements.result) >
                  safePolicy.maxMeasurements
              ) {
                return limitExceeded();
              }
              const statements = (await cov.statements.get(
                measurementId,
              )) as Parameters<typeof toJacocoXml>[0]['statements'];
              const fmt = normalizedOptions.effectiveCoverageFormat ?? 'jacoco';
              const xml =
                fmt === 'sonar-generic'
                  ? toSonarGenericCoverageXml({ measurements, statements })
                  : toJacocoXml({ measurements, statements });
              coveragePayload = { format: fmt, xml };
            } catch (err) {
              if (safePolicy) throw err;
              coveragePayload = {
                format: normalizedOptions.effectiveCoverageFormat ?? 'jacoco',
                xml: '',
                warning: `Coverage fetch failed: ${err instanceof Error ? err.message : String(err)}`,
              };
            }
          }
        }

        const payload = coveragePayload
          ? { testResults: result, coverage: coveragePayload }
          : result;

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(payload, null, 2),
            },
          ],
        };
      } catch (error) {
        if (safePolicy && !isKnownAdtHttpFailure(error)) throw error;
        return {
          isError: true,
          content: [
            {
              type: 'text' as const,
              text: `Run unit tests failed: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    },
  );
}
