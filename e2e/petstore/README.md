# Petstore E2E Example

This example demonstrates the complete workflow of creating ABAP objects locally and deploying them to SAP using the ADT CLI export functionality.

## Project Structure

```
e2e/petstore/
├── README.md
├── oat-zpetstore/          # OAT format package structure
│   └── packages/
│       └── zpetstore/
│           └── objects/
│               └── intf/
│                   └── zif_petstore/
│                       ├── zif_petstore.intf.yml
│                       └── zif_petstore.intf.abap
└── package.json            # Project metadata
```

## Workflow

1. **Create Interface Specification** - Define ZIF_PETSTORE interface with petstore operations
2. **Generate OAT Files** - Create the OAT format files for the interface
3. **Test Export (Dry Run)** - Validate the export process without creating objects
4. **Deploy to SAP** - Use ADT CLI to create the interface in SAP system

## Usage

### Testing

```bash
# Run the complete test suite
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with UI (interactive)
npm run test:ui
```

### Manual Export Commands

```bash
# Test export (dry run)
adt export package ZPETSTORE ./oat-zpetstore --debug

# Deploy to SAP (requires authentication and transport)
adt export package ZPETSTORE ./oat-zpetstore --create --transport NPLK900123 --debug
```
