import { Command } from 'commander';
import { adtClient } from '../../shared/clients';
import { AuthManager, ServiceKeyParser } from '@abapify/adt-client';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { input, password } from '@inquirer/prompts';
import {
  createComponentLogger,
  handleCommandError,
} from '../../utils/command-helpers';

export const loginCommand = new Command('login')
  .description('Login to ADT using BTP service key or interactive credentials')
  .option('-f, --file <path>', 'Service key file path (for OAuth/BTP authentication)')
  .option('--insecure', 'Allow insecure SSL connections (ignore certificate errors)')
  .action(async (options, command) => {
    try {
      const logger = createComponentLogger(command, 'auth');
      const authManager = new AuthManager(logger);

      // File-based OAuth login
      if (options.file) {
        const filePath = resolve(options.file);
        if (!existsSync(filePath)) {
          console.error(`❌ Service key file not found: ${filePath}`);
          process.exit(1);
        }

        // Parse service key and create connection config
        const serviceKeyJson = readFileSync(filePath, 'utf8');
        const serviceKey = ServiceKeyParser.parse(serviceKeyJson);

        console.log(`🔧 System: ${serviceKey.systemid}`);

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
        return;
      }

      // Interactive basic auth login
      console.log('🔐 Interactive Login\n');

      try {
        let url = await input({
          message: 'SAP System URL (e.g., https://host:port or host:port)',
          validate: (value) => {
            if (!value) return 'URL is required';
            // Try to parse as URL, if it fails, try adding https://
            try {
              new URL(value.includes('://') ? value : `https://${value}`);
              return true;
            } catch {
              return 'Please enter a valid URL or hostname';
            }
          },
        });

        // Normalize URL by adding https:// if protocol is missing
        if (!url.includes('://')) {
          url = `https://${url}`;
        }

        const client = await input({
          message: 'Client (optional, e.g., 100)',
          default: '',
        });

        const username = await input({
          message: 'Username',
          validate: (value) => (value ? true : 'Username is required'),
        });

        const userPassword = await password({
          message: 'Password',
          validate: (value) => (value ? true : 'Password is required'),
        });

        // Set insecure SSL flag if requested
        if (options.insecure) {
          process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
          console.log('⚠️  SSL certificate verification disabled');
        }

        // Perform basic auth login
        await authManager.loginBasic(
          username,
          userPassword,
          url,
          client || undefined,
          options.insecure
        );

        console.log('\n✅ Successfully logged in!');
        console.log(`🌐 Host: ${url}`);
        console.log(`👤 User: ${username}`);
        if (client) {
          console.log(`🔧 Client: ${client}`);
        }
        if (options.insecure) {
          console.log('⚠️  Remember: SSL verification is disabled!');
        }
      } catch (error) {
        // Handle user cancellation (Ctrl+C)
        if ((error as any).name === 'ExitPromptError') {
          console.log('\n❌ Login cancelled');
          process.exit(1);
        }
        throw error;
      }
    } catch (error) {
      handleCommandError(error, 'Login');
    }
  });
