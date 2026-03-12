import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve, join } from 'node:path';
import { readServiceKey, type BTPServiceKey } from '@abapify/adt-auth';
import type { Destination } from '@abapify/adt-config';

export interface ServiceKeyDiscoveryResult {
  sid: string;
  keyFilePath: string;
  serviceKey: BTPServiceKey;
}

function getCandidateDirectories(): string[] {
  const cwd = process.cwd();
  const home = homedir();
  const envDir = process.env['ADT_SERVICE_KEY_DIR']?.trim();

  const candidates = [
    envDir,
    resolve(cwd, '.adt', 'destinations'),
    resolve(cwd, '.adt', 'service-keys'),
    resolve(cwd, '.adt', 'keys'),
    resolve(home, '.adt', 'destinations'),
    resolve(home, '.adt', 'service-keys'),
    resolve(home, '.adt', 'keys'),
  ].filter((value): value is string => Boolean(value));

  return [...new Set(candidates)];
}

function getCandidateFilesFromDir(dirPath: string): string[] {
  if (!existsSync(dirPath)) {
    return [];
  }

  try {
    const entries = readdirSync(dirPath, { withFileTypes: true });
    return entries
      .filter(
        (entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.json'),
      )
      .map((entry) => join(dirPath, entry.name))
      .sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

export function discoverServiceKeys(): ServiceKeyDiscoveryResult[] {
  const discoveredBySid = new Map<string, ServiceKeyDiscoveryResult>();

  for (const dirPath of getCandidateDirectories()) {
    const files = getCandidateFilesFromDir(dirPath);

    for (const filePath of files) {
      try {
        const serviceKey = readServiceKey(filePath);
        const sid = serviceKey.systemid?.toUpperCase();

        if (!sid || discoveredBySid.has(sid)) {
          continue;
        }

        discoveredBySid.set(sid, {
          sid,
          keyFilePath: filePath,
          serviceKey,
        });
      } catch {
        // Ignore invalid/non-service-key JSON files in drop-in folders.
      }
    }
  }

  return [...discoveredBySid.values()];
}

export function discoverServiceKeyDestinations(): Map<string, Destination> {
  const destinations = new Map<string, Destination>();

  for (const discovered of discoverServiceKeys()) {
    destinations.set(discovered.sid, {
      type: '@abapify/adt-auth/plugins/service-key',
      options: {
        url: discovered.serviceKey.url,
        serviceKey: discovered.serviceKey,
      },
    });
  }

  return destinations;
}

export function listDiscoveredServiceKeySids(): string[] {
  return discoverServiceKeys().map((entry) => entry.sid);
}
