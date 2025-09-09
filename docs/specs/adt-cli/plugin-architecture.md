# ADT CLI Plugin Architecture Specification

**Version**: 1.0  
**Status**: Draft  
**Created**: 2025-01-09

## Overview

The ADT CLI implements a pluggable architecture that delegates format-specific operations to dedicated plugins. This enables support for multiple ABAP object serialization formats (OAT, abapGit, GCTS) while maintaining a clean separation of concerns.

## Architecture Overview

The ADT CLI plugin architecture consists of four main components:

1. **ADT CLI Core**: Command-line interface and orchestration
2. **ADT Client**: Abstracted ADT connection and service layer
3. **ADK (ABAP Development Kit)**: Interface layer between CLI and plugins
4. **Format Plugins**: Specialized handlers for different file formats (OAT, abapGit, GCTS)

### 1. ADT CLI Core

- **Package**: `@abapify/adt-cli`
- **Role**: Command-line interface and orchestration
- **Responsibilities**:
  - Parse CLI commands and options
  - Initialize ADT client with connection details
  - Discover and load format plugins
  - Delegate import/export operations to appropriate plugins
  - Handle configuration and error management

### 2. ADT Client

- **Package**: `@abapify/adt-client`
- **Role**: Abstracted ADT connection and service layer
- **Responsibilities**:
  - Manage ADT authentication and session handling
  - Provide high-level ADT service abstractions
  - Handle ADT endpoint routing and request/response processing
  - Abstract away connection complexity from plugins
- **Specification**: See [ADT Client Specification](../adt-client/README.md)

### 3. ADK (ABAP Development Kit)

- **Package**: `@abapify/adk`
- **Role**: Interface layer between CLI and plugins
- **Responsibilities**:
  - Define plugin interfaces and contracts
  - Provide common utilities for ABAP object handling
  - Manage plugin lifecycle and registration
  - Bridge between CLI core and format plugins

### 4. Format Plugins

- **Packages**: `@abapify/oat`, `@abapify/abapgit`, `@abapify/gcts`
- **Role**: Format-specific serialization handlers
- **Responsibilities**:
  - Implement format-specific import/export logic
  - Handle object-to-file mapping strategies
  - Manage format-specific configuration
  - Provide format validation and transformation

## Plugin Interface

### Core Plugin Contract

```typescript
interface AdtPlugin {
  readonly name: string;
  readonly version: string;
  readonly supportedFormats: string[];

  // Object import/export operations
  importObject(params: ImportObjectParams): Promise<ImportResult>;
  exportObject(params: ExportObjectParams): Promise<ExportResult>;

  // Batch operations
  importObjects?(params: ImportObjectsParams): Promise<ImportResult[]>;
  exportObjects?(params: ExportObjectsParams): Promise<ExportResult[]>;

  // Configuration and validation
  validateConfig?(config: PluginConfig): ValidationResult;
  getDefaultConfig?(): PluginConfig;
}
```

### Operation Parameters

```typescript
interface ImportObjectParams {
  objectType: string;
  objectName: string;
  sourcePath: string;
  adtClient: AdtClient;
  options?: ImportOptions;
}

interface ExportObjectParams {
  objectType: string;
  objectName: string;
  adtClient: AdtClient;
  targetPath: string;
  options?: ExportOptions;
}

interface ImportResult {
  success: boolean;
  objectKey: string;
  messages: Message[];
  metadata?: ObjectMetadata;
}

interface ExportResult {
  success: boolean;
  filePaths: string[];
  messages: Message[];
  metadata?: ObjectMetadata;
}
```

## Object-to-File Mapping Strategies

### 1. Multi-Section File Mapping (OAT)

- Uses YAML format with `kind + metadata + spec` schema structure
- Objects map to multiple files with content type differentiation
- File naming pattern: `<object_name>.<object_type>[.<content_type>][.<language>].<extension>`
- Examples for class `CL_EXAMPLE`:
  - `cl_example.clas.yml` (main object with kind: Class)
  - `cl_example.clas.abap` (main source code)
  - `cl_example.clas.testclasses.abap` (test classes)
  - `cl_example.clas.texts.en.properties` (text elements)
