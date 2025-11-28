/**
 * Simple console logger with colors
 */

import chalk from 'chalk';

export interface Logger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  success(message: string): void;
}

export class ConsoleLogger implements Logger {
  info(message: string): void {
    console.log(chalk.blue('ℹ'), message);
  }

  warn(message: string): void {
    console.log(chalk.yellow('⚠'), message);
  }

  error(message: string): void {
    console.log(chalk.red('✖'), message);
  }

  success(message: string): void {
    console.log(chalk.green('✓'), message);
  }
}
