import assert from 'node:assert/strict';
import test from 'node:test';
import { toMcpSourceVersionListing } from '../src/lib/tools/list-source-versions.js';

test('source-version metadata never exposes a component or immutable source URI', () => {
  const result = toMcpSourceVersionListing({
    object: { name: 'ZCL_SAFE', type: 'CLAS', packageName: 'ZPKG' },
    components: [
      {
        id: 'main',
        sourceUri: '/sap/bc/adt/oo/classes/zcl_safe/source/main',
        versionsUri: '/sap/bc/adt/oo/classes/zcl_safe/source/main/versions',
        versions: [
          {
            id: 'version-1',
            ordinal: 0,
            sourceUri: '/sap/bc/adt/oo/classes/zcl_safe/source/main/versions/1',
            transports: ['DEVK900001'],
          },
        ],
      },
    ],
  } as never);

  assert.ok(!JSON.stringify(result).includes('/sap/bc/adt/'));
  assert.deepEqual(result, {
    object: { name: 'ZCL_SAFE', type: 'CLAS', packageName: 'ZPKG' },
    components: [
      {
        id: 'main',
        versions: [
          {
            id: 'version-1',
            ordinal: 0,
            transports: ['DEVK900001'],
          },
        ],
      },
    ],
  });
});
