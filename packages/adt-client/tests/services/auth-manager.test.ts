import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AuthManager } from '../../src/client/auth-manager';
import { existsSync, unlinkSync } from 'fs';
import { resolve } from 'path';

const TEST_AUTH_FILE = resolve('.adt-test', 'auth.json');

describe('AuthManager - Basic Authentication', () => {
  let authManager: AuthManager;

  beforeEach(() => {
    // Mock environment to use test directory
    process.env.HOME = '.adt-test';
    authManager = new AuthManager();
    
    // Clean up any existing test auth file
    if (existsSync(TEST_AUTH_FILE)) {
      unlinkSync(TEST_AUTH_FILE);
    }
  });

  afterEach(() => {
    // Cleanup
    authManager.clearSession();
    if (existsSync(TEST_AUTH_FILE)) {
      unlinkSync(TEST_AUTH_FILE);
    }
  });

  describe('loginBasic()', () => {
    it('should successfully login with Basic Auth credentials', async () => {
      await authManager.loginBasic(
        'testuser',
        'testpass',
        'sap-test.company.com',
        '100'
      );

      const authType = authManager.getAuthType();
      expect(authType).toBe('basic');
    });

    it('should store credentials securely', async () => {
      await authManager.loginBasic(
        'testuser',
        'testpass',
        'sap-test.company.com',
        '100'
      );

      const credentials = authManager.getBasicAuthCredentials();
      expect(credentials).toBeDefined();
      expect(credentials?.username).toBe('testuser');
      expect(credentials?.password).toBe('testpass');
      expect(credentials?.host).toBe('sap-test.company.com');
      expect(credentials?.client).toBe('100');
    });

    it('should work without client parameter', async () => {
      await authManager.loginBasic(
        'testuser',
        'testpass',
        'sap-test.company.com'
      );

      const credentials = authManager.getBasicAuthCredentials();
      expect(credentials).toBeDefined();
      expect(credentials?.client).toBeUndefined();
    });

    it('should persist session to disk', async () => {
      await authManager.loginBasic(
        'testuser',
        'testpass',
        'sap-test.company.com',
        '100'
      );

      // Create new AuthManager instance to verify persistence
      const newAuthManager = new AuthManager();
      const session = newAuthManager.loadSession();

      expect(session).toBeDefined();
      expect(session?.authType).toBe('basic');
      expect(session?.basicAuth?.username).toBe('testuser');
      expect(session?.basicAuth?.host).toBe('sap-test.company.com');
    });
  });

  describe('getValidToken()', () => {
    it('should return Basic Auth token in correct format', async () => {
      await authManager.loginBasic(
        'testuser',
        'testpass',
        'sap-test.company.com',
        '100'
      );

      const token = await authManager.getValidToken();
      expect(token).toBeDefined();
      
      // Basic Auth token should be base64 encoded "username:password"
      const expectedToken = Buffer.from('testuser:testpass').toString('base64');
      expect(token).toBe(expectedToken);
    });

    it('should handle special characters in credentials', async () => {
      await authManager.loginBasic(
        'test@user',
        'p@ssw0rd!',
        'sap-test.company.com'
      );

      const token = await authManager.getValidToken();
      const decoded = Buffer.from(token, 'base64').toString('utf8');
      
      expect(decoded).toBe('test@user:p@ssw0rd!');
    });
  });

  describe('getAuthType()', () => {
    it('should return null when not authenticated', () => {
      const authType = authManager.getAuthType();
      expect(authType).toBeNull();
    });

    it('should return "basic" after Basic Auth login', async () => {
      await authManager.loginBasic(
        'testuser',
        'testpass',
        'sap-test.company.com'
      );

      const authType = authManager.getAuthType();
      expect(authType).toBe('basic');
    });
  });

  describe('logout()', () => {
    it('should clear Basic Auth session', async () => {
      await authManager.loginBasic(
        'testuser',
        'testpass',
        'sap-test.company.com'
      );

      authManager.logout();

      const authType = authManager.getAuthType();
      expect(authType).toBeNull();
    });

    it('should remove session file from disk', async () => {
      await authManager.loginBasic(
        'testuser',
        'testpass',
        'sap-test.company.com'
      );

      authManager.logout();

      expect(existsSync(TEST_AUTH_FILE)).toBe(false);
    });
  });

  describe('Session Management', () => {
    it('should switch from OAuth to Basic Auth', async () => {
      // First login with Basic Auth
      await authManager.loginBasic(
        'testuser',
        'testpass',
        'sap-test.company.com'
      );

      expect(authManager.getAuthType()).toBe('basic');

      // Logout
      authManager.logout();

      // Login again with different credentials
      await authManager.loginBasic(
        'newuser',
        'newpass',
        'sap-prod.company.com'
      );

      expect(authManager.getAuthType()).toBe('basic');
      
      const credentials = authManager.getBasicAuthCredentials();
      expect(credentials?.username).toBe('newuser');
      expect(credentials?.host).toBe('sap-prod.company.com');
    });

    it('should handle multiple sessions correctly', async () => {
      await authManager.loginBasic(
        'user1',
        'pass1',
        'host1.com'
      );

      // Create second manager instance
      const authManager2 = new AuthManager();
      authManager2.loadSession();

      // Both should see same session
      expect(authManager.getAuthType()).toBe('basic');
      expect(authManager2.getAuthType()).toBe('basic');
      
      const creds1 = authManager.getBasicAuthCredentials();
      const creds2 = authManager2.getBasicAuthCredentials();
      
      expect(creds1?.username).toBe(creds2?.username);
      expect(creds1?.password).toBe(creds2?.password);
    });
  });

  describe('Error Handling', () => {
    it('should throw error when getting token without authentication', async () => {
      await expect(authManager.getValidToken()).rejects.toThrow();
    });

    it('should return null for credentials when not authenticated', () => {
      const credentials = authManager.getBasicAuthCredentials();
      expect(credentials).toBeNull();
    });

    it('should handle corrupted session file gracefully', async () => {
      // Write invalid JSON to auth file
      const fs = require('fs');
      fs.mkdirSync('.adt-test', { recursive: true });
      fs.writeFileSync(TEST_AUTH_FILE, 'invalid json');

      const session = authManager.loadSession();
      expect(session).toBeNull();
    });
  });

  describe('Base64 Encoding', () => {
    it('should correctly encode credentials', async () => {
      await authManager.loginBasic(
        'myuser',
        'mypassword',
        'sap.test.com'
      );

      const token = await authManager.getValidToken();
      
      expect(token).toMatch(/^[A-Za-z0-9+/=]+$/);
      
      // Decode and verify
      const decoded = Buffer.from(token, 'base64').toString('utf8');
      expect(decoded).toBe('myuser:mypassword');
    });

    it('should handle empty password', async () => {
      await authManager.loginBasic(
        'testuser',
        '',
        'sap.test.com'
      );

      const token = await authManager.getValidToken();
      const decoded = Buffer.from(token, 'base64').toString('utf8');
      
      expect(decoded).toBe('testuser:');
    });
  });
});

