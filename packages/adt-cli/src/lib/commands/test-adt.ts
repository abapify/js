import { Command } from 'commander';
import { getAdtClientV2 } from '../utils/adt-client-v2';

/**
 * @deprecated Legacy test command - needs migration to v2 client
 * TODO: Remove or migrate this command
 */
export function createTestAdtCommand(): Command {
  const command = new Command('test-adt');

  command
    .description('Test ADT client connectivity')
    .action(async () => {
      console.log('🧪 Testing ADT Client connectivity...');

      try {
        // Just test that we can get an authenticated client
        await getAdtClientV2();
        console.log('✅ ADT Client initialized successfully');
        console.log('\n✅ ADT Client test completed!');
      } catch (error) {
        console.error('❌ Test failed:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  return command;
}
