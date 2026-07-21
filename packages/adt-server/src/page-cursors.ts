import { createHmac, timingSafeEqual } from 'node:crypto';

const MAX_CURSOR_LENGTH = 4 * 1_024;

type CursorPayload = {
  v: 1;
  fingerprint: string;
  afterKey: string;
};

export class RestPageCursorError extends Error {
  constructor() {
    super('Invalid or mismatched page cursor.');
    this.name = 'RestPageCursorError';
  }
}

export interface RestPageCursorServiceOptions {
  /** Production replicas must share a mounted secret; tests may inject one. */
  secret: string;
  now?: () => number;
}

function compare(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

/**
 * Creates integrity-protected, query-bound cursors for bounded fresh REST
 * snapshots. Cursors contain no ADT URI, credentials, source or SAP body.
 */
export function createRestPageCursorService(
  options: RestPageCursorServiceOptions,
) {
  const secret = options.secret.trim();
  if (!secret) {
    throw new Error('Page cursor secret is required and must be stable.');
  }
  const now = options.now ?? Date.now;
  const sign = (encoded: string) =>
    createHmac('sha256', secret).update(encoded).digest('base64url');
  const encode = (payload: CursorPayload) => {
    const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString(
      'base64url',
    );
    return `${encoded}.${sign(encoded)}`;
  };
  const decode = (cursor: string, fingerprint: string): string => {
    if (typeof cursor !== 'string' || cursor.length > MAX_CURSOR_LENGTH) {
      throw new RestPageCursorError();
    }
    const [encoded, signature, extra] = cursor.split('.');
    if (!encoded || !signature || extra !== undefined) {
      throw new RestPageCursorError();
    }
    const expected = Buffer.from(sign(encoded));
    const actual = Buffer.from(signature);
    if (
      expected.length !== actual.length ||
      !timingSafeEqual(expected, actual)
    ) {
      throw new RestPageCursorError();
    }
    try {
      const payload = JSON.parse(
        Buffer.from(encoded, 'base64url').toString('utf8'),
      ) as Partial<CursorPayload>;
      if (
        payload.v !== 1 ||
        payload.fingerprint !== fingerprint ||
        typeof payload.afterKey !== 'string' ||
        payload.afterKey.length === 0
      ) {
        throw new RestPageCursorError();
      }
      return payload.afterKey;
    } catch (error) {
      if (error instanceof RestPageCursorError) throw error;
      throw new RestPageCursorError();
    }
  };

  return {
    paginate<T>(input: {
      data: readonly T[];
      limit: number;
      cursor?: string;
      fingerprint: string;
      truncated: boolean;
      keyOf: (item: T) => string;
    }): {
      data: T[];
      nextCursor: string | null;
      truncated: boolean;
      observedAt: string;
    } {
      if (
        !Number.isSafeInteger(input.limit) ||
        input.limit < 1 ||
        input.limit > 200
      ) {
        throw new RestPageCursorError();
      }
      const afterKey = input.cursor
        ? decode(input.cursor, input.fingerprint)
        : undefined;
      const sorted = [...input.data].sort((left, right) =>
        compare(input.keyOf(left), input.keyOf(right)),
      );
      for (let index = 1; index < sorted.length; index += 1) {
        if (input.keyOf(sorted[index - 1]!) === input.keyOf(sorted[index]!)) {
          throw new Error('REST live result contains duplicate pagination key');
        }
      }
      const remaining = afterKey
        ? sorted.filter((item) => compare(input.keyOf(item), afterKey) > 0)
        : sorted;
      const data = remaining.slice(0, input.limit);
      return {
        data,
        nextCursor:
          data.length > 0 && data.length < remaining.length
            ? encode({
                v: 1,
                fingerprint: input.fingerprint,
                afterKey: input.keyOf(data.at(-1)!),
              })
            : null,
        truncated: input.truncated,
        observedAt: new Date(now()).toISOString(),
      };
    },
  };
}
