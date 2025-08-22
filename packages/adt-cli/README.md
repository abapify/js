# ADT CLI

A command-line interface for SAP ABAP Development Tools (ADT) services, providing authentication and service discovery for BTP (Business Technology Platform) environments.

## Features

- 🔐 **OAuth Authentication** - Browser-based login using BTP service keys
- 🔍 **Service Discovery** - Discover available ADT services and endpoints
- 🚚 **Transport Management** - List and filter transport requests
- 💾 **Export Options** - Save discovery data as XML or JSON
- 🔄 **Automatic Re-authentication** - Seamless token renewal when expired
- 🚀 **Modern Architecture** - Built with TypeScript, service-oriented design, and fast-xml-parser

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

3. **List transport requests:**

   ```bash
   adt transport list
   ```

4. **Get transport details:**

   ```bash
   adt transport get TRLK907362
   ```

5. **Save discovery data:**

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

### Transport Requests

#### `adt transport get <tr-number> [options]` or `adt tr get <tr-number> [options]`

Get detailed information about a specific transport request or task.

**Options:**

- `--objects` - Include objects in the transport (future feature)
- `--tasks` - Include detailed task information
- `--full` - Show everything (objects + tasks)
- `--json` - Output as JSON
- `--debug` - Show debug output for parsing

**Examples:**

```bash
# Get transport request details
adt transport get TRLK907362

# Get task details (shows parent transport relationship)
adt transport get TRLK907363

# Include detailed task information
adt transport get TRLK907362 --tasks

# Export as JSON
adt transport get TRLK907362 --json

# Use alias
adt tr get TRLK907362
```

**Sample Output - Transport Request:**

```
🚚 Fetching transport request: TRLK907362

🚛 Transport Request: TRLK907362
   Description: one more request
   Status: modifiable
   Owner: CB9980003374
   Created: 8/22/2025, 9:45:09 AM
   Target: No target system
   Tasks: 1
```

**Sample Output - Task:**

```
🚚 Fetching transport request: TRLK907363

📋 Task: TRLK907363
   Description: one more request
   Status: modifiable
   Owner: CB9980003374
   Created: 8/22/2025, 9:45:10 AM
   Type: Unclassified
   Parent Transport: TRLK907362 (one more request)
```

#### `adt transport list [options]` or `adt tr list [options]`

List and filter transport requests assigned to users.

**Options:**

- `-u, --user <user>` - Filter by username
- `-s, --status <status>` - Filter by status (modifiable, released)
- `-m, --max <number>` - Maximum number of results (default: 50)
- `--debug` - Show debug output for API calls and parsing

**Examples:**

```bash
# List all transport requests
adt transport list

# List transport requests for specific user
adt transport list --user DEVELOPER01

# List only modifiable transport requests
adt transport list --status modifiable

# List maximum 10 transport requests
adt transport list --max 10

# Use alias for shorter command
adt tr list -u DEVELOPER01 -m 5

# Debug API calls and parsing
adt transport list --debug
```

**Sample Output:**

```
🚚 Fetching transport requests...

📋 Found 2 transport requests:

🚛 TRLK907362
   Description: one more request
   Status: modifiable
Owner: CB9980003374
Created: 8/22/2025
Tasks: 1

🚛 TRLK907354
   Description: New TR
   Status: modifiable
   Owner: CB9980003374
   Created: 8/22/2025
   Tasks: 1
```

## Authentication Flow

The CLI uses OAuth 2.0 with PKCE (Proof Key for Code Exchange) for secure authentication:

1. **Login Command** - Starts a local callback server
2. **Browser Opens** - Redirects to BTP login page
3. **User Authentication** - Login with your BTP credentials
4. **Token Exchange** - CLI receives and stores access/refresh tokens
5. **Automatic Re-authentication** - When tokens expire, CLI automatically opens browser to re-authenticate using stored service key

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

The CLI provides programmatic access to its functionality through service-oriented architecture:

### Authentication

```typescript
import { AuthManager } from '@abapify/adt-cli';

const authManager = new AuthManager();
const session = authManager.getAuthenticatedSession();
const token = await authManager.getValidToken();
```

### ADT Services

```typescript
import {
  ADTClient,
  TransportService,
  DiscoveryService,
} from '@abapify/adt-cli';

// Initialize client
const authManager = new AuthManager();
const adtClient = new ADTClient(authManager);

// Use transport service
const transportService = new TransportService(adtClient);
const transports = await transportService.listTransports({
  user: 'DEVELOPER01',
  maxResults: 10,
});

// Use discovery service
const discoveryService = new DiscoveryService(adtClient);
const services = await discoveryService.getDiscovery();
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Command Reference

| Command                        | Description                       |
| ------------------------------ | --------------------------------- |
| `adt auth login --file <path>` | Authenticate with BTP service key |
| `adt auth logout`              | Clear stored tokens               |
| `adt discovery`                | List available ADT services       |
| `adt discovery -o file.json`   | Export services as JSON           |
| `adt transport list`           | List transport requests           |
| `adt transport get <TR>`       | Get transport or task details     |
| `adt transport list -u USER`   | Filter by user                    |
| `adt tr get <TR> --tasks`      | Get with task details (alias)     |
| `adt transport list --debug`   | Show debug output                 |

## Related Projects

- [@abapify/btp-service-key-parser](../btp-service-key-parser) - Parse BTP service keys
- [SAP ADT Documentation](https://help.sap.com/docs/ABAP_PLATFORM_NEW/c238d694b825421f940829321ffa326a/4ec8641126391014adc9fffe4e204223.html)

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.
