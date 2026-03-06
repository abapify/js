# @abapify/logger

[![version](https://img.shields.io/github/package-json/v/abapify/adt-cli?filename=packages/logger/package.json)](https://github.com/abapify/adt-cli/pkgs/npm/%40abapify%2Flogger)

Shared logger interface for `@abapify` packages.

## Overview

This package defines the `Logger` interface used across all abapify packages. It is compatible with [pino](https://getpino.io/), winston, bunyan, and any other logger that exposes a standard log-level API.

## Installation

```bash
npm install @abapify/logger
```

## Usage

### Accept the interface in your package

```typescript
import type { Logger } from '@abapify/logger';

export function createMyService(logger: Logger) {
  logger.info('Service started');
  logger.debug('Detail', { key: 'value' });
}
```

### Use the no-op logger in tests

```typescript
import { noopLogger } from '@abapify/logger';

const service = createMyService(noopLogger);
```

### Use pino in production

```typescript
import pino from 'pino';
import type { Logger } from '@abapify/logger';

const logger: Logger = pino();
```

## Interface

```typescript
interface Logger {
  trace(msg: string, obj?: any): void;
  debug(msg: string, obj?: any): void;
  info(msg: string, obj?: any): void;
  warn(msg: string, obj?: any): void;
  error(msg: string, obj?: any): void;
  fatal(msg: string, obj?: any): void;
  child(bindings: Record<string, any>): Logger;
}
```

## License

MIT
