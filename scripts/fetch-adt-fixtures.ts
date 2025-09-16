#!/usr/bin/env npx tsx

/**
 * Temporary script to fetch real ADT XML fixtures for testing
 * This will help us create realistic mock responses
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { AdtClient } from '@abapify/adt-client';

interface FixtureConfig {
  name: string;
  endpoint: string;
  method: 'GET' | 'POST';
  body?: any;
  description: string;
}

// Define the fixtures we need for transport import testing
const FIXTURES: FixtureConfig[] = [
  {
    name: 'discovery',
    endpoint: '/sap/bc/adt/discovery',
    method: 'GET',
    description: 'ADT service discovery document',
  },
  {
    name: 'transport-list',
    endpoint: '/sap/bc/adt/cts/transports',
    method: 'GET',
    description: 'List of transport requests',
  },
  {
    name: 'transport-details',
    endpoint: '/sap/bc/adt/cts/transports/TRLK907362', // Example transport
    method: 'GET',
    description: 'Transport request details with objects',
  },
  {
    name: 'class-zcl-test',
    endpoint: '/sap/bc/adt/oo/classes/zcl_test_class',
    method: 'GET',
    description: 'ABAP class definition',
  },
  {
    name: 'interface-zif-test',
    endpoint: '/sap/bc/adt/oo/interfaces/zif_test_interface',
    method: 'GET',
    description: 'ABAP interface definition',
  },
  {
    name: 'package-ztest',
    endpoint: '/sap/bc/adt/packages/ztest_pkg',
    method: 'GET',
    description: 'Package definition',
  },
];

async function fetchFixtures() {
  console.log('🔍 Fetching ADT XML fixtures from real endpoints...');

  // Create fixtures directory
  const fixturesDir = join(process.cwd(), 'tmp', 'adt-fixtures');
  mkdirSync(fixturesDir, { recursive: true });

  try {
    // Initialize ADT client (assumes you have auth configured)
    const { createAdtClient } = await import('@abapify/adt-client');
    const client = createAdtClient();

    for (const fixture of FIXTURES) {
      console.log(`📥 Fetching ${fixture.name}: ${fixture.description}`);

      try {
        let response: string;

        if (fixture.method === 'GET') {
          response = await client.get(fixture.endpoint);
        } else {
          response = await client.post(fixture.endpoint, fixture.body || '');
        }

        // Save raw XML response
        const filename = `${fixture.name}.xml`;
        const filepath = join(fixturesDir, filename);
        writeFileSync(filepath, response, 'utf8');

        console.log(`✅ Saved ${filename} (${response.length} bytes)`);

        // Also save metadata
        const metaFilename = `${fixture.name}.meta.json`;
        const metaFilepath = join(fixturesDir, metaFilename);
        const metadata = {
          name: fixture.name,
          endpoint: fixture.endpoint,
          method: fixture.method,
          description: fixture.description,
          fetchedAt: new Date().toISOString(),
          size: response.length,
        };
        writeFileSync(metaFilepath, JSON.stringify(metadata, null, 2), 'utf8');
      } catch (error) {
        console.warn(
          `⚠️  Failed to fetch ${fixture.name}: ${
            error instanceof Error ? error.message : String(error)
          }`
        );

        // Create placeholder for missing fixtures
        const placeholderPath = join(
          fixturesDir,
          `${fixture.name}.placeholder.txt`
        );
        writeFileSync(
          placeholderPath,
          `Fixture not available: ${
            error instanceof Error ? error.message : String(error)
          }`,
          'utf8'
        );
      }
    }

    console.log(`\n✅ Fixtures saved to: ${fixturesDir}`);
    console.log('📝 Next steps:');
    console.log('  1. Review the XML fixtures');
    console.log('  2. Create mock ADT client');
    console.log('  3. Build e2e integration tests');
  } catch (error) {
    console.error(
      '❌ Failed to initialize ADT client:',
      error instanceof Error ? error.message : String(error)
    );
    console.log('\n💡 Make sure you have:');
    console.log('  1. Valid authentication configured');
    console.log('  2. Network access to SAP system');
    console.log('  3. Run: adt auth login --file your-service-key.json');
  }
}

// Run the script
if (require.main === module) {
  fetchFixtures().catch(console.error);
}

export { fetchFixtures, FIXTURES };
