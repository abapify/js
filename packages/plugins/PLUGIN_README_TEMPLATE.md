# @abapify/[PLUGIN_NAME]

## Overview

This plugin provides [FORMAT_NAME] format support for the ADT CLI, enabling import and export of ABAP objects in [FORMAT_NAME] format.

## Format Support

### Supported Object Types

- [ ] Classes (CLAS)
- [ ] Interfaces (INTF)
- [ ] Programs (PROG)
- [ ] Function Groups (FUGR)
- [ ] Packages (DEVC)

### File Structure

```
[Describe the file structure this plugin creates]
```

## Installation

This plugin is automatically available when using `@abapify/adt-cli`.

## Usage

### Export Objects

```bash
# Export single object
npx adt export object CLAS ZCL_EXAMPLE --format [format] --output ./output

# Export package
npx adt export package ZPACKAGE --format [format] --output ./output
```

### Import Objects

```bash
# Import from directory
npx adt import package ./source --format [format] --target ZPACKAGE
```

## Configuration

### Plugin Options

- `option1`: Description of option1
- `option2`: Description of option2

### Example Configuration

```json
{
  "format": "[format]",
  "options": {
    "option1": "value1",
    "option2": "value2"
  }
}
```

## File Mapping

### Object to File Mapping

| Object Type | File Pattern | Description          |
| ----------- | ------------ | -------------------- |
| CLAS        | `[pattern]`  | Class definition     |
| INTF        | `[pattern]`  | Interface definition |

## Integration

This plugin integrates with:

- **ADT Client**: Uses `AdtClient` for SAP system communication
- **ADK**: Uses ABAP Development Kit for type-safe object handling
- **CLI**: Provides format-specific import/export operations

## Development

### Building

```bash
npx nx build [plugin-name]
```

### Testing

```bash
npx nx test [plugin-name]
```

## Specification

For detailed technical specifications, see:

- [Plugin Architecture Specification](../../docs/specs/adt-cli/plugin-architecture.md)
- [Format-specific specifications](../../docs/specs/[format]/)

## Contributing

1. Follow the plugin architecture specification
2. Ensure all object types are properly supported
3. Add comprehensive tests
4. Update documentation
