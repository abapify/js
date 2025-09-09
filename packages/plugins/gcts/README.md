# @abapify/gcts

## Overview

This plugin provides GCTS (Git-enabled Change and Transport System) format support for the ADT CLI, enabling import and export of ABAP objects in transport-based format for SAP Cloud systems.

## Format Support

### Supported Object Types

- [x] Classes (CLAS)
- [x] Interfaces (INTF)
- [x] Programs (PROG)
- [x] Function Groups (FUGR)
- [x] Packages (DEVC)
- [x] Transports (TR\*)

### File Structure

```
transport/
├── manifest.json                   # Transport manifest
├── objects/
│   ├── CLAS/
│   │   └── ZCL_EXAMPLE.json       # Object metadata
│   └── INTF/
│       └── ZIF_EXAMPLE.json       # Interface metadata
└── source/
    ├── ZCL_EXAMPLE.clas.abap      # Source code
    └── ZIF_EXAMPLE.intf.abap      # Interface source
```

## Installation

This plugin is automatically available when using `@abapify/adt-cli`.

## Usage

### Export Objects

```bash
# Export transport
npx adt export transport TR001 --format gcts --output ./output

# Export package
npx adt export package ZPACKAGE --format gcts --output ./output
```

### Import Objects

```bash
# Import transport
npx adt import transport ./transport --format gcts --target TR002
```

## Configuration

### Plugin Options

- `includeTransportInfo`: Include transport metadata (default: true)
- `compressOutput`: Compress transport files (default: false)
- `validateObjects`: Validate objects before export (default: true)

### Example Configuration

```json
{
  "format": "gcts",
  "options": {
    "includeTransportInfo": true,
    "compressOutput": false,
    "validateObjects": true
  }
}
```

## File Mapping

### Object to File Mapping

| Object Type | File Pattern               | Description           |
| ----------- | -------------------------- | --------------------- |
| CLAS        | `objects/CLAS/{name}.json` | Class metadata        |
| CLAS        | `source/{name}.clas.abap`  | Class source code     |
| INTF        | `objects/INTF/{name}.json` | Interface metadata    |
| INTF        | `source/{name}.intf.abap`  | Interface source code |
| Transport   | `manifest.json`            | Transport information |

## Integration

This plugin integrates with:

- **ADT Client**: Uses `AdtClient` for SAP system communication
- **ADK**: Uses ABAP Development Kit for type-safe object handling
- **CLI**: Provides GCTS format import/export operations
- **SAP GCTS**: Compatible with SAP Git-enabled Change and Transport System

## Development

### Building

```bash
npx nx build gcts
```

### Testing

```bash
npx nx test gcts
```

## Specification

For detailed technical specifications, see:

- [Plugin Architecture Specification](../../docs/specs/adt-cli/plugin-architecture.md)
- [SAP GCTS Documentation](https://help.sap.com/docs/ABAP_PLATFORM_NEW/4a368c163b08418890a406d413933ba7/f319b168e87e42149e25e13c08d002b9.html)

## Contributing

1. Follow the plugin architecture specification
2. Ensure compatibility with SAP GCTS standards
3. Add comprehensive tests
4. Update documentation
