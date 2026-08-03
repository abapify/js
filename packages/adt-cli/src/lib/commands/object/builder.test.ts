import { describe, expect, it } from 'vitest';
import { resolveEffectiveTransport } from './builder';

describe('resolveEffectiveTransport', () => {
  it('uses the authoritative correlation number returned by SAP LOCK', () => {
    expect(
      resolveEffectiveTransport(
        { handle: 'lock-1', correlationNumber: 'DEVK900001' },
        'DEVK900002',
      ),
    ).toBe('DEVK900001');
  });

  it('falls back to the caller transport when LOCK omits correlation data', () => {
    expect(resolveEffectiveTransport({ handle: 'lock-1' }, 'DEVK900002')).toBe(
      'DEVK900002',
    );
  });
});
