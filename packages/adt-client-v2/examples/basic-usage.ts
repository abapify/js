/**
 * Basic usage example for @abapify/adt-client-v2
 *
 * This example demonstrates the core functionality of the ADT client.
 */

import { createAdtClient } from '../src/index';

async function demo() {
  // Create client with connection config
  const client = createAdtClient({
    baseUrl: 'https://your-sap-system.com:8000',
    username: 'YOUR_USER',
    password: 'YOUR_PASS',
    client: '100',
    language: 'EN',
  });

  const className = 'ZCL_EXAMPLE';

  try {
    // Example 1: Discover ADT services
    console.log('\n=== Example 1: Discover ADT Services ===');
    const discovery = await client.discovery.getDiscovery();
    console.log(`Found ${discovery.workspace.length} workspaces`);
    for (const workspace of discovery.workspace) {
      console.log(
        `  - ${workspace.title}: ${workspace.collection.length} collections`
      );
    }

    // Example 2: Get class metadata
    console.log('\n=== Example 2: Get Class Metadata ===');
    const metadata = await client.classes.getMetadata(className);
    console.log('Class name:', metadata.name);
    console.log('Description:', metadata.description);
    console.log('Package:', metadata.packageName);
    console.log('Category:', metadata.category);
    console.log('Visibility:', metadata.visibility);
    console.log('Final:', metadata.final);
    console.log('Abstract:', metadata.abstract);

    // Example 3: Get class source code
    console.log('\n=== Example 3: Get Class Source ===');
    const mainSource = await client.classes.getMainSource(className);
    console.log('Main source length:', mainSource.length);
    console.log('Preview:', mainSource.substring(0, 100));

    const definitions = await client.classes.getDefinitions(className);
    console.log('Definitions length:', definitions.length);

    const implementations = await client.classes.getImplementations(className);
    console.log('Implementations length:', implementations.length);

    // Example 4: Update class source
    console.log('\n=== Example 4: Update Class Source ===');
    const currentSource = await client.classes.getMainSource(className);
    const modifiedSource = `* Modified by adt-client-v2\n${currentSource}`;

    await client.classes.updateMainSource(className, modifiedSource);
    console.log('Source updated successfully');

    // Restore original
    await client.classes.updateMainSource(className, currentSource);
    console.log('Source restored to original');

    // Note: Create/delete operations require full ClassXml structure
    // See ClassSchema for complete type definition
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run demo if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demo().catch(console.error);
}

export { demo };
