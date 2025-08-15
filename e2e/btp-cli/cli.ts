#!/usr/bin/env -S npx tsx

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Command } from 'commander';
import {
  ServiceKeyParser,
  fetchOAuthToken,
} from '@abapify/btp-service-key-parser';

const program = new Command();

program
  .name('btp')
  .description('BTP CLI tool for managing SAP BTP services')
  .version('1.0.0');

program
  .command('token')
  .description('Fetch OAuth token from BTP service key')
  .requiredOption('-f, --file <path>', 'Path to service key JSON file')
  .option('-q, --quiet', 'Quiet mode - only output the token')
  .option('-j, --json', 'Output token information as JSON')
  .action(async (options) => {
    const filePath = resolve(options.file);

    try {
      // Read and parse service key
      const serviceKeyJson = readFileSync(filePath, 'utf8');
      const serviceKey = ServiceKeyParser.parse(serviceKeyJson);

      if (!options.quiet) {
        console.log(`📄 Service Key loaded from: $e2e/btp-cli/cli.ts`);
        console.log(`🔧 System ID: ${serviceKey.systemid}`);
        console.log(
          `🌐 ABAP Endpoint: ${serviceKey.endpoints['abap'] || serviceKey.url}`
        );
        console.log('');
        console.log('🔄 Fetching OAuth token...');
      }

      // Fetch OAuth token
      const token = await fetchOAuthToken(serviceKey);

      if (options.json) {
        console.log(
          JSON.stringify(
            {
              access_token: token.access_token,
              token_type: token.token_type,
              expires_in: token.expires_in,
              expires_at: token.expires_at.toISOString(),
              scope: token.scope,
            },
            null,
            2
          )
        );
      } else if (options.quiet) {
        console.log(token.access_token);
      } else {
        console.log('✅ OAuth Token fetched successfully!');
        console.log('');
        console.log('📋 Token Details:');
        console.log(`   Type: ${token.token_type}`);
        console.log(`   Expires in: ${token.expires_in} seconds`);
        console.log(`   Expires at: ${token.expires_at.toISOString()}`);
        console.log(`   Scope: ${token.scope || '(none)'}`);
        console.log('');
        console.log('🔑 Access Token:');
        console.log(`   ${token.access_token}`);
        console.log('');
        console.log('💡 Usage in Authorization header:');
        console.log(`   Authorization: Bearer ${token.access_token}`);
      }
    } catch (error) {
      console.error(
        '❌ Error:',
        error instanceof Error ? error.message : String(error)
      );
      if (!options.quiet) {
        console.log('');
        console.log(
          '💡 Note: This will fail with mock data (example-service-key.json)'
        );
        console.log(
          '   To test successfully, use a real BTP service key in e2e/secrets/service_key.json'
        );
      }
      process.exit(1);
    }
  });

// Add more commands here in the future
program
  .command('info')
  .description('Display service key information')
  .requiredOption('-f, --file <path>', 'Path to service key JSON file')
  .action(async (options) => {
    const filePath = resolve(options.file);

    try {
      const serviceKeyJson = readFileSync(filePath, 'utf8');
      const serviceKey = ServiceKeyParser.parse(serviceKeyJson);

      console.log('📋 Service Key Information:');
      console.log(`   System ID: ${serviceKey.systemid}`);
      console.log(
        `   ABAP Endpoint: ${serviceKey.endpoints['abap'] || serviceKey.url}`
      );
      console.log(`   OAuth URL: ${serviceKey.uaa?.url || 'N/A'}`);
      console.log(`   Client ID: ${serviceKey.uaa?.clientid || 'N/A'}`);
    } catch (error) {
      console.error(
        '❌ Error:',
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }
  });

async function main() {
  await program.parseAsync(process.argv);
}

main().catch(console.error);
