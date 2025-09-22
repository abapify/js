import { Command } from 'commander';
import { adtClient } from '../../shared/clients';
import { AuthManager, ServiceKeyParser } from '@abapify/adt-client';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import {
  createComponentLogger,
  handleCommandError,
} from '../../utils/command-helpers';

export const loginCommand = new Command('login')
  .description('Login to ADT using BTP service key')
  .option('-f, --file <path>', 'Service key file path')
  .action(async (options, command) => {
    try {
      if (!options.file) {
        console.error('❌ Service key file is required. Use --file option.');
        process.exit(1);
      }

      const filePath = resolve(options.file);
      if (!existsSync(filePath)) {
        console.error(`❌ Service key file not found: ${filePath}`);
        process.exit(1);
      }

      // Parse service key and create connection config
      const serviceKeyJson = readFileSync(filePath, 'utf8');
      const serviceKey = ServiceKeyParser.parse(serviceKeyJson);

      console.log(`🔧 System: ${serviceKey.systemid}`);

      // Create logger for auth operations
      const logger = createComponentLogger(command, 'auth');
      const authManager = new AuthManager(logger);
      await authManager.login(options.file);

      // After successful login, connect the ADT client
      const session = authManager.getAuthenticatedSession();
      const connectionConfig = {
        baseUrl: session.serviceKey.endpoints['abap'] || session.serviceKey.url,
        client: session.serviceKey.systemid,
        username: '', // OAuth flow doesn't use username/password
        password: '', // OAuth flow doesn't use username/password
      };

      await adtClient.connect(connectionConfig);
      console.log('✅ ADT Client connected successfully!');
    } catch (error) {
      handleCommandError(error, 'Login');
    }
  });
