import { Command } from 'commander';
import { input, password, select } from '@inquirer/prompts';
import {
  setDefaultSid,
  getDefaultSid,
  listAvailableSids,
  saveAuthSession,
  type AuthSession,
} from '../../utils/auth';
import { handleCommandError } from '../../utils/command-helpers';
import { listDestinations, getDestination, type Destination } from '../../utils/destinations';

interface DestinationOptions {
  url: string;
  [key: string]: unknown;
}

interface DestinationChoice {
  name: string;
  value: { sid: string; destination: Destination | null };
  description: string;
}

export const loginCommand = new Command('login')
  .description('Login to ADT - supports Basic Auth and Browser-based SSO (Puppeteer)')
  .option('--insecure', 'Allow insecure SSL connections (ignore certificate errors)')
  .option('--sid <sid>', 'System ID (e.g., BHF, S0D) - saves auth to separate file')
  .action(async (options) => {
    try {
      console.log('🔐 Interactive Login\n');

      // Check if we have configured destinations
      const configuredDestinations = await listDestinations();
      
      let authMethod: string;
      let url: string;
      let sid: string = '';
      let destinationOptions: DestinationOptions | undefined;

      if (configuredDestinations.length > 0) {
        // Config-driven flow: select destination, auth method comes from config
        const destinationChoices: DestinationChoice[] = [];
        
        for (const destName of configuredDestinations) {
          const dest = await getDestination(destName);
          if (dest) {
            const opts = dest.options as DestinationOptions;
            destinationChoices.push({
              name: `${destName} (${opts.url}) [${dest.type}]`,
              value: { sid: destName, destination: dest },
              description: `${dest.type} authentication`,
            });
          }
        }

        // Add manual option
        destinationChoices.push({
          name: '➕ Manual configuration...',
          value: { sid: '', destination: null as unknown as Destination },
          description: 'Enter URL and auth method manually',
        });

        const selected = await select({
          message: 'Select destination',
          choices: destinationChoices,
        });

        if (selected.destination) {
          // Use config-driven auth
          sid = selected.sid;
          destinationOptions = selected.destination.options as DestinationOptions;
          url = destinationOptions.url;
          authMethod = selected.destination.type;
          console.log(`\n📋 Using ${authMethod} authentication for ${sid}\n`);
        } else {
          // Fall through to manual flow
          const manualResult = await promptManualConfig();
          authMethod = manualResult.authMethod;
          url = manualResult.url;
        }
      } else {
        // No config - use manual flow
        const manualResult = await promptManualConfig();
        authMethod = manualResult.authMethod;
        url = manualResult.url;
      }

      // Step 3: Collect method-specific credentials and login
      if (authMethod === 'puppeteer' || authMethod === 'browser') {
        // Dynamically load puppeteer plugin (optional dependency)
        let mod: typeof import('@abapify/adt-puppeteer');
        try {
          mod = await import('@abapify/adt-puppeteer');
        } catch {
          console.error('❌ @abapify/adt-puppeteer is not installed.');
          console.error('   Install it with: bun add @abapify/adt-puppeteer');
          process.exit(1);
        }

        // Puppeteer browser authentication via plugin
        // Pass full destination options (includes requiredCookies, timeout, etc.)
        const credentials = await mod.puppeteerAuth.authenticate(destinationOptions ?? { url });

        // SID comes from destination name (config-driven) or prompt
        if (!sid) {
          sid = options.sid?.toUpperCase() || (await promptForSid());
        }

        // Use plugin's helper to convert credentials to cookie header
        const cookieHeader = mod.toCookieHeader(credentials);

        // Create auth session with new generic format
        const session: AuthSession = {
          sid,
          host: url,
          auth: {
            method: 'cookie',
            plugin: '@abapify/adt-puppeteer',  // For refresh
            credentials: {
              cookies: cookieHeader,
              expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours
            },
          },
        };

        // Save session
        saveAuthSession(session);

        console.log(`\n✅ Successfully logged in via browser!`);
        console.log(`🌐 Host: ${url}`);
        console.log(`🍪 Session captured via Puppeteer`);
      } else if (authMethod === 'basic') {
        // Ask for client only for Basic Auth
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
          // process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Commented out for testing proper cert validation
          console.log('⚠️  SSL certificate verification disabled\n');
        }

        // Get or prompt for SID
        sid = options.sid?.toUpperCase() || (await promptForSid());

        // Create session with new generic format
        const session: AuthSession = {
          sid,
          host: url,
          client: client || undefined,
          auth: {
            method: 'basic',
            credentials: {
              username,
              password: userPassword,
            },
          },
        };

        // Save session
        saveAuthSession(session);

        console.log(`\n✅ Successfully logged in!`);
        console.log(`🌐 Host: ${url}`);
        console.log(`👤 User: ${username}`);
        if (client) {
          console.log(`🔧 Client: ${client}`);
        }
        if (options.insecure) {
          console.log('⚠️  Remember: SSL verification is disabled!');
        }
      }

      // Set as default if it's the first system
      const availableSids = listAvailableSids();
      if (availableSids.length === 1 || !getDefaultSid()) {
        setDefaultSid(sid);
        console.log(`💡 ${sid} set as default system`);
      } else {
        console.log(`\n💡 Run "npx adt auth set-default ${sid}" to make it the default system`);
      }
    } catch (error) {
      // Handle user cancellation (Ctrl+C)
      if ((error as any).name === 'ExitPromptError') {
        console.log('\n❌ Login cancelled');
        process.exit(1);
      }
      handleCommandError(error, 'Login');
    }
  });

async function promptForSid(): Promise<string> {
  const sid = await input({
    message: 'System ID (e.g., BHF, S0D)',
    validate: (value) => {
      if (!value) return 'SID is required';
      if (!/^[A-Z0-9]{3}$/.test(value.toUpperCase())) {
        return 'SID must be 3 alphanumeric characters (e.g., BHF, S0D)';
      }
      return true;
    },
  });
  return sid.toUpperCase();
}

/**
 * Prompt for manual configuration (no adt.config.ts)
 */
async function promptManualConfig(): Promise<{ authMethod: string; url: string }> {
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
        name: 'Browser SSO - Opens browser for SSO login',
        value: 'browser',
        description: 'SSO via browser automation (Okta, etc.)',
      },
    ],
  });

  console.log('');

  // Step 2: Collect URL
  let url = await input({
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

  return { authMethod, url };
}
