import { Command } from 'commander';
import { authManager } from '../../shared/clients';

export const loginCommand = new Command('login')
  .description('Login to ADT using BTP service key')
  .option('-f, --file <path>', 'Service key file path')
  .action(async (options) => {
    try {
      if (!options.file) {
        console.error('❌ Service key file is required. Use --file option.');
        process.exit(1);
      }

      await authManager.login(options.file);
    } catch (error) {
      console.error(
        '❌ Login failed:',
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }
  });
