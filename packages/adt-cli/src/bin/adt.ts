#!/usr/bin/env node

// Set CLI mode before importing any modules
process.env.ADT_CLI_MODE = 'true';

import { main } from '../lib/cli';

main().catch((error) => {
  console.error('❌ CLI Error:', error.message);
  process.exit(1);
});
