import { Command } from 'commander';
import { createCliLogger } from './logger-config';
import type { Logger } from '@abapify/logger';

interface ErrorWithCode {
  code?: unknown;
}

interface ErrorWithStatus {
  status?: unknown;
}

/**
 * Extract global options from a command by traversing up to the root
 */
export function getGlobalOptions(command: Command): any {
  let rootCmd = command.parent || command;
  while (rootCmd.parent) {
    rootCmd = rootCmd.parent;
  }
  return rootCmd.opts();
}

/**
 * Create a logger for a command using global options
 */
export function createCommandLogger(command: Command): Logger {
  const globalOptions = getGlobalOptions(command);
  return createCliLogger({ verbose: globalOptions.verbose });
}

/**
 * Create a component-specific logger for a command
 */
export function createComponentLogger(
  command: Command,
  component: string,
): Logger {
  const logger = createCommandLogger(command);
  return logger.child({ component });
}

/**
 * Standard error handler for commands
 */
export function handleCommandError(error: unknown, operation: string): never {
  console.error(`❌ ${operation} failed:`, getErrorMessage(error));
  printErrorStack(error);
  process.exit(1);
}

/**
 * Extract a user-facing error message from unknown error values.
 */
export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Extract error code if present.
 */
export function getErrorCode(error: unknown): string | undefined {
  if (!(error instanceof Error)) {
    return undefined;
  }

  const code = (error as ErrorWithCode).code;
  if (typeof code === 'string' && code.length > 0) {
    return code;
  }

  return undefined;
}

/**
 * Extract HTTP status if present.
 */
export function getErrorStatus(error: unknown): string | undefined {
  if (!(error instanceof Error)) {
    return undefined;
  }

  const status = (error as ErrorWithStatus).status;
  if (typeof status === 'string' && status.length > 0) {
    return status;
  }
  if (typeof status === 'number') {
    return String(status);
  }

  return undefined;
}

/**
 * Print stack trace only when explicitly requested.
 */
export function printErrorStack(error: unknown): void {
  if (process.env['ADT_CLI_SHOW_STACK'] !== '1') {
    return;
  }

  if (error instanceof Error && error.stack) {
    console.error('\nStack trace:', error.stack);
  }
}
