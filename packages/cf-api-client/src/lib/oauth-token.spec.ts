import { describe, it, expect, vi } from 'vitest';
import { ChildProcess, exec } from 'child_process';
import assert from 'node:assert';

import { getOAuthToken } from './oauth-token';

vi.mock('util', () => ({
  promisify: vi.fn((fn) => fn),
}));

vi.mock('child_process', () => ({
  exec: vi.fn(),
}));

describe('getOAuthToken', () => {
  it('returns the oauth token from cf cli', async () => {
    const mockToken = 'bearer abc123xyz';

    vi.mocked(exec).mockResolvedValue({
      stdout: mockToken,
      stderr: '',
    } as unknown as ChildProcess);

    const result = await getOAuthToken();

    expect(exec).toHaveBeenCalledWith('cf oauth-token');
    expect(result).toBe(mockToken);
  });

  it('returns error message when command fails', async () => {
    const errorMessage = 'Command failed: cf oauth-token\nNot logged in';
    vi.mocked(exec).mockRejectedValue(new Error(errorMessage));

    try {
      await getOAuthToken();
      assert(false, 'Should have thrown an error');
    } catch (error) {
      assert(error instanceof Error);
      expect(error).toHaveProperty('message', errorMessage);
    }
  });
});
