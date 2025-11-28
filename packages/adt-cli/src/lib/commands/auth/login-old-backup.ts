import { Command } from 'commander';
import { adtClient } from '../../shared/clients';
import { AuthManager, ServiceKeyParser } from '@abapify/adt-client';
import { readFileSync, existsSync, writeFileSync, copyFileSync } from 'fs';
import { resolve } from 'path';
import { input, password, select } from '@inquirer/prompts';
import {
  createComponentLogger,
  handleCommandError,
} from '../../utils/command-helpers';
import {
  setDefaultSid,
  getDefaultSid,
  listAvailableSids,
  saveAuthSession,
  type AuthSession,
} from '../../utils/auth';

export const loginCommand = new Command('login')
  .description('Login to ADT using BTP service key or interactive credentials')
  .option('-f, --file <path>', 'Service key file path (for OAuth/BTP authentication)')
  .option('--insecure', 'Allow insecure SSL connections (ignore certificate errors)')
  .option('--sid <sid>', 'System ID (e.g., BHF, S0D) - saves auth to separate file')
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

        // Save to SID-specific file
        const sid = options.sid || serviceKey.systemid.toUpperCase();
        const v1Session = authManager.loadSession();
        if (v1Session) {
          saveAuthSession(v1Session as AuthSession, sid);

          // Set as default if it's the first system
          const availableSids = listAvailableSids();
          if (availableSids.length === 1 || !getDefaultSid()) {
            setDefaultSid(sid);
            console.log(`✅ ADT Client connected successfully! (${sid} set as default)`);
          } else {
            console.log(`✅ ADT Client connected successfully! (${sid})`);
            console.log(`💡 Run "npx adt auth set-default ${sid}" to make it the default system`);
          }
        } else {
          console.log('✅ ADT Client connected successfully!');
        }

        return;
      }

      // Interactive login
      console.log('🔐 Interactive Login\n');

      try {
        // Step 1: Choose authentication method
        const authMethod = await select({
          message: 'Authentication method',
          choices: [
            {
              name: 'Basic Authentication (username/password)',
              value: 'basic',
              description: 'Standard username and password authentication',
            },
            {
              name: 'SAP Secure Login Client (SLC)',
              value: 'slc',
              description: 'Certificate-based authentication via SLC Web Adapter',
            },
            {
              name: 'OAuth/BTP Service Key',
              value: 'oauth',
              description: 'OAuth authentication using BTP service key file',
            },
          ],
        });

        console.log('');

        // Step 2: Collect method-specific credentials
        let url: string;
        let client: string;

        if (authMethod === 'basic') {
          // Basic Authentication flow
          url = await input({
            message: 'SAP System URL (e.g., https://host:port or host:port)',
            validate: (value) => {
              if (!value) return 'URL is required';
              try {
                new URL(value.includes('://') ? value : `https://${value}`);
                return true;
              } catch {
                return 'Please enter a valid URL or hostname';
              }
            },
          });

          // Normalize URL
          if (!url.includes('://')) {
            url = `https://${url}`;
          }

          client = await input({
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
        } else if (authMethod === 'slc') {
          // SLC Authentication flow
          url = await input({
            message: 'SAP System URL (e.g., https://host:port or host:port)',
            validate: (value) => {
              if (!value) return 'URL is required';
              try {
                new URL(value.includes('://') ? value : `https://${value}`);
                return true;
              } catch {
                return 'Please enter a valid URL or hostname';
              }
            },
          });

          // Normalize URL
          if (!url.includes('://')) {
            url = `https://${url}`;
          }

          client = await input({
            message: 'Client (optional, e.g., 100)',
            default: '',
          });

          const slcPort = await input({
            message: 'SLC Web Adapter Port',
            default: '3128',
            validate: (value) => {
              const port = parseInt(value);
              if (isNaN(port) || port < 1 || port > 65535) {
                return 'Please enter a valid port number (1-65535)';
              }
              return true;
            },
          });

          console.log('\n🔄 Testing SLC connection...');
          console.log('💡 Make sure SAP Secure Login Client is running with an active Web Adapter profile\n');

          // TODO: Implement SLC login using new @abapify/adt-auth package
          console.error('❌ SLC authentication not yet implemented');
          console.error('💡 Coming soon! For now, please use Basic Authentication');
          process.exit(1);
        } else if (authMethod === 'oauth') {
          // OAuth flow - redirect to file-based login
          console.log('\n💡 OAuth authentication requires a service key file');
          console.log('Please use: npx adt auth login --file <path-to-service-key.json>\n');
          process.exit(0);
        } else {
          console.error(`❌ Unknown authentication method: ${authMethod}`);
          process.exit(1);
        }

        // Save to SID-specific file if --sid provided
        let sid: string | undefined;
        if (options.sid) {
          sid = options.sid.toUpperCase();
        } else {
          // Prompt for SID
          try {
            sid = await input({
              message: 'System ID (e.g., BHF, S0D) - optional, press Enter to skip',
              validate: (value) => {
                if (!value) return true; // Allow empty
                if (!/^[A-Z0-9]{3}$/.test(value.toUpperCase())) {
                  return 'SID must be 3 alphanumeric characters (e.g., BHF, S0D)';
                }
                return true;
              },
            });
            if (sid) {
              sid = sid.toUpperCase();
            }
          } catch (error) {
            // User cancelled prompt, continue without SID
          }
        }

        // Load session from v1 AuthManager and save to SID-specific file
        if (sid) {
          const v1Session = authManager.loadSession();
          if (v1Session) {
            saveAuthSession(v1Session as AuthSession, sid);

            // Set as default if it's the first system
            const availableSids = listAvailableSids();
            if (availableSids.length === 1 || !getDefaultSid()) {
              setDefaultSid(sid);
              console.log(`\n✅ Successfully logged in! (${sid} set as default)`);
            } else {
              console.log(`\n✅ Successfully logged in! (${sid})`);
              console.log(`💡 Run "npx adt auth set-default ${sid}" to make it the default system`);
            }
          } else {
            console.log('\n✅ Successfully logged in!');
          }
        } else {
          console.log('\n✅ Successfully logged in!');
        }

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
