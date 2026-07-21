/**
 * ADT Repository source-history contracts.
 *
 * Both operations follow URIs supplied by SAP ADT responses. They deliberately
 * do not construct version paths from an object URI.
 */

import { contract, http } from '../../base';
import { atomFeed } from '../../schemas';

const ADT_ORIGIN = 'https://adt.invalid';
const ADT_PATH = '/sap/bc/adt';
const INVALID_URI_MESSAGE = 'Expected an ADT-relative URI under /sap/bc/adt';

/**
 * Guard an opaque ADT URI supplied by SAP before we turn it into an
 * authenticated request.  Other contracts which accept SAP-discovered URIs
 * share this boundary rather than reimplementing a slightly different URL
 * policy.
 */
export function assertAdtRelativeUri(uri: string): void {
  let parsed: URL;

  try {
    parsed = new URL(uri, ADT_ORIGIN);
  } catch {
    throw new TypeError(INVALID_URI_MESSAGE);
  }

  const isRootRelative = uri.startsWith('/') && !uri.startsWith('//');
  const isAdtPath =
    parsed.pathname === ADT_PATH || parsed.pathname.startsWith(`${ADT_PATH}/`);

  if (
    uri !== uri.trim() ||
    !isRootRelative ||
    parsed.origin !== ADT_ORIGIN ||
    !isAdtPath ||
    parsed.hash
  ) {
    throw new TypeError(INVALID_URI_MESSAGE);
  }
}

export const sourceversionsContract = contract({
  list: (params: { versionsUri: string }) => {
    assertAdtRelativeUri(params.versionsUri);

    return http.get(params.versionsUri, {
      responses: { 200: atomFeed },
      headers: { Accept: 'application/atom+xml;type=feed' },
    });
  },

  get: (params: { sourceUri: string }) => {
    assertAdtRelativeUri(params.sourceUri);

    return http.get(params.sourceUri, {
      responses: { 200: undefined as unknown as string },
      headers: { Accept: 'text/plain' },
    });
  },
});

export type SourceversionsContract = typeof sourceversionsContract;
