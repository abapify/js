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
    // Example 1: Get complete class
    console.log('\n=== Example 1: Get Complete Class ===');
    const classObj = await client.getClass(className);
    console.log('Class name:', classObj.metadata.name);
    console.log('Description:', classObj.metadata.description);
    console.log('Package:', classObj.metadata.packageName);
    console.log('Main source length:', classObj.includes.main?.length || 0);
    console.log('Has definitions:', !!classObj.includes.definitions);
    console.log('Has implementations:', !!classObj.includes.implementations);

    // Example 2: Get metadata only
    console.log('\n=== Example 2: Get Metadata Only ===');
    const metadata = await client.getMetadata(className);
    console.log('Visibility:', metadata.visibility);
    console.log('Final:', metadata.final);
    console.log('Abstract:', metadata.abstract);
    console.log('Created by:', metadata.createdBy);
    console.log('Created at:', metadata.createdAt);

    // Example 3: Get specific include
    console.log('\n=== Example 3: Get Specific Include ===');
    const mainSource = await client.getInclude(className, 'main');
    console.log('Main source preview:', mainSource.substring(0, 200));

    // Example 4: Create a new class
    console.log('\n=== Example 4: Create New Class ===');
    const newClassName = 'ZCL_TEST_NEW';
    try {
      await client.createClass(newClassName, {
        description: 'Test class created by adt-client-v2',
        packageName: '$TMP',
        visibility: 'public',
        final: false,
        abstract: false,
      });
      console.log(`Class ${newClassName} created successfully`);

      // Clean up - delete the test class
      await client.deleteClass(newClassName);
      console.log(`Class ${newClassName} deleted successfully`);
    } catch (error) {
      console.error('Create/delete failed:', error);
    }

    // Example 5: Lock, edit, unlock pattern
    console.log('\n=== Example 5: Lock, Edit, Unlock ===');
    let lockHandle: string | undefined;
    try {
      // Lock the class
      lockHandle = await client.lockClass(className);
      console.log('Class locked with handle:', lockHandle);

      // Get current source
      const currentSource = await client.getInclude(className, 'main');

      // Modify source (example: add a comment)
      const modifiedSource = `* Modified by adt-client-v2\n${currentSource}`;

      // Update source
      await client.updateMainSource(className, modifiedSource);
      console.log('Source updated successfully');

      // Restore original source
      await client.updateMainSource(className, currentSource);
      console.log('Source restored to original');
    } finally {
      // Always unlock
      if (lockHandle) {
        await client.unlockClass(className, lockHandle);
        console.log('Class unlocked');
      }
    }

    // Example 6: Get all includes
    console.log('\n=== Example 6: Get All Includes ===');
    const includes = await client.getIncludes(className);
    console.log('Available includes:');
    Object.entries(includes).forEach(([type, content]) => {
      if (content) {
        console.log(`  - ${type}: ${content.length} characters`);
      }
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run demo if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demo().catch(console.error);
}

export { demo };
