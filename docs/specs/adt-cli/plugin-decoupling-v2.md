# ADT CLI Plugin Decoupling Specification v2.0

**Version**: 2.0  
**Status**: Draft  
**Created**: 2025-01-12  
**Supersedes**: plugin-architecture.md v1.0

## Vision

Complete decoupling of format plugins from ADT CLI core, with config-driven plugin discovery and ADK-only plugin interfaces.

## Architecture Principles

### 1. Separation of Concerns

- **CLI Core**: Command parsing, config loading, plugin orchestration
- **ADT Client**: XML retrieval from SAP systems
- **ADK**: XML ↔ Object conversion, plugin interface
- **Plugins**: ADK Object ↔ File System serialization

### 2. Plugin Isolation

- Plugins are standalone npm packages (`@abapify/oat`, `@abapify/abapgit`)
- Plugins have ZERO knowledge of ADT Client or CLI
- Plugins work exclusively with ADK objects
- Plugins are registered via configuration, not code

### 3. Config-Driven Discovery

- Available formats discovered from config file
- CLI prompts user if multiple formats available
- Error if no formats configured
- Authentication methods defined in config

## Plugin Interface Contract

### Core Plugin Interface

```typescript
interface FormatPlugin {
  readonly name: string;
  readonly version: string;
  readonly description: string;

  // Serialize ADK objects to file system
  serialize(
    objects: AdkObject[],
    targetPath: string,
    options?: SerializeOptions
  ): Promise<SerializeResult>;

  // Deserialize file system to ADK objects
  deserialize(
    sourcePath: string,
    options?: DeserializeOptions
  ): Promise<AdkObject[]>;

  // Validate plugin configuration
  validateConfig?(config: PluginConfig): ValidationResult;

  // Get supported object types
  getSupportedObjectTypes(): string[];
}
```

### ADK Object Interface

```typescript
interface AdkObject {
  readonly kind: Kind; // From @abapify/adk
  readonly metadata: ObjectMetadata;
  readonly spec: ObjectSpec; // Type-specific spec from ADK
}

interface ObjectMetadata {
  name: string;
  description?: string;
  package?: string;
  transportRequest?: string;
}
```

### Operation Results

```typescript
interface SerializeResult {
  success: boolean;
  filesCreated: string[];
  objectsProcessed: number;
  errors: PluginError[];
}

interface DeserializeResult {
  objects: AdkObject[];
  errors: PluginError[];
}
```

## Configuration Schema

### CLI Configuration File

```yaml
# adt.config.yaml
auth:
  type: 'btp' # btp | basic | mock
  btp:
    serviceKey: './service-key.json'
  basic:
    username: '${ADT_USERNAME}'
    password: '${ADT_PASSWORD}'
    host: 'https://my-sap-system.com'
  mock:
    enabled: true

plugins:
  formats:
    - name: '@abapify/oat'
      version: '^1.0.0'
      config:
        fileStructure: 'hierarchical'
        includeMetadata: true
    - name: '@abapify/abapgit'
      version: '^2.0.0'
      config:
        packageStructure: true

defaults:
  format: 'oat' # Optional: skip prompt if only one format or set default
```

### Plugin Package Structure

```
@abapify/oat/
├── package.json
├── src/
│   ├── index.ts          # Plugin export
│   ├── serializer.ts     # ADK → Files
│   ├── deserializer.ts   # Files → ADK
│   └── config.ts         # Plugin config schema
└── tests/
    └── e2e.test.ts       # End-to-end tests
```

## Command Flow

### Import Command Flow

```
1. CLI: Parse `adt import transport TR001`
2. CLI: Load config from adt.config.yaml
3. CLI: Discover available format plugins from config
4. CLI: Prompt user to select format (if multiple) or error (if none)
5. CLI: Initialize ADT Client with auth config
6. CLI: Fetch transport objects as XML via ADT Client
7. ADK: Convert XML → ADK Objects using adapters
8. CLI: Load selected format plugin
9. Plugin: Serialize ADK Objects → File System
10. CLI: Report results to user
```

### Export Command Flow

```
1. CLI: Parse `adt export ./project TR001`
2. CLI: Auto-detect format from file structure OR explicit --format
3. CLI: Load format plugin from config
4. Plugin: Deserialize File System → ADK Objects
5. ADK: Convert ADK Objects → XML using adapters
6. CLI: Initialize ADT Client with auth config
7. CLI: Upload XML to SAP system via ADT Client
8. CLI: Report results to user
```

## Plugin Discovery Mechanism

### Plugin Registry

```typescript
interface PluginRegistry {
  // Load plugins from config
  loadFromConfig(config: CliConfig): Promise<void>;

  // Get available format plugins
  getAvailableFormats(): string[];

  // Get specific plugin instance
  getPlugin(formatName: string): FormatPlugin;

  // Validate all configured plugins
  validatePlugins(): ValidationResult[];
}
```

