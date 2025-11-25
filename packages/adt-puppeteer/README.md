# @abapify/adt-puppeteer

Puppeteer-based authentication for SAP ADT systems. Supports SSO/IDP authentication via browser automation.

## Installation

```bash
npm install @abapify/adt-puppeteer puppeteer
```

## Usage

```typescript
import { puppeteerAuth } from '@abapify/adt-puppeteer';

// Opens browser for SSO login
const credentials = await puppeteerAuth.authenticate({
  url: 'https://sap-system.example.com',
});

// Test if session is still valid
const result = await puppeteerAuth.test(credentials);
console.log(result.success); // true/false
```

## How It Works

1. Opens a browser window (visible by default for SSO)
2. Navigates to SAP ADT discovery endpoint
3. Waits for user to complete SSO/IDP login
4. Captures session cookies after successful authentication
5. Returns credentials that can be used with ADT client

## Options

```typescript
interface PuppeteerAuthOptions {
  url: string;           // SAP system URL
  headless?: boolean;    // Hide browser (default: false)
  timeout?: number;      // Login timeout in ms (default: 120000)
  userAgent?: string;    // Custom user agent
}
```

## Integration with adt-config

```typescript
// adt.config.ts
import { defineConfig } from '@abapify/adt-config';
import { puppeteer } from '@abapify/adt-puppeteer';

export default defineConfig({
  destinations: {
    DEV: puppeteer('https://sap-dev.example.com'),
    QAS: puppeteer({ url: 'https://sap-qas.example.com', timeout: 60000 }),
  },
});
```
