#!/usr/bin/env tsx
/**
 * Integration test for SAP ADT search functionality
 * Tests search API to understand response structure
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

async function testSearch() {
  console.log('🔍 SAP ADT Search Integration Test');
  console.log('==================================\n');

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

    // Test search for ZIF_PETSTORE
    console.log('🔍 Testing search for ZIF_PETSTORE...\n');

    const searchOptions = {
      operation: 'quickSearch' as const,
      query: 'ZIF_PETSTORE',
      maxResults: 5,
    };

    console.log('📋 Search options:', JSON.stringify(searchOptions, null, 2));

    const result = await adtClient.repository.searchObjectsDetailed(
      searchOptions
    );

    console.log('\n📄 Raw search result:');
    console.log(JSON.stringify(result, null, 2));

    console.log('\n📊 Search result analysis:');
    console.log(`- Total results: ${result.objects?.length || 0}`);

    if (result.objects && result.objects.length > 0) {
      console.log('\n🔍 First object details:');
      const firstObject = result.objects[0];
      console.log('Properties:', Object.keys(firstObject));
      console.log('Values:', JSON.stringify(firstObject, null, 2));

      console.log('\n🔍 All objects:');
      result.objects.forEach((obj, index) => {
        console.log(
          `${index + 1}. Name: "${obj.name}" | Type: "${obj.type}" | URI: "${
            obj.uri
          }" | Description: "${obj.description}"`
        );
      });
    } else {
      console.log('❌ No objects found in search results');
    }

    // Also test the raw search endpoint directly
    console.log('\n🌐 Testing raw search endpoint...');
    const rawResponse = await adtClient.request(
      '/sap/bc/adt/repository/informationsystem/search?operation=quickSearch&query=ZIF_PETSTORE&maxResults=2',
      {
        method: 'GET',
        headers: {
          Accept: 'application/xml',
        },
      }
    );

    const rawResponseText = await rawResponse.text();
    console.log('\n📄 Raw XML response:');
    console.log(rawResponseText);
  } catch (error) {
    console.error('❌ Search test failed:', error);
  }
}

// Run the test
testSearch().catch(console.error);
