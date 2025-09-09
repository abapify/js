import { ConnectionManager } from './connection-manager.js';

export class SessionManager {
  private connectionManager?: ConnectionManager;
  private sessionValid: boolean = false;
  private lastValidation?: Date;
  private validationInterval: number = 5 * 60 * 1000; // 5 minutes

  async initialize(connectionManager: ConnectionManager): Promise<void> {
    this.connectionManager = connectionManager;
    await this.validateSession();
  }

  async cleanup(): Promise<void> {
    this.sessionValid = false;
    this.lastValidation = undefined;
    this.connectionManager = undefined;
  }

  isValid(): boolean {
    // Check if we need to revalidate the session
    if (this.lastValidation) {
      const now = new Date();
      const timeSinceValidation = now.getTime() - this.lastValidation.getTime();
      if (timeSinceValidation > this.validationInterval) {
        // Session might be stale, trigger async validation
        this.validateSession().catch(() => {
          this.sessionValid = false;
        });
      }
    }

    return this.sessionValid;
  }

  private async validateSession(): Promise<void> {
    if (!this.connectionManager) {
      this.sessionValid = false;
      return;
    }

    try {
      // Make a lightweight request to validate the session
      // Using the discovery service as it's a simple endpoint
      const response = await this.connectionManager.request(
        '/sap/bc/adt/discovery'
      );
      this.sessionValid = response.ok;
      this.lastValidation = new Date();
    } catch (error) {
      this.sessionValid = false;
      this.lastValidation = undefined;
    }
  }
}
