/**
 * CLI + MCP parity for exact source-history delivery surfaces.
 *
 * The existing mock server has a plain-source route but deliberately has no
 * fabricated Atom version feed. This suite therefore proves explicit source
 * delivery, response bounds, and tool registration now; exact list/manifest
 * feed parity remains blocked on the sanitized SAP-derived fixtures tracked by
 * OpenSpec task 1.1.
 */

import { Buffer } from 'node:buffer';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  callMcpTool,
  runCliCommand,
  startAdtHarness,
  type AdtHarness,
} from './index';

describe('parity: exact source history', () => {
  let harness: AdtHarness;

  beforeAll(async () => {
    harness = await startAdtHarness();
  }, 30_000);

  afterAll(async () => {
    if (harness) await harness.stop();
  });

  it('registers all exact source-history MCP tools', async () => {
    const response = await harness.mcpClient.listTools();
    const names = response.tools.map((tool) => tool.name);

    expect(names).toContain('list_source_versions');
    expect(names).toContain('get_source_version');
    expect(names).toContain('cts_transport_source_manifest');
  });

  it('explicit source retrieval returns the same UTF-8 body through CLI and MCP', async () => {
    // The query makes this a version-shaped ADT URI while still using the
    // existing real-source mock route. No Atom feed is fabricated here.
    const uri =
      '/sap/bc/adt/oo/classes/zcl_source_history/source/main?version=mock-1';
    const cli = await runCliCommand(harness, [
      'source',
      'version',
      'get',
      '--uri',
      uri,
      '--output',
      '-',
    ]);
    expect(cli.exitCode, cli.stderr || cli.stdout).toBe(0);
    expect(cli.stdout.length).toBeGreaterThan(0);

    const mcp = await callMcpTool<{
      bytes: number;
      source: string;
    }>(harness, 'get_source_version', { uri });

    expect(mcp.isError).toBe(false);
    expect(mcp.json.source).toBe(cli.stdout);
    expect(mcp.json.bytes).toBe(Buffer.byteLength(cli.stdout, 'utf8'));
  });

  it('fails with a typed diagnostic instead of truncating oversized source', async () => {
    const uri =
      '/sap/bc/adt/oo/classes/zcl_source_history/source/main?version=mock-1';
    const mcp = await callMcpTool<{
      error: {
        code: string;
        message: string;
        actualBytes: number;
        maxBytes: number;
      };
    }>(harness, 'get_source_version', { uri, maxBytes: 1 });

    expect(mcp.isError).toBe(true);
    expect(mcp.json.error.code).toBe('SOURCE_VERSION_TOO_LARGE');
    expect(mcp.json.error.actualBytes).toBeGreaterThan(1);
    expect(mcp.json.error.maxBytes).toBe(1);
    expect(JSON.stringify(mcp.json)).not.toContain('CLASS ');
  });

  it('does not echo unsafe URIs or adapter details in source-read diagnostics', async () => {
    const sensitiveMarker = ['private', 'marker'].join('-');
    const unsafeUri = `https://example.invalid/source?token=${sensitiveMarker}`;
    const mcp = await callMcpTool<{
      error: { code: string; message: string };
    }>(harness, 'get_source_version', { uri: unsafeUri });

    expect(mcp.isError).toBe(true);
    expect(mcp.json.error.code).toBe('SOURCE_VERSION_READ_FAILED');
    expect(JSON.stringify(mcp.json)).not.toContain(sensitiveMarker);
    expect(JSON.stringify(mcp.json)).not.toContain('example.invalid');
  });

  it('does not normalize surrounding URI whitespace before safety validation', async () => {
    const unsafeUri =
      ' /sap/bc/adt/oo/classes/zcl_source_history/source/main?version=mock-1';
    const mcp = await callMcpTool<{
      error: { code: string; message: string };
    }>(harness, 'get_source_version', { uri: unsafeUri });

    expect(mcp.isError).toBe(true);
    expect(mcp.json.error.code).toBe('SOURCE_VERSION_READ_FAILED');
    expect(JSON.stringify(mcp.json)).not.toContain(unsafeUri);
  });

  it('returns the same metadata-only component diagnostics through CLI and MCP', async () => {
    const cli = await runCliCommand(harness, [
      'source',
      'versions',
      'ZCL_TEST_CLASS',
      '--type',
      'CLAS',
      '--json',
    ]);
    const cliResult = cli.json as
      | {
          object: { name: string; type: string };
          components: unknown[];
        }
      | undefined;

    expect(cliResult, cli.stderr || cli.stdout).toBeDefined();

    const mcp = await callMcpTool<typeof cliResult>(
      harness,
      'list_source_versions',
      { objectName: 'ZCL_TEST_CLASS', objectType: 'CLAS' },
    );

    expect(mcp.isError).toBe(false);
    expect(mcp.json).toEqual(cliResult);
    expect(cliResult!.components.length).toBeGreaterThan(0);
    expect(JSON.stringify(cliResult)).not.toContain('"source":');
  });

  it('normalizes the same metadata-only transport manifest through CLI and MCP', async () => {
    const previousProcessExitCode = process.exitCode;
    const cli = await runCliCommand(harness, [
      'cts',
      'tr',
      'source-manifest',
      'DEVK900001',
      '--json',
    ]);
    process.exitCode = previousProcessExitCode;
    const cliManifest = cli.json as
      | {
          requestedTransports: string[];
          scopeTransports: string[];
          entries: unknown[];
        }
      | undefined;

    expect(cliManifest, cli.stderr || cli.stdout).toBeDefined();

    const mcp = await callMcpTool<typeof cliManifest>(
      harness,
      'cts_transport_source_manifest',
      { transports: ['DEVK900001'] },
    );

    expect(mcp.isError).toBe(false);
    expect(mcp.json).toEqual(cliManifest);
    expect(cliManifest!.entries.length).toBeGreaterThan(0);
    expect(JSON.stringify(cliManifest)).not.toContain('"source":');
  });

  it.todo(
    'exact list_source_versions record parity — blocked until OpenSpec task 1.1 can add a sanitized SAP-derived Atom version feed; the parity test above covers the current no-versions diagnostic state only',
  );

  it.todo(
    'exact base/head manifest parity — blocked until the same sanitized Atom feed fixture exists; the parity test above covers the current unsupported/failed diagnostic states only',
  );
});