### Plugin Loading

```typescript
// Dynamic plugin loading
async loadPlugin(pluginSpec: PluginSpec): Promise<FormatPlugin> {
  const module = await import(pluginSpec.name);
  const plugin = module.default as FormatPlugin;

  // Validate plugin implements interface
  if (!this.isValidPlugin(plugin)) {
    throw new PluginError(`Invalid plugin: ${pluginSpec.name}`);
  }

  return plugin;
}
```

## Authentication Abstraction

### Auth Provider Interface

```typescript
interface AuthProvider {
  readonly type: string;

  // Create authenticated ADT Client
  createClient(): Promise<AdtClient>;

  // Validate auth configuration
  validateConfig(config: AuthConfig): ValidationResult;
}

// Implementations
class BtpAuthProvider implements AuthProvider {
  /* ... */
}
class BasicAuthProvider implements AuthProvider {
  /* ... */
}
class MockAuthProvider implements AuthProvider {
  /* ... */
}
```

### Auth Registry

```typescript
interface AuthRegistry {
  register(provider: AuthProvider): void;
  getProvider(type: string): AuthProvider;
  createClient(config: AuthConfig): Promise<AdtClient>;
}
```

## Error Handling

### Plugin Errors

```typescript
class PluginError extends Error {
  constructor(
    message: string,
    public readonly plugin: string,
    public readonly category: 'config' | 'serialization' | 'validation',
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
  }
}
```

### Error Scenarios

- **No plugins configured**: Clear error message with config example
- **Multiple plugins, no default**: Interactive prompt to choose
- **Plugin load failure**: Detailed error with troubleshooting steps
- **Auth failure**: Clear auth-specific error messages

## Implementation Plan

### Phase 1: Core Infrastructure

1. Create plugin interface definitions in ADK
2. Implement plugin registry with config loading
3. Create auth provider abstraction
4. Add config file schema and validation

### Phase 2: Plugin Extraction

1. Extract OAT format to `@abapify/oat` package
2. Implement ADK-only plugin interface
3. Remove OAT coupling from CLI core
4. Update CLI to use plugin registry

### Phase 3: Testing & Validation

1. Write e2e tests for plugin pattern
2. Test config-driven discovery
3. Validate auth provider switching
4. Performance testing with large transports

### Phase 4: Additional Plugins

1. Create `@abapify/abapgit` plugin
2. Add mock plugin for testing
3. Documentation and examples

## Breaking Changes

### From v1.0 Architecture

- `FormatRegistry` replaced with `PluginRegistry`
- Plugins no longer receive `AdtClient` instances
- Configuration file required for plugin discovery
- CLI commands require explicit format selection or config default

### Migration Path

1. Create `adt.config.yaml` with current format preferences
2. Install format plugins as separate packages
3. Update CLI usage to specify formats explicitly
4. Remove legacy format registry code

## Testing Strategy

### Unit Tests

- Plugin interface compliance
- Config validation
- Auth provider functionality
- Error handling scenarios

### Integration Tests

- Plugin loading and discovery
- ADK object serialization round-trips
- Auth provider client creation
- Config file parsing

### E2E Tests

```typescript
describe('Plugin Architecture E2E', () => {
  it('should import transport using OAT plugin from config', async () => {
    // Given: Config with OAT plugin
    const config = {
      auth: { type: 'mock' },
      plugins: { formats: [{ name: '@abapify/oat' }] },
    };

    // When: Import transport
    const result = await cli.import('transport', 'TR001', './output');

    // Then: OAT files created
    expect(result.format).toBe('oat');
    expect(fs.existsSync('./output/packages')).toBe(true);
  });

  it('should prompt for format when multiple plugins available', async () => {
    // Given: Config with multiple plugins, no default
    const config = {
      plugins: {
        formats: [{ name: '@abapify/oat' }, { name: '@abapify/abapgit' }],
      },
    };

    // When: Import without explicit format
    const prompt = cli.import('transport', 'TR001');

    // Then: User prompted to choose
    expect(prompt).toPromptForFormat(['oat', 'abapgit']);
  });
});
```

## Success Criteria

1. **Zero CLI coupling**: OAT plugin has no CLI dependencies
2. **Config-driven**: All plugins discovered from configuration
3. **ADK-only interface**: Plugins work exclusively with ADK objects
4. **Auth abstraction**: Multiple auth methods configurable
5. **Error resilience**: Clear error messages for all failure modes
6. **Performance**: No regression in import/export performance
7. **Extensibility**: Easy to add new format plugins

## Future Enhancements

### Plugin Marketplace

- Plugin discovery from npm registry
- Version compatibility checking
- Plugin ratings and reviews

### Advanced Configuration

- Environment-specific configs
- Plugin-specific CLI options
- Runtime plugin switching

### Performance Optimizations

- Lazy plugin loading
- Streaming for large objects
- Parallel processing support
