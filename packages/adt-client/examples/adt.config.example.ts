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
// For external auth plugins:
// import { puppeteer } from '@abapify/auth-puppeteer';

export default defineConfig({
  destinations: {
    // Basic auth destination
    DEV: basic({
      url: 'https://dev.sap.example.com',
      client: '100',
      // username/password will be prompted at login time
    }),
    
    // Another basic auth destination
    QAS: basic({
      url: 'https://qas.sap.example.com',
      client: '100',
      insecure: true, // Skip SSL verification (dev only!)
    }),
    
    // Example with puppeteer plugin (when installed):
    // PROD: puppeteer({
    //   url: 'https://prod.sap.example.com',
    //   client: '100',
    // }),
  },
});

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
