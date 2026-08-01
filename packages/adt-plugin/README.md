# @abapify/adt-plugin

[![version](https://img.shields.io/github/package-json/v/abapify/adt-cli?filename=packages/adt-plugin/package.json)](https://github.com/abapify/adt-cli/pkgs/npm/%40abapify%2Fadt-plugin)

Core plugin interface for ADT format serialization.

## Overview

This package defines the **plugin contract** for serializing ADK objects to various formats (abapGit, etc.). Plugins implement this interface to provide format-specific serialization.

**Key principle:** Plugins only handle serialization format. They receive ADK objects and produce files - no ADT client logic.

## Installation

```bash
bun add @abapify/adt-plugin
```

## Usage

### Creating a Plugin

```typescript
import { createPlugin, type AdtPlugin } from '@abapify/adt-plugin';

export const myPlugin = createPlugin({
  name: 'myFormat',
  version: '1.0.0',
  description: 'My custom format plugin',

  // Registry service - what object types are supported
  registry: {
    isSupported: (type) => ['CLAS', 'INTF'].includes(type),
    getSupportedTypes: () => ['CLAS', 'INTF'],
  },

  // Format service - import/export operations
  format: {
    // Import: ADK object → file system
    import: async (object, targetPath, context) => {
      // Serialize object to files
      return {
        success: true,
        filesCreated: ['myclass.clas.xml'],
      };
    },

    // Export: file system → ADK object (optional)
    export: async (sourcePath, type, name) => {
      // Deserialize files to ADK object
      return {
        success: true,
        object: myAdkObject,
      };
    },
  },

  // Lifecycle hooks (optional)
  hooks: {
    afterImport: async (targetPath) => {
      // Generate metadata files, etc.
    },
  },
});
```

### Using a Plugin

```typescript
import { abapGitPlugin } from '@abapify/adt-plugin-abapgit';

// Check if type is supported
if (abapGitPlugin.registry.isSupported('CLAS')) {
  // Import object to file system
  const result = await abapGitPlugin.format.import(myClassObject, './output', {
    packagePath: ['ZROOT', 'ZSUB'],
  });

  if (result.success) {
    console.log('Files created:', result.filesCreated);
  }
}

// Get all supported types
const types = abapGitPlugin.registry.getSupportedTypes();
// → ['CLAS', 'INTF', 'DOMA', 'DEVC', 'DTEL']
```

## API

### Pure tree materialization

Flow-style consumers need to calculate repository changes before touching the
filesystem. A format plugin can expose the optional pure materialization
capability:

```typescript
const result = await formatPlugin.materialize?.({
  object: adkObject,
  objectType: 'CLAS',
  packagePath: ['ZROOT', 'ZROOT_FEATURE'],
  sources: {
    main: historicalMainSource,
    definitions: historicalLocalDefinitions,
  },
  formatOptions: { folderLogic: 'prefix' },
});
```

When `sources` is present it is authoritative. A handler emits only those
components and must not read mutable source through the ADK object. The result
contains deterministic repository-relative files with `source` or `metadata`
roles; the caller owns validation and filesystem reconciliation.

### `createPlugin(definition)`

Factory function to create a validated plugin instance.

### `AdtPlugin` Interface

```typescript
interface AdtPlugin {
  readonly name: string;
  readonly version: string;
  readonly description: string;

  readonly registry: {
    isSupported(type: AbapObjectType): boolean;
    getSupportedTypes(): AbapObjectType[];
  };

  readonly format: {
    import(object, targetPath, context): Promise<ImportResult>;
    export?(sourcePath, type, name): Promise<ExportResult>;
  };

  readonly hooks?: {
    afterImport?(targetPath: string): Promise<void>;
    beforeExport?(sourcePath: string): Promise<void>;
  };
}
```

## Terminology

- **Import** (to Git): ADK object → serialized files (SAP → file system)
- **Export** (from Git): serialized files → ADK object (file system → SAP)
