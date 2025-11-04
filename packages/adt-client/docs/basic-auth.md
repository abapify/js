# Basic Authentication for On-Premise SAP Systems

## Overview

The ADT Client now supports Basic Authentication for connecting to on-premise SAP S/4HANA systems. This authentication method uses username and password credentials, making it ideal for on-premise deployments that don't use OAuth.

## Usage

### Programmatic API

```typescript
import { AuthManager } from '@abapify/adt-client';

const authManager = new AuthManager();

// Login with Basic Auth
await authManager.loginBasic(
  'USERNAME',
  'PASSWORD',  
  'sap-host.company.com',
  '100' // SAP client (optional)
);

// Get auth token for requests
const token = await authManager.getValidToken();

// Check auth type
const authType = authManager.getAuthType(); // Returns 'basic' | 'oauth' | null
```

### CLI Usage

```bash
# Login with Basic Auth
adt auth login --username $SAP_USER --password $SAP_PASSWORD --host $SAP_HOST

# Or with all parameters
adt auth login \
  --username myuser \
  --password mypass \
  --host sap.company.com \
  --client 100
```

## Authentication Types

| Type | Use Case | Authentication Flow |
|------|----------|-------------------|
| **Basic Auth** | On-premise S/4HANA | Username + Password |
| **OAuth 2.0** | SAP BTP | Service Key + Browser flow |

## Security Considerations

- Credentials are stored in `~/.adt/auth.json`
- This file should have restricted permissions (600)
- Never commit credentials to version control
- Use environment variables in CI/CD pipelines
- Consider using secret management tools

## Session Management

- Basic Auth sessions are persistent until logout
- No token expiration (credentials used for each request)
- OAuth sessions auto-refresh tokens
- Use `adt auth logout` to clear stored credentials

## Environment Variables

```bash
# For automated scripts
export SAP_USER=your_username
export SAP_PASSWORD=your_password
export SAP_HOST=sap.company.com
export SAP_CLIENT=100

# Then use in commands
adt auth login --username $SAP_USER --password $SAP_PASSWORD --host $SAP_HOST
```

## Examples

### Development Workflow

```bash
# 1. Login once
adt auth login --username dev_user --password xxx --host sap-dev.local

# 2. Use ADT commands (credentials cached)
adt transport list
adt import package ZTEST ./output
adt atc run --package ZTEST

# 3. Logout when done
adt auth logout
```

### CI/CD Pipeline

```yaml
script:
  - adt auth login --username $SAP_USER --password $SAP_PASSWORD --host $SAP_HOST
  - adt transport get $TRANSPORT_ID
  - adt atc run --transport $TRANSPORT_ID
```

## Troubleshooting

### Authentication Failed

```
Error: Authentication failed. Please check your credentials.
```

**Solutions:**
- Verify username and password
- Check SAP host is reachable
- Ensure SAP client exists
- Verify user has ADT authorization

### Session Not Found

```
Error: Not authenticated. Run "adt auth login" first.
```

**Solution:** Login again with credentials

## Migration from OAuth

If you're switching from OAuth (BTP) to Basic Auth (on-premise):

```bash
# Clear existing OAuth session
adt auth logout

# Login with Basic Auth
adt auth login --username $SAP_USER --password $SAP_PASSWORD --host $SAP_HOST
```

## API Reference

### AuthManager.loginBasic()

```typescript
async loginBasic(
  username: string,
  password: string,
  host: string,
  client?: string
): Promise<void>
```

Authenticates with Basic Auth and stores session.

**Parameters:**
- `username`: SAP username
- `password`: SAP password
- `host`: SAP system hostname (without protocol)
- `client`: SAP client number (optional, defaults to connection client)

**Throws:** 
- `Error` if authentication fails

### AuthManager.getAuthType()

```typescript
getAuthType(): 'oauth' | 'basic' | null
```

Returns the current authentication type.

### AuthManager.getBasicAuthCredentials()

```typescript
getBasicAuthCredentials(): BasicAuthCredentials | null
```

Returns stored Basic Auth credentials (for advanced use cases).

## Related Documentation

- [ADT CLI Specification](../../docs/specs/adt-cli/README.md)
- [OAuth Authentication](./oauth-auth.md)
- [Connection Management](./connection.md)

