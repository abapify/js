import { Command } from 'commander';
import { getAdtClient } from '../shared/clients.js';

export function createTestAdtCommand(): Command {
  const command = new Command('test-adt');

  command
    .description('Test ADT client logging functionality')
    .option('-n, --name <name>', 'Name for test operation', 'TestUser')
    .action(async (options, cmd) => {
      // Get global options from the root program
      let rootCmd = cmd.parent || cmd;
      while (rootCmd.parent) {
        rootCmd = rootCmd.parent;
      }

      console.log('🧪 Testing ADT Client logging...');

      // Get ADT client instance (should have our CLI logger injected)
      const adtClient = getAdtClient();

      // Test basic operations
      console.log('\n📝 Running basic test operation...');
      const result = await adtClient.test.performTestOperation(options.name);
      console.log(`✅ Result: ${result}`);

      // Test complex operation with sub-loggers
      console.log('\n🔧 Running complex test operation...');
      await adtClient.test.performComplexOperation();

      console.log('\n✅ ADT Client logging test completed!');
    });

  return command;
}
