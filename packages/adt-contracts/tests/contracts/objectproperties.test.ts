import { describe, expect, it } from 'vitest';
import * as contracts from '../../src';
import {
  adtContract,
  objectPropertiesContract,
  repositoryContract,
} from '../../src';
import { objectProperties } from '../../src/schemas';

const objectUri = '/sap/bc/adt/programs/programs/ztest_gcts_program';

describe('Repository object properties contract', () => {
  it('exports the contract through the information-system and root trees', () => {
    expect(contracts.objectPropertiesContract).toBe(objectPropertiesContract);
    expect(repositoryContract.informationsystem.objectProperties).toBe(
      objectPropertiesContract,
    );
    expect(adtContract.repository.informationsystem.objectProperties).toBe(
      objectPropertiesContract,
    );
  });

  it('requests generic object facets from a SAP-provided ADT URI', () => {
    const descriptor = objectPropertiesContract.values({
      uri: objectUri,
      facets: ['package', 'appl', 'package'],
    });

    expect(descriptor.method).toBe('GET');
    expect(descriptor.path).toBe(
      '/sap/bc/adt/repository/informationsystem/objectproperties/values',
    );
    expect(descriptor.query).toEqual({
      uri: objectUri,
      facet: ['package', 'appl'],
    });
    expect(descriptor.headers).toEqual({
      Accept: 'application/vnd.sap.adt.repository.objproperties.result.v1+xml',
    });
    expect(descriptor.responses[200]).toBe(objectProperties);
  });

  it.each([
    'https://sap.example.test/sap/bc/adt/programs/programs/ztest',
    '//attacker.example.test/sap/bc/adt/programs/programs/ztest',
    '/sap/public/ztest',
    'sap/bc/adt/programs/programs/ztest',
    '/sap/bc/adt/../public/ztest',
  ])('rejects an unsafe object URI before making a descriptor: %s', (uri) => {
    expect(() => objectPropertiesContract.values({ uri })).toThrowError(
      'Expected an ADT-relative URI under /sap/bc/adt',
    );
  });
});
