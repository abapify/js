# @abapify/oat

## Overview

This plugin provides OAT (Object Archive Template) format support for the ADT CLI, enabling import and export of ABAP objects in YAML-based OAT format with type-safe specifications.

## Format Support

### Supported Object Types

- [x] Classes (CLAS)
- [x] Interfaces (INTF)
- [ ] Programs (PROG)
- [ ] Function Groups (FUGR)
- [x] Packages (DEVC)

### File Structure

```
project/
├── objects/
│   ├── cl_example.clas.yml          # Class specification
│   ├── cl_example.clas.abap         # Class source code
│   ├── cl_example.clas.testclasses.abap  # Test classes
│   └── if_example.intf.yml          # Interface specification
└── package.yml                      # Package metadata
```

## Installation

This plugin is automatically available when using `@abapify/adt-cli`.

## Usage

### Export Objects

```bash
# Export single object
npx adt export object CLAS ZCL_EXAMPLE --format oat --output ./output

# Export package
npx adt export package ZPACKAGE --format oat --output ./output
```

### Import Objects

```bash
# Import from directory
npx adt import package ./source --format oat --target ZPACKAGE
```

## Configuration

### Plugin Options

- `includeTests`: Include test classes in export (default: true)
- `includeTexts`: Include text elements (default: true)
- `yamlStyle`: YAML formatting style (default: 'block')

### Example Configuration

```json
{
  "format": "oat",
  "options": {
    "includeTests": true,
    "includeTexts": true,
    "yamlStyle": "block"
  }
}
```

## File Mapping

### Object to File Mapping

| Object Type | File Pattern                   | Description                       |
| ----------- | ------------------------------ | --------------------------------- |
| CLAS        | `{name}.clas.yml`              | Class specification with metadata |
| CLAS        | `{name}.clas.abap`             | Main class source code            |
| CLAS        | `{name}.clas.testclasses.abap` | Test class implementations        |
| INTF        | `{name}.intf.yml`              | Interface specification           |
| INTF        | `{name}.intf.abap`             | Interface source code             |

## Integration

This plugin integrates with:

- **ADT Client**: Uses `AdtClient` for SAP system communication
- **ADK**: Uses ABAP Development Kit for type-safe object handling
- **CLI**: Provides OAT format import/export operations

## Development

### Building

```bash
npx nx build oat
```

### Testing

```bash
npx nx test oat
```

## Specification

For detailed technical specifications, see:

- [Plugin Architecture Specification](../../docs/specs/adt-cli/plugin-architecture.md)
- [OAT Format Specifications](../../docs/specs/oat/)

## Contributing

1. Follow the plugin architecture specification
2. Ensure all object types are properly supported
3. Add comprehensive tests
4. Update documentation
