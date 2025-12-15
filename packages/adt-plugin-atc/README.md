# @abapify/adt-plugin-atc

ABAP Test Cockpit (ATC) plugin for abapify.

## Overview

This plugin provides integration with SAP's ABAP Test Cockpit for static code analysis.

## Features (Planned)

- Run ATC checks on ABAP objects
- Retrieve ATC findings and results
- Support for custom check variants
- Integration with CI/CD pipelines

## Installation

```bash
npm install @abapify/adt-plugin-atc
```

## Usage

```typescript
import { AtcPlugin } from '@abapify/adt-plugin-atc';

// Register the plugin with ADT client
client.use(AtcPlugin);

// Run ATC checks
const results = await client.atc.runChecks({
  objects: ['ZCL_MY_CLASS', 'ZIF_MY_INTERFACE'],
  variant: 'DEFAULT'
});
```

## API

### `runChecks(options)`

Run ATC checks on specified objects.

### `getFindings(runId)`

Retrieve findings from an ATC run.

### `getVariants()`

List available ATC check variants.

## License

MIT