- YAML schema structure varies by object kind:
  ```yaml
  # Domain example
  kind: Domain
  metadata:
    name: ZAGE_FIXED_VALUES
    description: 'Fixed values (test)'
  spec:
    typeInformation:
      datatype: 'CHAR'
      length: 1
    outputInformation:
      length: 1
    valueInformation:
      fixValues:
        - low: 'A'
          text: 'This is A'
  ```
  ```yaml
  # Class example
  kind: Class
  metadata:
    name: ZCL_EXAMPLE
    description: 'Example class'
  spec:
    visibility: 'PUBLIC'
    isFinal: false
    isAbstract: false
    interfaces: []
    components:
      methods: []
      attributes: []
      events: []
      types: []
  ```
  ```yaml
  # Interface example
  kind: Interface
  metadata:
    name: ZIF_EXAMPLE
    description: 'Example interface'
  spec:
    category: 'IF'
    interfaces: []
    components:
      methods: []
      attributes: []
      events: []
      types: []
  ```
- ADT endpoints provide separate access to each content section:
  - `/sap/bc/adt/oo/classes/{name}` (metadata)
  - `/sap/bc/adt/oo/classes/{name}/source/main` (main source)
  - `/sap/bc/adt/oo/classes/{name}/includes/testclasses` (test classes)
  - `/sap/bc/adt/oo/classes/{name}/includes/locals_def` (local definitions)
  - `/sap/bc/adt/oo/classes/{name}/includes/locals_imp` (local implementations)
  - `/sap/bc/adt/oo/classes/{name}/includes/macros` (macros)
  - `/sap/bc/adt/oo/classes/{name}/objectstructure` (structure outline)
- Plugin handles mapping between ADT segments and file sections
- Each ADT endpoint corresponds to a specific content type in OAT format

### 2. One-to-Many Mapping (abapGit)

- Complex objects split across multiple files
- Class: `.clas.abap` (main), `.clas.locals_imp.abap` (implementations)
- Metadata in separate `.clas.xml` files

### 3. Flat File Mapping (GCTS)

- Objects organized by object type in directory hierarchy: `src/objects/{OBJECT_TYPE}/{OBJECT_NAME}/`
- Uses technical `asx.json` format representing SAP database tables as JSON arrays
- Format contains multiple SAP tables with their records (not human-readable)
- Package information stored in object metadata within table records
- File naming pattern: `{OBJECT_TYPE} {OBJECT_NAME}.asx.json` (note space in filename)
- Examples:
  - `src/objects/CLAS/ZCL_EXAMPLE/CLAS ZCL_EXAMPLE.asx.json` (class metadata only)
  - `src/objects/INTF/ZIF_EXAMPLE/INTF ZIF_EXAMPLE.asx.json` (interface metadata only)
- Source code is embedded within the asx.json metadata file, not separate .abap files
- gCTS breaks objects into separate files but stores source within the technical metadata structure
- Object metadata contains multiple SAP database tables as JSON arrays:
  ```json
  [
    {
      "table": "DDTYPES",
      "data": [
        {
          "TYPENAME": "ZCL_EXAMPLE",
          "STATE": "A",
          "TYPEKIND": "CLAS"
        }
      ]
    },
    {
      "table": "SEOCLASS",
      "data": [
        {
          "CLSNAME": "ZCL_EXAMPLE",
          "CLSTYPE": 0,
          "UUID": "...",
          "REMOTE": ""
        }
      ]
    },
    {
      "table": "SEOCLASSDF",
      "data": [
        {
          "CLSNAME": "ZCL_EXAMPLE",
          "VERSION": 1,
          "CATEGORY": 0,
          "EXPOSURE": 2,
          "STATE": 1,
          "AUTHOR": "SAP",
          "CREATEDON": "2022-06-01"
        }
      ]
    }
  ]
  ```
- Plugin must parse multiple SAP database tables and reconstruct object structure
- Each object type uses different combinations of SAP tables
- Requires deep knowledge of SAP database schema for proper parsing

## Plugin Discovery and Loading

### Registration Mechanism

```typescript
// Plugin registration in ADK
export class PluginRegistry {
  private plugins = new Map<string, AdtPlugin>();

  register(plugin: AdtPlugin): void;
  getPlugin(format: string): AdtPlugin | undefined;
  listPlugins(): AdtPlugin[];

  // Auto-discovery from @abapify/* packages
  async discoverPlugins(): Promise<void>;
}
```

### Configuration Integration

```typescript
// CLI configuration with plugin settings
interface AdtCliConfig {
  defaultFormat: string;
  plugins: {
    [pluginName: string]: PluginConfig;
  };

  // Format-specific configurations
  oat?: OatConfig;
  abapgit?: AbapGitConfig;
  gcts?: GctsConfig;
}
```

## Command Flow

### Export Operation

