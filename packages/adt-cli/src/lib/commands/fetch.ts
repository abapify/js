import { Command } from 'commander';
import { writeFileSync } from 'fs';
import { createAdtClient } from '@abapify/adt-client-v2';
import { AuthManager } from '@abapify/adt-client';

export const fetchCommand = new Command('fetch')
  .description('Fetch a URL with authentication (like curl but authenticated)')
  .argument('<url>', 'URL path to fetch (e.g., /sap/bc/adt/core/http/sessions)')
  .option('-X, --method <method>', 'HTTP method', 'GET')
  .option('-H, --header <header>', 'Add header (can be used multiple times)', collect, [])
  .option('-d, --data <data>', 'Request body (for POST/PUT)')
  .option('-o, --output <file>', 'Save response to file')
  .action(async (url: string, options) => {
    try {
      // Load session from v1 auth manager
      const authManager = new AuthManager();
      const session = authManager.loadSession();

      if (!session || !session.basicAuth) {
        console.error('❌ Not authenticated');
        console.error('💡 Run "npx adt auth login" to authenticate first');
        process.exit(1);
      }

      // Create v2 client
      const adtClient = createAdtClient({
        baseUrl: session.basicAuth.host,
        username: session.basicAuth.username,
        password: session.basicAuth.password,
        client: session.basicAuth.client,
      });

      // Parse custom headers
      const customHeaders: Record<string, string> = {};
      for (const header of options.header) {
        const [key, ...valueParts] = header.split(':');
        if (key && valueParts.length > 0) {
          customHeaders[key.trim()] = valueParts.join(':').trim();
        }
      }

      const method = options.method.toUpperCase() as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

      console.log(`🔄 ${method} ${url}...\n`);

      // Use the client's fetch utility method
      const response = await adtClient.fetch(url, {
        method,
        headers: customHeaders,
        body: options.data,
      });

      // Display response
      if (options.output) {
        const content = typeof response === 'string' ? response : JSON.stringify(response, null, 2);
        writeFileSync(options.output, content);
        console.log(`💾 Response saved to: ${options.output}`);
      } else {
        // Display response (string or formatted JSON)
        if (typeof response === 'string') {
          console.log(response);
        } else {
          console.log(JSON.stringify(response, null, 2));
        }
      }

      console.log('\n✅ Done!');
    } catch (error) {
      console.error(
        '❌ Request failed:',
        error instanceof Error ? error.message : String(error)
      );
      if (error instanceof Error && error.stack) {
        console.error('\nStack trace:', error.stack);
      }
      process.exit(1);
    }
  });

// Helper to collect repeated options
function collect(value: string, previous: string[]) {
  return previous.concat([value]);
}
