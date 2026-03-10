/**
 * JUnit XML Formatter
 *
 * Outputs AUnit results in JUnit XML format compatible with
 * GitLab CI unit_test_reports.
 *
 * @see https://docs.gitlab.com/ci/testing/unit_test_reports/
 *
 * GitLab parses:
 * - testsuites > testsuite (name, time)
 * - testsuite > testcase (classname, name, file, time)
 * - testcase > failure, error, skipped
 * - testcase > system-out, system-err
 */

import { writeFile } from 'fs/promises';
import type { AunitResult, AunitTestMethod } from '../types';

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Build failure/error message from alerts
 */
function buildAlertMessage(method: AunitTestMethod): string {
  return method.alerts
    .map((alert) => {
      const lines: string[] = [];
      lines.push(alert.title);
      for (const detail of alert.details) {
        lines.push(`  ${detail}`);
      }
      if (alert.stack.length > 0) {
        lines.push('Stack:');
        for (const entry of alert.stack) {
          const desc = entry.description || entry.name || '';
          lines.push(`  at ${desc}${entry.uri ? ` (${entry.uri})` : ''}`);
        }
      }
      return lines.join('\n');
    })
    .join('\n---\n');
}

/**
 * Convert AUnit result to JUnit XML string
 */
export function toJunitXml(result: AunitResult): string {
  const lines: string[] = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');

  // Collect all test suites (one per test class)
  const suites: string[] = [];

  for (const program of result.programs) {
    for (const testClass of program.testClasses) {
      const tests = testClass.methods.length;
      const failures = testClass.methods.filter(
        (m) => m.status === 'fail',
      ).length;
      const errors = testClass.methods.filter(
        (m) => m.status === 'error',
      ).length;
      const skipped = testClass.methods.filter(
        (m) => m.status === 'skip',
      ).length;
      const time = testClass.methods.reduce(
        (sum, m) => sum + m.executionTime,
        0,
      );

      const suiteLines: string[] = [];
      suiteLines.push(
        `  <testsuite name="${escapeXml(program.name)}.${escapeXml(testClass.name)}" tests="${tests}" failures="${failures}" errors="${errors}" skipped="${skipped}" time="${time.toFixed(3)}">`,
      );

      for (const method of testClass.methods) {
        const classname = `${program.name}.${testClass.name}`;
        suiteLines.push(
          `    <testcase classname="${escapeXml(classname)}" name="${escapeXml(method.name)}" time="${method.executionTime.toFixed(3)}">`,
        );

        if (method.status === 'fail') {
          const message = method.alerts[0]?.title || 'Assertion failed';
          const body = buildAlertMessage(method);
          suiteLines.push(
            `      <failure message="${escapeXml(message)}">${escapeXml(body)}</failure>`,
          );
        } else if (method.status === 'error') {
          const message = method.alerts[0]?.title || 'Error';
          const body = buildAlertMessage(method);
          suiteLines.push(
            `      <error message="${escapeXml(message)}">${escapeXml(body)}</error>`,
          );
        } else if (method.status === 'skip') {
          suiteLines.push('      <skipped/>');
        }

        // Add system-out with ADT URI for navigation
        if (method.uri) {
          suiteLines.push(
            `      <system-out>${escapeXml(method.uri)}</system-out>`,
          );
        }

        suiteLines.push('    </testcase>');
      }

      suiteLines.push('  </testsuite>');
      suites.push(suiteLines.join('\n'));
    }
  }

  lines.push(
    `<testsuites tests="${result.totalTests}" failures="${result.failCount}" errors="${result.errorCount}" skipped="${result.skipCount}" time="${result.totalTime.toFixed(3)}">`,
  );
  lines.push(...suites);
  lines.push('</testsuites>');

  return lines.join('\n');
}

/**
 * Write JUnit XML report to file
 */
export async function outputJunitReport(
  result: AunitResult,
  outputFile: string,
): Promise<void> {
  const xml = toJunitXml(result);
  await writeFile(outputFile, xml, 'utf-8');
  console.log(`\n📄 JUnit XML report written to: ${outputFile}`);
  console.log(
    `📊 ${result.totalTests} tests (${result.passCount} passed, ${result.failCount} failed, ${result.errorCount} errors)`,
  );
}
