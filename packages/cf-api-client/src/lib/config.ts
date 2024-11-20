import { readFile } from 'fs/promises';
import { homedir } from 'os';
import path from 'path';

// Define the expected structure of the Cloud Foundry config
interface CloudFoundryConfig {
  AccessToken: string;
  APIVersion: string;
  AsyncTimeout: number;
  AuthorizationEndpoint: string;
  CFOnK8s: {
    Enabled: boolean;
    AuthInfo: string;
  };
  ColorEnabled: string;
  ConfigVersion: number;
  DopplerEndPoint: string;
  Locale: string;
  LogCacheEndPoint: string;
  MinCLIVersion: string;
  MinRecommendedCLIVersion: string;
  NetworkPolicyV1Endpoint: string;
  OrganizationFields: {
    GUID: string;
    Name: string;
  };
  PluginRepos: Array<{
    Name: string;
    URL: string;
  }>;
  RefreshToken: string;
  RoutingAPIEndpoint: string;
  SpaceFields: {
    GUID: string;
    Name: string;
    AllowSSH: boolean;
  };
  SSHOAuthClient: string;
  SSLDisabled: boolean;
  Target: string;
  Trace: string;
  UaaEndpoint: string;
  UAAGrantType: string;
  UAAOAuthClient: string;
  UAAOAuthClientSecret: string;
}

// Function to return the parsed and typed config
export async function readCfConfig() {
  // Simply return the imported JSON

  const file = await readFile(path.join(homedir(), `/.cf/config.json`), 'utf8');
  const cfConfig = JSON.parse(file.toString()) as CloudFoundryConfig;

  return cfConfig;
}
