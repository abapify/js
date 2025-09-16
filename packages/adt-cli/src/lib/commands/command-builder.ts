import { Command } from 'commander';
import { PluginManager } from '../plugins/plugin-manager';

export interface DynamicCommandOptions {
  name: string;
  description: string;
  arguments?: Array<{
    name: string;
    description: string;
    required?: boolean;
  }>;
  options?: Array<{
    flags: string;
    description: string;
    defaultValue?: any;
    choices?: string[];
  }>;
  action: (args: any[], options: any, command: Command) => Promise<void>;
}

export class CommandBuilder {
  private pluginManager = PluginManager.getInstance();

  /**
   * Build a command with dynamic format options
   */
  async buildCommand(config: DynamicCommandOptions): Promise<Command> {
    const command = new Command(config.name);
    command.description(config.description);

    // Add arguments
    if (config.arguments) {
      for (const arg of config.arguments) {
        if (arg.required) {
          command.argument(`<${arg.name}>`, arg.description);
        } else {
          command.argument(`[${arg.name}]`, arg.description);
        }
      }
    }

    // Add static options first
    if (config.options) {
      for (const option of config.options) {
        if (option.choices) {
          command.option(option.flags, option.description, option.defaultValue);
          // Note: commander.js choices() method would be called here if available
        } else {
          command.option(option.flags, option.description, option.defaultValue);
        }
      }
    }

    // Load plugins and add dynamic format option
    await this.pluginManager.loadPluginsFromConfig();
    const availableFormats = this.pluginManager.getAvailableFormats();
    const defaultFormat = await this.pluginManager.getDefaultFormat();

    if (availableFormats.length > 0) {
      const formatDescription = this.buildFormatDescription(
        availableFormats,
        defaultFormat
      );
      const formatOption = defaultFormat
        ? `--format <format>`
        : `--format <format>`;

      command.option(formatOption, formatDescription, defaultFormat);
    }

    // Set up the action
    command.action(async (...args) => {
      const options = args[args.length - 2]; // Second to last is options
      const cmd = args[args.length - 1]; // Last is command

      // Handle dynamic format loading if @package/plugin syntax is used
      if (options.format && options.format.startsWith('@')) {
        try {
          await this.pluginManager.loadPlugin(options.format);
          // Update the format to use short name
          options.format = this.pluginManager.getShortName(options.format);
        } catch (error) {
          console.error(
            `❌ Failed to load format plugin: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
          process.exit(1);
        }
      }

      // Validate format selection
      if (options.format && !this.pluginManager.getPlugin(options.format)) {
        const available = this.pluginManager.getAvailableFormats();
        console.error(
          `❌ Unknown format '${options.format}'. Available: ${available.join(
            ', '
          )}`
        );
        process.exit(1);
      }

      // Require format selection if multiple plugins available and no default
      if (!options.format && this.pluginManager.isFormatSelectionRequired()) {
        const available = this.pluginManager.getAvailableFormats();
        console.error(
          `❌ Format selection required. Available formats: ${available.join(
            ', '
          )}`
        );
        console.error(
          `   Use --format <format> or configure a default format in adt.config.yaml`
        );
        process.exit(1);
      }

      // Set default format if only one available
      if (!options.format) {
        options.format = await this.pluginManager.getDefaultFormat();
      }

      await config.action(args.slice(0, -2), options, cmd);
    });

    return command;
  }

  /**
   * Build format description with available options
   */
  private buildFormatDescription(
    availableFormats: string[],
    defaultFormat?: string
  ): string {
    let desc = `Output format. Available: ${availableFormats.join(', ')}`;

    if (defaultFormat) {
      desc += `. Default: ${defaultFormat}`;
    }

    desc += `. Supports @package/plugin syntax for dynamic loading`;

    return desc;
  }

  /**
   * Get short name from full plugin name (exposed for action handlers)
   */
  getShortName(pluginName: string): string {
    if (pluginName.startsWith('@abapify/')) {
      return pluginName.replace('@abapify/', '');
    }
    if (pluginName.startsWith('@')) {
      const parts = pluginName.split('/');
      return parts[parts.length - 1];
    }
    return pluginName;
  }
}
