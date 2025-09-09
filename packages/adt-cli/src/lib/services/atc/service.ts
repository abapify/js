import { adtClient } from '../../shared/clients';
import type { AtcOptions, AtcResult } from '@abapify/adt-client';

export class AtcService {
  constructor() {}

  async runAtcCheck(options: AtcOptions): Promise<AtcResult> {
    // Set debug mode globally on client for proper CSRF handling
    adtClient.setDebugMode(options.debug || false);

    if (options.debug) {
      console.log(
        `🔍 Starting ATC workflow for ${options.target}: ${options.targetName}`
      );
      console.log(
        `🎯 Using check variant: ${
          options.checkVariant || 'ABAP_CLOUD_DEVELOPMENT_DEFAULT'
        }`
      );
    } else {
      process.stdout.write('⏳ Analyzing code');
    }

    try {
      // Use the client's ATC service for core operations
      const result = await adtClient.atc.run(options);

      if (!options.debug) {
        // Clear progress line
        process.stdout.write('\r\x1b[K');
      }

      if (options.debug) {
        console.log(
          `✅ ATC analysis complete: ${result.totalFindings} findings`
        );
      }

      return result;
    } catch (error) {
      if (!options.debug) {
        // Clear progress line on error too
        process.stdout.write('\r\x1b[K');
      }

      throw new Error(
        `ATC workflow failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
