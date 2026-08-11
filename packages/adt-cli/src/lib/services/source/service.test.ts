import { describe, expect, it, vi } from 'vitest';
import type { AdtClient } from '@abapify/adt-client';
import { getSource, type GetSourceGrepResult } from './service';

const CLASS_SOURCE = [
  'CLASS zcl_demo DEFINITION PUBLIC.',
  '  PUBLIC SECTION.',
  '    METHODS run.',
  'ENDCLASS.',
  '',
  'CLASS zcl_demo IMPLEMENTATION.',
  '  METHOD run.',
  '    DATA(lv_needle) = 1.',
  '  ENDMETHOD.',
  '  METHOD helper.',
  '    WRITE lv_needle.',
  '  ENDMETHOD.',
  'ENDCLASS.',
].join('\n');

function createClient(source = CLASS_SOURCE): AdtClient {
  return {
    readTextBounded: vi.fn(async () => source),
  } as unknown as AdtClient;
}

describe('getSource grep', () => {
  it('annotates matches with the enclosing method', async () => {
    const result = (await getSource(createClient(), {
      objectName: 'ZCL_DEMO',
      objectType: 'CLAS',
      grep: 'lv_needle',
    })) as GetSourceGrepResult;

    expect(result.matchCount).toBe(2);
    expect(
      result.methodContext?.filter((m) => m.method === 'RUN').length,
    ).toBeGreaterThan(0);
    expect(result.methodContext?.some((m) => m.method === 'HELPER')).toBe(true);
  });

  it('returns no matches for a pattern that is absent', async () => {
    const result = (await getSource(createClient(), {
      objectName: 'ZCL_DEMO',
      objectType: 'CLAS',
      grep: 'zzz_not_there',
    })) as GetSourceGrepResult;

    expect(result.matchCount).toBe(0);
    expect(result.matches).toEqual([]);
    expect(result.methodContext).toEqual([]);
  });

  it('rejects grep combined with method', async () => {
    await expect(
      getSource(createClient(), {
        objectName: 'ZCL_DEMO',
        objectType: 'CLAS',
        grep: 'run',
        method: 'RUN',
      }),
    ).rejects.toThrow(/Do not combine grep with method/);
  });

  it('rejects disallowed regex patterns', async () => {
    await expect(
      getSource(createClient(), {
        objectName: 'ZCL_DEMO',
        objectType: 'CLAS',
        grep: '(?=abc)',
      }),
    ).rejects.toThrow();
  });
});
