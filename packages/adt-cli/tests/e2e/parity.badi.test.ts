/**
 * CLI + MCP parity tests for BAdI commands.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  startAdtHarness,
  runCliCommand,
  callMcpTool,
  type AdtHarness,
} from './index';

describe('CLI + MCP parity (badi)', () => {
  let harness: AdtHarness;

  beforeAll(async () => {
    harness = await startAdtHarness();
  }, 30_000);

  afterAll(async () => {
    if (harness) await harness.stop();
  });

  it('parity: read ENHO BAdI info with implementations', async () => {
    const cli = await runCliCommand(harness, [
      'badi',
      'ZE_MOCK_BADI',
      '--implementations',
    ]);
    expect(cli.exitCode, cli.stderr || cli.stdout).toBe(0);
    expect(cli.stdout).toContain('ZE_MOCK_BADI');
    expect(cli.stdout).toContain('ZCL_MOCK_BADI_IMPL');
    expect(cli.stdout).toContain('ZE_MOCK_BADI_DEF');
  });

  it('parity: read ENHO BAdI info as JSON', async () => {
    const cli = await runCliCommand(harness, [
      'badi',
      'ZE_MOCK_BADI',
      '--json',
    ]);
    expect(cli.exitCode, cli.stderr || cli.stdout).toBe(0);
    expect(cli.json).toBeDefined();
    expect(cli.json?.name).toBe('ZE_MOCK_BADI');
    expect(cli.json?.badiImplementations).toHaveLength(1);
    expect(cli.json?.badiImplementations[0].implementingClass).toBe(
      'ZCL_MOCK_BADI_IMPL',
    );
  });

  it('parity: read ENHO/XHH source via get badi', async () => {
    const cli = await runCliCommand(harness, ['get', 'badi', 'ZE_MOCK_BADI']);
    expect(cli.exitCode, cli.stderr || cli.stdout).toBe(0);
    expect(cli.stdout).toContain('lcl_badi_impl');

    const mcp = await callMcpTool(harness, 'get_badi', {
      badiName: 'ZE_MOCK_BADI',
      includeSource: true,
    });
    expect(mcp.isError, JSON.stringify(mcp.json)).toBe(false);
    expect(String(JSON.stringify(mcp.json))).toContain('lcl_badi_impl');
  });

  it('parity: read ENHO/XHH metadata via get badi', async () => {
    const cli = await runCliCommand(harness, [
      'get',
      'badi',
      'ZE_MOCK_BADI',
      '--json',
    ]);
    expect(cli.exitCode, cli.stderr || cli.stdout).toBe(0);

    const mcp = await callMcpTool(harness, 'get_badi', {
      badiName: 'ZE_MOCK_BADI',
    });
    expect(mcp.isError, JSON.stringify(mcp.json)).toBe(false);
  });

  it('parity: read classic BAdI definition', async () => {
    const cli = await runCliCommand(harness, [
      'get',
      'badi',
      'MOCK_CTS_REQUEST_CHECK',
      '--json',
    ]);
    expect(cli.exitCode, cli.stderr || cli.stdout).toBe(0);

    const mcp = await callMcpTool(harness, 'get_badi', {
      badiName: 'MOCK_CTS_REQUEST_CHECK',
    });
    expect(mcp.isError, JSON.stringify(mcp.json)).toBe(false);
    expect(mcp.json.kind).toBe('definition');
    expect(mcp.json.type).toBe('SXSD/XD');
  });

  it('parity: read classic BAdI implementation', async () => {
    const cli = await runCliCommand(harness, [
      'get',
      'badi',
      'ZE_MOCK_CLASSIC_BADI_IMPL',
      '--json',
    ]);
    expect(cli.exitCode, cli.stderr || cli.stdout).toBe(0);

    const mcp = await callMcpTool(harness, 'get_badi', {
      badiName: 'ZE_MOCK_CLASSIC_BADI_IMPL',
    });
    expect(mcp.isError, JSON.stringify(mcp.json)).toBe(false);
    expect(mcp.json.kind).toBe('implementation');
    expect(mcp.json.type).toBe('SXCI/XI');
  });

  it('parity: list classic implementations with --implementations', async () => {
    const cli = await runCliCommand(harness, [
      'get',
      'badi',
      'MOCK_CTS_REQUEST_CHECK',
      '--implementations',
      '--json',
    ]);
    expect(cli.exitCode, cli.stderr || cli.stdout).toBe(0);

    const mcp = await callMcpTool(harness, 'get_badi', {
      badiName: 'MOCK_CTS_REQUEST_CHECK',
      includeImplementations: true,
    });
    expect(mcp.isError, JSON.stringify(mcp.json)).toBe(false);
    expect(mcp.json.implementations?.length).toBe(2);
    expect(
      mcp.json.implementations?.map((entry: { name: string }) => entry.name),
    ).toEqual(
      expect.arrayContaining([
        'ZE_MOCK_CLASSIC_BADI_IMPL',
        'ZE_MOCK_CLASSIC_BADI_IMPL_B',
      ]),
    );
  });
});
