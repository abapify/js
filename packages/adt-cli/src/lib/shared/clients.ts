// Shared client instances for all commands
import { AuthManager } from '../auth-manager';
import { ADTClient } from '../adt-client';

export const authManager = new AuthManager();
export const adtClient = new ADTClient(authManager);
