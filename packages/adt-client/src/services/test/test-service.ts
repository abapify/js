import { createLogger } from '../../utils/logger.js';
import type { Logger } from '../../utils/logger.js';

export class TestService {
  private logger: Logger;

  constructor(logger?: Logger) {
    this.logger = logger || createLogger('test');
  }

  async performTestOperation(name: string): Promise<string> {
    this.logger.info(`Starting test operation for: ${name}`);

    // Simulate some work with different log levels
    this.logger.debug(`Processing ${name} - step 1`);

    await new Promise((resolve) => setTimeout(resolve, 100));

    this.logger.debug(`Processing ${name} - step 2`);

    const result = `Test completed for ${name}`;
    this.logger.info(`Test operation completed successfully`);

    return result;
  }

  async performComplexOperation(): Promise<void> {
    this.logger.info('Starting complex operation');

    // Create child logger for sub-operation
    const subLogger = this.logger.child({ subcomponent: 'validator' });
    subLogger.debug('Validating input parameters');
    subLogger.info('Validation passed');

    // Another sub-operation
    const processorLogger = this.logger.child({ subcomponent: 'processor' });
    processorLogger.debug('Initializing processor');
    processorLogger.info('Processing data');
    processorLogger.warn('Non-critical warning during processing');

    this.logger.info('Complex operation completed');
  }
}
