/**
 * ATC Plugin Implementation
 */

import type { AtcCheckOptions, AtcRunResult, AtcVariant } from './types';

/**
 * ABAP Test Cockpit (ATC) Plugin
 * 
 * Provides integration with SAP's ATC for static code analysis
 */
export class AtcPlugin {
  static readonly pluginName = 'atc';

  /**
   * Run ATC checks on specified objects
   */
  async runChecks(_options: AtcCheckOptions): Promise<AtcRunResult> {
    // TODO: Implement ATC check execution
    throw new Error('Not implemented');
  }

  /**
   * Get findings from a previous ATC run
   */
  async getFindings(_runId: string): Promise<AtcRunResult> {
    // TODO: Implement findings retrieval
    throw new Error('Not implemented');
  }

  /**
   * List available ATC check variants
   */
  async getVariants(): Promise<AtcVariant[]> {
    // TODO: Implement variant listing
    throw new Error('Not implemented');
  }
}
