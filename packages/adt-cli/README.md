# ADT CLI

A command-line interface for SAP ABAP Development Tools (ADT) services, providing authentication and service discovery for BTP (Business Technology Platform) environments.

## Features

- 🔐 **OAuth Authentication** - Browser-based login using BTP service keys
- 🔍 **Service Discovery** - Discover available ADT services and endpoints
- 💾 **Export Options** - Save discovery data as XML or JSON
- 🚀 **Modern Architecture** - Built with TypeScript and fast-xml-parser

## Installation

```bash
npm install @abapify/adt-cli
```

Or run directly with npx:

```bash
npx @abapify/adt-cli <command>
```

## Quick Start

1. **Login with your BTP service key:**

   ```bash
   adt auth login --file path/to/your-service-key.json
   ```

2. **Discover available ADT services:**

   ```bash
   adt discovery
   ```

3. **Save discovery data:**

   ```bash
   # Save as XML
   adt discovery -o services.xml

   # Save as JSON (parsed)
   adt discovery -o services.json
   ```

## Commands

### Authentication

#### `adt auth login --file <path>`

Authenticate with BTP using a service key file.

```bash
adt auth login --file ./secrets/my-service-key.json
```

**Service Key Format:**
Your service key should be a JSON file containing BTP credentials:

```json
{
  "clientid": "your-client-id",
  "clientsecret": "your-client-secret",
  "url": "https://your-btp-instance.cfapps.eu10.hana.ondemand.com",
  "endpoints": {
    "abap": "https://your-abap-system.cfapps.eu10.hana.ondemand.com"
  },
  "uaadomain": "authentication.eu10.hana.ondemand.com"
}
```

#### `adt auth logout`

Clear stored authentication tokens.

```bash
adt auth logout
```

### Service Discovery

#### `adt discovery [options]`

Discover available ADT services and endpoints.

**Options:**

- `-o, --output <file>` - Save output to file
  - `.xml` extension → Save raw discovery XML
  - `.json` extension → Parse and save as structured JSON

**Examples:**

```bash
# Display services in terminal
adt discovery

# Save raw XML
adt discovery -o discovery.xml

# Parse and save as JSON
adt discovery -o discovery.json
```

**Sample Output:**

```
📋 Available ADT Services:

📁 BOPF
  └─ Business Objects (/sap/bc/adt/bopf/businessobjects)
     Category: BusinessObjects
     Templates: 25 available

📁 Core Data Services
  └─ CDS Views (/sap/bc/adt/cds/views)
     Category: CDSViews
     Templates: 8 available
```

## Authentication Flow

The CLI uses OAuth 2.0 with PKCE (Proof Key for Code Exchange) for secure authentication:

1. **Login Command** - Starts a local callback server
2. **Browser Opens** - Redirects to BTP login page
3. **User Authentication** - Login with your BTP credentials
4. **Token Exchange** - CLI receives and stores access/refresh tokens
5. **Automatic Refresh** - Tokens are refreshed automatically when needed

## Configuration

Authentication tokens are stored in your system's configuration directory:

- **Linux/macOS:** `~/.config/adt-cli/`
- **Windows:** `%APPDATA%/adt-cli/`

## Error Handling

Common issues and solutions:

### Authentication Errors

```bash
❌ Authentication failed: invalid_client
```

**Solution:** Check your service key file format and credentials.

### Discovery Errors

```bash
❌ Discovery failed: 401 Unauthorized
```

**Solution:** Re-authenticate with `adt auth login --file <path>`.

### Network Errors

```bash
❌ Connection refused
```

**Solution:** Check your network connection and BTP instance URL.

## Development

### Building from Source

```bash
git clone <repository-url>
cd packages/adt-cli
npm install
npm run build
```

### Running Tests

```bash
npm test
```

## API Reference

The CLI provides programmatic access to its functionality:

```typescript
import { AuthManager } from '@abapify/adt-cli';

const authManager = new AuthManager();
const session = authManager.getAuthenticatedSession();
const token = await authManager.getValidToken();
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Related Projects

- [@abapify/btp-service-key-parser](../btp-service-key-parser) - Parse BTP service keys
- [SAP ADT Documentation](https://help.sap.com/docs/ABAP_PLATFORM_NEW/c238d694b825421f940829321ffa326a/4ec8641126391014adc9fffe4e204223.html)

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.
