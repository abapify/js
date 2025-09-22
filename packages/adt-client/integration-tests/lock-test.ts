#!/usr/bin/env node
/**
 * Independent integration test for SAP ADT object locking
 * This test isolates the locking mechanism to debug the exact issue
 */

import { AdtClientImpl } from '../src/client/adt-client';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

interface ServiceKey {
  serviceKey: {
    url: string;
    uaa: {
      url: string;
      clientid: string;
      clientsecret: string;
    };
  };
}

async function loadCredentials(): Promise<ServiceKey> {
  const authPath = join(homedir(), '.adt', 'auth.json');

  if (!existsSync(authPath)) {
    throw new Error(
      `No auth config found at ${authPath}. Please run 'npx adt auth' first.`
    );
  }

  const authData = JSON.parse(readFileSync(authPath, 'utf-8'));
  return authData;
}

async function testLocking() {
  console.log('🔒 SAP ADT Object Locking Integration Test');
  console.log('==========================================\n');

  try {
    // Load credentials
    console.log('📋 Loading credentials...');
    const config = await loadCredentials();
    console.log(`✅ Loaded config for: ${config.serviceKey.url}\n`);

    // Create ADT client
    console.log('🔌 Creating ADT client...');
    const logger = {
      debug: (msg: string, meta?: any) =>
        console.log(`[DEBUG] ${msg}`, meta || ''),
      info: (msg: string, meta?: any) =>
        console.log(`[INFO] ${msg}`, meta || ''),
      warn: (msg: string, meta?: any) =>
        console.log(`[WARN] ${msg}`, meta || ''),
      error: (msg: string, meta?: any) =>
        console.log(`[ERROR] ${msg}`, meta || ''),
      child: (meta?: any) => logger,
    };

    const adtClient = new AdtClientImpl({
      logger,
    });

    // Test object URI (using the existing ZIF_PETSTORE interface)
    const testUri = '/sap/bc/adt/oo/interfaces/zif_petstore';
    const transportRequest = 'TRLK909454';

    console.log(`🎯 Testing lock on: ${testUri}`);
    console.log(`🚛 Transport request: ${transportRequest}\n`);

    // Prepare lock headers exactly as in the screenshot (NO Content-Type!)
    const lockHeaders: Record<string, string> = {
      Accept:
        'application/vnd.sap.as+xml;charset=UTF-8;dataname=com.sap.adt.lock.result;q=0.9, application/vnd.sap.as+xml;charset=UTF-8;q=0.8',
      'X-sap-adt-sessiontype': 'stateful',
      'x-sap-security-session': 'use',
      'sap-adt-request-id': generateRequestId(),
      'sap-adt-corrnr': transportRequest,
    };

    console.log('📋 Lock request headers:');
    Object.entries(lockHeaders).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
    console.log();

    // Make the lock request
    console.log('🔒 Sending lock request...');

    // Construct URL with proper encoding - CRITICAL: _action with underscore!
    const lockUrl = `${testUri}?_action=LOCK&accessMode=MODIFY`;
    console.log(`📡 Full URL: ${lockUrl}`);
    console.log(`📡 URL length: ${lockUrl.length} characters`);

    // Validate URL has no spaces or problematic characters
    if (lockUrl.includes(' ')) {
      console.log('⚠️ WARNING: URL contains spaces!');
    }
    if (lockUrl.includes('\n') || lockUrl.includes('\r')) {
      console.log('⚠️ WARNING: URL contains newline characters!');
    }

    try {
      const response = await adtClient.request(lockUrl, {
        method: 'POST',
        headers: lockHeaders,
        body: null, // Explicitly null body
      });

      console.log('\n✅ Lock request successful!');
      console.log(`📊 Status: ${response.status}`);
      console.log('📋 Response headers:');
      if (response.headers) {
        Object.entries(response.headers).forEach(([key, value]) => {
          console.log(`   ${key}: ${value}`);
        });
      }

      console.log('\n📄 Response body:');
      console.log(response.body || '(empty)');

      // Try to extract lock handle
      if (response.body && typeof response.body === 'string') {
        const lockHandleMatch = response.body.match(
          /<LOCK_HANDLE>([^<]+)<\/LOCK_HANDLE>/
        );
        if (lockHandleMatch && lockHandleMatch[1]) {
          const lockHandle = lockHandleMatch[1];
          console.log(`\n🔑 Lock handle extracted: ${lockHandle}`);

          // Test unlock
          console.log('\n🔓 Testing unlock...');
          const unlockUrl = `${testUri}?type=unlock&lockhandle=${lockHandle}`;

          try {
            await adtClient.request(unlockUrl, {
              method: 'DELETE',
              headers: {
                Accept: 'application/xml',
              },
            });
            console.log('✅ Unlock successful!');
          } catch (unlockError) {
            console.log('⚠️ Unlock failed:', unlockError);
          }
        } else {
          console.log('⚠️ No lock handle found in response');
        }
      }
    } catch (lockError: any) {
      console.log('\n❌ Lock request failed!');
      console.log(`Error: ${lockError.message}`);

      if (lockError.response) {
        console.log(`Status: ${lockError.response.status}`);
        console.log(`Body: ${lockError.response.body}`);
      }
    }
  } catch (error: any) {
    console.error('💥 Test failed:', error.message);
    process.exit(1);
  }
}

function generateRequestId(): string {
  // Generate a UUID-like request ID similar to SAP's format
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    .replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    })
    .replace(/-/g, '');
}

// Run the test
if (require.main === module) {
  testLocking().catch(console.error);
}
