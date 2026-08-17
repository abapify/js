import { describe, expect, it } from 'vitest';
import { formatFetchFailure } from './fetch';

describe('formatFetchFailure', () => {
  it('reports HTTP status and a bounded, redacted response body', () => {
    const error = Object.assign(
      new Error('HTTP 502: Bad Gateway?access_token=message-secret'),
      {
        status: 502,
        statusText: 'Bad Gateway',
        rawBody:
          '{"message":"upstream unavailable","requestId":"req-123","access_token":"secret-token","password":"secret-password"}',
      },
    );

    const diagnostic = formatFetchFailure(error).join('\n');

    expect(diagnostic).toContain('HTTP status: 502 Bad Gateway');
    expect(diagnostic).toContain('Response body (sanitized');
    expect(diagnostic).toContain('requestId');
    expect(diagnostic).toContain('[REDACTED]');
    expect(diagnostic).not.toContain('secret-token');
    expect(diagnostic).not.toContain('secret-password');
    expect(diagnostic).not.toContain('message-secret');
  });

  it('distinguishes a transport failure from an HTTP response', () => {
    const cause = Object.assign(new Error('socket hang up'), {
      code: 'ECONNRESET',
    });
    const error = new TypeError('fetch failed', { cause });

    const diagnostic = formatFetchFailure(error).join('\n');

    expect(diagnostic).toContain('HTTP response: none received');
    expect(diagnostic).toContain(
      'Transport cause: socket hang up (ECONNRESET)',
    );
  });
});
