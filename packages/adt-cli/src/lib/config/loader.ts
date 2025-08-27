import { AdtConfig, AdtConfigFile } from './types';
import { pathToFileURL } from 'url';

export class ConfigLoader {
  private static cache = new Map<string, AdtConfig>();

  static async load(configPath?: string): Promise<AdtConfig> {
    const fs = require('fs');
    const path = require('path');

    // Determine config file path
    const resolvedPath = configPath || this.findConfigFile();

    if (!resolvedPath || !fs.existsSync(resolvedPath)) {
      // Return empty config if no config file found
      return {};
    }

    // Check cache first
    if (this.cache.has(resolvedPath)) {
      return this.cache.get(resolvedPath)!;
    }

    try {
      // Load TypeScript config file
      const configUrl = pathToFileURL(resolvedPath).href;
      const configModule: AdtConfigFile = await import(configUrl);

      const config = configModule.default || {};

      // Cache the result
      this.cache.set(resolvedPath, config);

      return config;
    } catch (error) {
      throw new Error(
        `Failed to load config from ${resolvedPath}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private static findConfigFile(): string | null {
    const fs = require('fs');
    const path = require('path');

    // Look for adt.config.ts in current directory and parent directories
    let currentDir = process.cwd();
    const root = path.parse(currentDir).root;

    while (currentDir !== root) {
      const configPath = path.join(currentDir, 'adt.config.ts');
      if (fs.existsSync(configPath)) {
        return configPath;
      }
      currentDir = path.dirname(currentDir);
    }

    return null;
  }

  static clearCache(): void {
    this.cache.clear();
  }
}
