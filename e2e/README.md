# End-to-End Testing

Test the BTP service key parser library with real credentials using the `btp` CLI tool.

## Quick Start

1. **Save your real BTP service key:**

   ```bash
   # Copy your real service key JSON to:
   cp /path/to/your/service-key.json e2e/secrets/service_key.json
   ```

2. **Run the CLI:**

   ```bash
   # From workspace root:
   npm run btp -- --file e2e/secrets/service_key.json

   # Test with mock data (will fail but shows structure):
   npm run btp -- --file e2e/btp-cli/example-service-key.json
   ```

## CLI Commands

```bash
# Basic usage
npm run btp -- --file <path-to-service-key.json>

# Examples
npm run btp -- --file e2e/secrets/service_key.json           # Real service key
npm run btp -- --file e2e/btp-cli/example-service-key.json   # Mock data (fails)
```

## Security

- ⚠️ **Never commit real service keys** to git
- ✅ `e2e/secrets/` directory is completely git-ignored
- ✅ All `*.json` files in `e2e/` are ignored
- ✅ Example service key uses obviously fake mock data

## Expected Output

**With real service key:**

```
📄 Service Key loaded from: e2e/secrets/service_key.json
🔧 System ID: ABC
🌐 ABAP Endpoint: https://your-system.abap.us10.hana.ondemand.com

🔄 Fetching OAuth token...
✅ OAuth Token fetched successfully!

📋 Token Details:
   Type: bearer
   Expires in: 3600 seconds
   Expires at: 2025-01-15T14:30:45.123Z
   Scope: uaa.resource

🔑 Access Token:
   eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...

💡 Usage in Authorization header:
   Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**With mock data:**

```
❌ Error: fetch failed
💡 Note: This will fail with mock data
   To test successfully, use a real BTP service key
```
