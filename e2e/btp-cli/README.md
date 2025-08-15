# BTP CLI Tool

Simple CLI tool for testing the `@abapify/btp-service-key-parser` library with real BTP service keys.

## Usage

### From Workspace Root

```bash
# Test with real service key
npm run btp:token

# Test with custom file
npm run btp -- --file path/to/your/service-key.json

# Test with mock data (will fail but shows structure)
npm run btp -- --file e2e/btp-cli/example-service-key.json
```

### Direct Usage

```bash
# From e2e/btp-cli directory
npx tsx cli.ts --file ../../secrets/service_key.json
npx tsx cli.ts --file example-service-key.json
```

## Files

- `cli.ts` - Main CLI implementation
- `example-service-key.json` - Mock service key for testing structure
- `package.json` - CLI package configuration

## Testing Flow

1. **Parse service key** - Validates JSON structure with Zod
2. **Display info** - Shows system ID and ABAP endpoint
3. **Fetch OAuth token** - Uses native fetch for client credentials flow
4. **Display results** - Shows token details and usage instructions

## Security

This CLI is designed for **testing only** and should never be used in production. Real service keys should be stored in `../secrets/` which is git-ignored.
