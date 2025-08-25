import { Command } from 'commander';
import { authManager } from '../../shared/clients';

export const logoutCommand = new Command('logout')
  .description('Logout and clear authentication session')
  .action(async () => {
    try {
      authManager.logout();
      console.log('✅ Successfully logged out!');
    } catch (error) {
      console.error(
        '❌ Logout failed:',
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }
  });
