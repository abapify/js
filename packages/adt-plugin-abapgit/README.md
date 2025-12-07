# @abapify/adt-plugin-abapgit

## Overview

This plugin provides abapGit format support for the ADT CLI, enabling import and export of ABAP objects in abapGit-compatible XML/ABAP format for seamless Git integration.

**Uses ADK v2** for type-safe ABAP object handling.

## Format Support

### Supported Object Types

- [x] Classes (CLAS)
- [x] Interfaces (INTF)
- [x] Programs (PROG)
- [x] Function Groups (FUGR)
- [x] Packages (DEVC)

### File Structure

```
src/
├── zcl_example.clas.abap           # Class source code
├── zcl_example.clas.locals_imp.abap # Local implementations
├── zcl_example.clas.testclasses.abap # Test classes
├── zcl_example.clas.xml            # Class metadata
├── zif_example.intf.abap           # Interface source
├── zif_example.intf.xml            # Interface metadata
└── package.devc.xml                # Package definition
```

## Installation

This plugin is automatically available when using `@abapify/adt-cli`.

## Usage

### Export Objects

```bash
# Export single object
npx adt export object CLAS ZCL_EXAMPLE --format abapgit --output ./output

# Export package
npx adt export package ZPACKAGE --format abapgit --output ./output
```

### Import Objects

```bash
# Import from directory
npx adt import package ./source --format abapgit --target ZPACKAGE
```

## Configuration

### Plugin Options

- `includeInactive`: Include inactive objects (default: false)
- `xmlFormat`: XML formatting style (default: 'pretty')
- `encoding`: File encoding (default: 'utf-8')

### Example Configuration

```json
{
  "format": "abapgit",
  "options": {
    "includeInactive": false,
    "xmlFormat": "pretty",
    "encoding": "utf-8"
  }
}
```

## File Mapping

### Object to File Mapping

| Object Type | File Pattern                   | Description                  |
| ----------- | ------------------------------ | ---------------------------- |
| CLAS        | `{name}.clas.abap`             | Main class source code       |
| CLAS        | `{name}.clas.xml`              | Class metadata and structure |
| CLAS        | `{name}.clas.locals_imp.abap`  | Local implementations        |
| CLAS        | `{name}.clas.testclasses.abap` | Test class implementations   |
| INTF        | `{name}.intf.abap`             | Interface source code        |
| INTF        | `{name}.intf.xml`              | Interface metadata           |

## Integration

This plugin integrates with:

- **ADT Client v2**: Uses `@abapify/adt-client` for SAP system communication
- **ADK v2**: Uses `@abapify/adk` for type-safe object handling
- **CLI**: Provides abapGit format import/export operations
- **abapGit**: Compatible with standard abapGit repository structure

## Development

### Building

```bash
npx nx build adt-plugin-abapgit
```

### Testing

```bash
npx nx test adt-plugin-abapgit
```

## Specification

For detailed technical specifications, see:

- [Plugin Architecture Specification](../../docs/specs/adt-cli/plugin-architecture.md)
- [abapGit Documentation](https://docs.abapgit.org/)

## Contributing

1. Follow the plugin architecture specification
2. Ensure compatibility with abapGit standards
3. Add comprehensive tests
4. Update documentation
