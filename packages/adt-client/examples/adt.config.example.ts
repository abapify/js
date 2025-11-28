/**
 * Example ADT Configuration File
 *
 * Copy this to your project root as `adt.config.ts`
 *
 * Usage:
 *   npx adt auth login DEV
 *   npx adt transport list --dest DEV
 */

import { defineConfig, basic } from '@abapify/adt-client';

// Option 1: Basic auth (username/password)
export default defineConfig({
  destinations: {
    DEV: basic({
      url: 'https://dev.sap.example.com',
      client: '100',
      // username/password will be prompted at login time
    }),

    QAS: basic({
      url: 'https://qas.sap.example.com',
      client: '100',
      insecure: true, // Skip SSL verification (dev only!)
    }),
  },
});

// Option 2: Puppeteer SSO auth (all destinations)
// import { withPuppeteer } from '@abapify/adt-puppeteer';
//
// export default withPuppeteer(
//   defineConfig({
//     destinations: {
//       DEV: 'https://dev.sap.example.com',
//       QAS: 'https://qas.sap.example.com',
//       PROD: 'https://prod.sap.example.com',
//     },
//   }),
//   {
//     // Puppeteer plugin options (applied to ALL destinations)
//     userDataDir: true,  // Enable session persistence - reuse Okta cookies!
//     headless: false,    // Show browser window during login
//     timeout: 120000,    // 2 minute timeout
//   }
// );

// Option 3: Mixed auth types (per-destination)
// import { puppeteer } from '@abapify/adt-puppeteer';
//
// export default defineConfig({
//   destinations: {
//     DEV: basic({ url: 'https://dev.sap.example.com', client: '100' }),
//     PROD: puppeteer({ url: 'https://prod.sap.example.com' }),
//   },
// });

/**
 * JSON equivalent (adt.config.json):
 * 
 * {
 *   "destinations": {
 *     "DEV": {
 *       "type": "basic",
 *       "options": {
 *         "url": "https://dev.sap.example.com",
 *         "client": "100"
 *       }
 *     },
 *     "QAS": {
 *       "type": "basic",
 *       "options": {
 *         "url": "https://qas.sap.example.com",
 *         "client": "100",
 *         "insecure": true
 *       }
 *     }
 *   }
 * }
 */