1. **CLI** parses `adt export` command with format option
2. **CLI** initializes **ADT Client** with connection details
3. **ADK** resolves target plugin based on format
4. **Plugin** receives export parameters and **ADT Client** instance
5. **Plugin** fetches object from ABAP system via **ADT Client**
6. **Plugin** applies format-specific transformation and file mapping
7. **Plugin** writes files to target directory structure
8. **CLI** reports operation results to user

### Import Operation

1. **CLI** parses `adt import` command with source path
2. **CLI** initializes **ADT Client** with connection details
3. **ADK** detects format from file structure or explicit option
4. **Plugin** receives import parameters and **ADT Client** instance
5. **Plugin** validates source files and configuration
6. **Plugin** reads and parses format-specific files
7. **Plugin** transforms to ABAP object representation
8. **Plugin** uploads object to ABAP system via **ADT Client**
9. **CLI** reports operation results and any conflicts

## Error Handling

### Plugin Error Categories

- **Configuration Errors**: Invalid plugin settings or missing required options
- **Format Errors**: Malformed files or unsupported object types
- **System Errors**: ADT connection failures or ABAP system issues
- **Mapping Errors**: File structure conflicts or naming violations

### Error Propagation

```typescript
interface PluginError extends Error {
  readonly category: 'config' | 'format' | 'system' | 'mapping';
  readonly plugin: string;
  readonly context?: Record<string, unknown>;
}
```

## Extensibility

### Custom Plugin Development

1. Implement `AdtPlugin` interface
2. Package as npm module with `@abapify/` namespace
3. Export plugin instance as default export
4. ADK auto-discovers and registers plugin

### Plugin Hooks

```typescript
interface PluginHooks {
  beforeImport?(context: OperationContext): Promise<void>;
  afterImport?(context: OperationContext, result: ImportResult): Promise<void>;
  beforeExport?(context: OperationContext): Promise<void>;
  afterExport?(context: OperationContext, result: ExportResult): Promise<void>;
}
```

## Configuration Schema

### Plugin Configuration

```typescript
interface PluginConfig {
  enabled: boolean;
  priority?: number;
  options: Record<string, unknown>;
}

// Format-specific configurations
interface OatConfig extends PluginConfig {
  options: {
    fileStructure: 'flat' | 'grouped' | 'hierarchical';
    includeMetadata: boolean;
    compressionLevel?: number;
  };
}

interface AbapGitConfig extends PluginConfig {
  options: {
    packageStructure: boolean;
    includeLocalClasses: boolean;
    xmlFormatting: 'compact' | 'pretty';
  };
}

interface GctsConfig extends PluginConfig {
  options: {
    transportStructure: boolean;
    includeTransportHeaders: boolean;
    packageHierarchy: boolean;
  };
}
```

## Implementation Guidelines

### Plugin Development Standards

1. **Stateless Design**: Plugins should not maintain state between operations
2. **Error Resilience**: Handle partial failures gracefully with detailed error messages
3. **Performance**: Implement streaming for large objects when possible
4. **Compatibility**: Support backward compatibility for configuration changes
5. **Testing**: Provide comprehensive test coverage including edge cases

### ADK Integration Points

- Use ADK utilities for ADT service communication
- Leverage ADK object type definitions and validation
- Utilize ADK configuration management for plugin settings
- Follow ADK logging and error reporting conventions

## Migration Strategy

### Phase 1: Core Architecture

- Implement ADK plugin interfaces and registry
- Create basic plugin discovery mechanism
- Establish configuration schema

### Phase 2: Plugin Implementation

- Develop OAT plugin with full feature parity
- Implement abapGit plugin for basic objects
- Create GCTS plugin foundation

### Phase 3: Advanced Features

- Add batch operation support
- Implement plugin hooks and extensibility
- Optimize performance for large-scale operations

## Compatibility Matrix

| Plugin  | Object Types                  | File Formats  | Import | Export | Batch |
| ------- | ----------------------------- | ------------- | ------ | ------ | ----- |
| OAT     | All                           | YAML/JSON     | ✅     | ✅     | ✅    |
| abapGit | Classes, Interfaces, Programs | XML/ABAP      | ✅     | ✅     | ✅    |
| GCTS    | Package-based                 | XML/Transport | ✅     | ✅     | ⚠️    |

## Security Considerations

### Plugin Validation

- Verify plugin signatures and integrity
- Sandbox plugin execution environment
- Validate plugin configurations against schema
- Audit plugin operations and file access

### Credential Management

- Plugins receive ADT connections through secure ADK interfaces
- No direct credential access for plugins
- Audit trail for all system operations
- Support for credential rotation and expiration
