import { describe, expect, it } from 'vitest';
import * as contracts from '../../src';
import {
  adtContract,
  repositoryContract,
  sourceversionsContract,
} from '../../src';
import { atomFeed } from '../../src/schemas';

const versionsUri =
  '/sap/bc/adt/programs/programs/z_history/source/main/versions';
const sourceUri =
  '/sap/bc/adt/programs/programs/z_history/source/main/versions/immutable-content';

describe('Repository source versions contract', () => {
  it('exports the contract through the repository and root contract trees', () => {
    expect(contracts.sourceversionsContract).toBe(sourceversionsContract);
    expect(repositoryContract.sourceversions).toBe(sourceversionsContract);
    expect(adtContract.repository.sourceversions).toBe(sourceversionsContract);
  });

  it('lists the Atom version feed from the supplied ADT-relative URI', () => {
    const descriptor = sourceversionsContract.list({ versionsUri });

    expect(descriptor.method).toBe('GET');
    expect(descriptor.path).toBe(versionsUri);
    expect(descriptor.headers).toEqual({
      Accept: 'application/atom+xml;type=feed',
    });
    expect(descriptor.responses[200]).toBe(atomFeed);
  });

  it('gets plain source from the supplied immutable ADT-relative URI', () => {
    const descriptor = sourceversionsContract.get({ sourceUri });

    expect(descriptor.method).toBe('GET');
    expect(descriptor.path).toBe(sourceUri);
    expect(descriptor.headers).toEqual({ Accept: 'text/plain' });
    expect(descriptor.responses).toHaveProperty('200');
  });

  const unsafeUris = [
    ['absolute', 'https://sap.example.test/sap/bc/adt/source/versions'],
    ['cross-origin', '//attacker.example.test/sap/bc/adt/source/versions'],
    ['non-ADT', '/sap/public/source/versions'],
    ['non-root-relative', 'sap/bc/adt/source/versions'],
    ['path-traversing', '/sap/bc/adt/../public/source/versions'],
  ] as const;

  describe.each([
    {
      name: 'list',
      call: (uri: string) => sourceversionsContract.list({ versionsUri: uri }),
    },
    {
      name: 'get',
      call: (uri: string) => sourceversionsContract.get({ sourceUri: uri }),
    },
  ])('$name URI validation', ({ call }) => {
    it.each(unsafeUris)('rejects a %s URI before descriptor use', (_, uri) => {
      expect(() => call(uri)).toThrowError(
        'Expected an ADT-relative URI under /sap/bc/adt',
      );
    });
  });
});
