import { join } from 'path';
import { homedir } from 'os';

// Auth session storage
export const AUTH_CONFIG_DIR = join(homedir(), '.adt');
export const AUTH_CONFIG_FILE = join(AUTH_CONFIG_DIR, 'config.json');

// OAuth configuration
export const OAUTH_REDIRECT_URI = 'http://localhost:3000/callback';
export const OAUTH_TIMEOUT_MS = 300000; // 5 minutes
export const CALLBACK_SERVER_PORT = 3000;
