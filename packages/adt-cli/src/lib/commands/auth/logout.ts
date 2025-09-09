import { Command } from 'commander';
import { AuthManager } from '@abapify/adt-client';
import {
  createComponentLogger,
  handleCommandError,
} from '../../utils/command-helpers.js';

export const logoutCommand = new Command('logout')
  .description('Logout from ADT')
  .action(async (options, command) => {
    try {
      const logger = createComponentLogger(command, 'auth');
      const authManager = new AuthManager(logger);
      authManager.logout();

      console.log('✅ Successfully logged out!');
    } catch (error) {
      handleCommandError(error, 'Logout');
    }
  });
