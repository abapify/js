import { Command } from 'commander';
import type { TransportSourceManifest } from '@abapify/adk';
import { getAdtClientV2 } from '../../../utils/adt-client-v2';
import { parseTransportNumbers } from '../../../utils/command-helpers';
import { ExactSourceHistoryService } from '../../../services/source-history';

type AdtClient = Awaited<ReturnType<typeof getAdtClientV2>>;
type SourceManifestServicePort = Pick<
  ExactSourceHistoryService,
  'buildTransportManifest'
>;

export interface SourceManifestCommandDependencies {
  getClient: () => Promise<AdtClient>;
  createService: (client: AdtClient) => SourceManifestServicePort;
  writeLine: (content: string) => void;
  writeError: (content: string) => void;
  setExitCode: (code: number) => void;
}

const DEFAULT_DEPENDENCIES: SourceManifestCommandDependencies = {
  getClient: getAdtClientV2,
  createService: (client) => new ExactSourceHistoryService(client),
  writeLine: (content) => console.log(content),
  writeError: (content) => console.error(content),
  setExitCode: (code) => {
    process.exitCode = code;
  },
};

function commandDependencies(
  overrides: Partial<SourceManifestCommandDependencies>,
): SourceManifestCommandDependencies {
  return { ...DEFAULT_DEPENDENCIES, ...overrides };
}

function formatManifest(manifest: TransportSourceManifest): string[] {
  const lines = [
    `Transport source manifest for ${manifest.requestedTransports.join(', ')}`,
    `Scope: ${manifest.scopeTransports.join(', ')}`,
  ];

  if (manifest.entries.length === 0) {
    lines.push('No source components found.');
    return lines;
  }

  for (const entry of manifest.entries) {
    const exactness = entry.exact ? 'exact' : 'not exact';
    const identity = `${entry.object.pgmid}/${entry.object.type} ${entry.object.name}`;
    lines.push(
      `${entry.changeKind} (${exactness}): ${identity} [${entry.component.id}] via ${entry.sourceTransport}`,
    );
    if (entry.diagnostic) {
      lines.push(`  [${entry.diagnostic.code}] ${entry.diagnostic.message}`);
    }
  }

  const counts = new Map<string, number>();
  for (const entry of manifest.entries) {
    counts.set(entry.changeKind, (counts.get(entry.changeKind) ?? 0) + 1);
  }
  lines.push(
    `Summary: ${[...counts.entries()]
      .map(([state, count]) => `${state}=${count}`)
      .join(', ')}`,
  );

  return lines;
}

function safeErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Unknown transport source-manifest error.';
}

/** Create `adt cts tr source-manifest` with injectable delivery concerns. */
export function createCtsSourceManifestCommand(
  overrides: Partial<SourceManifestCommandDependencies> = {},
): Command {
  const dependencies = commandDependencies(overrides);

  return new Command('source-manifest')
    .description(
      'Build a metadata-only exact source manifest for one or more transports',
    )
    .argument(
      '<transport>',
      'Transport number or comma-separated ordered transport set',
    )
    .option(
      '--also-transport <numbers>',
      'Additional comma-separated transport numbers',
    )
    .option('--json', 'Output the complete manifest as JSON')
    .action(
      async (
        transport: string,
        options: { alsoTransport?: string; json?: boolean },
      ) => {
        try {
          const transports = parseTransportNumbers(
            [transport, options.alsoTransport].filter(Boolean).join(','),
          );
          const client = await dependencies.getClient();
          const service = dependencies.createService(client);
          const manifest = await service.buildTransportManifest({ transports });

          if (options.json) {
            dependencies.writeLine(JSON.stringify(manifest, null, 2));
          } else {
            for (const line of formatManifest(manifest)) {
              dependencies.writeLine(line);
            }
          }

          if (manifest.entries.some((entry) => entry.changeKind === 'failed')) {
            dependencies.setExitCode(1);
          }
        } catch (error) {
          dependencies.writeError(
            `Transport source-manifest failed: ${safeErrorMessage(error)}`,
          );
          dependencies.setExitCode(1);
        }
      },
    );
}

export const ctsSourceManifestCommand = createCtsSourceManifestCommand();
