/**
 * Include Loader - Populate ClassInclude.content with lazy loaders
 *
 * This module provides utilities for adding lazy loading support to class includes.
 * It uses ADK's createCachedLazyLoader to fetch include content on demand.
 */

import { createCachedLazyLoader, type Class } from '@abapify/adk';
import type { ConnectionManager } from '../../client/connection-manager';
import { createLogger } from '../../utils/logger';

/**
 * Add lazy loading to class includes
 *
 * Populates the `content` property of each ClassInclude with a lazy loader
 * that fetches the include content from SAP when first accessed.
 *
 * @param classObject - ADK Class object with includes
 * @param connectionManager - Connection manager for fetching content
 * @param logger - Optional logger
 * @returns The same class object with lazy loaders added
 */
export function addLazyLoadingToIncludes(
  classObject: Class,
  connectionManager: ConnectionManager,
  logger?: any
): Class {
  const log = logger || createLogger('include-loader');

  // Check if class has includes
  if (!classObject.spec.include || classObject.spec.include.length === 0) {
    log.debug(`Class ${classObject.name} has no includes`);
    return classObject;
  }

  log.debug(
    `Adding lazy loading to ${classObject.spec.include.length} includes for class ${classObject.name}`
  );

  // Add lazy loader to each include
  for (const include of classObject.spec.include) {
    if (!include.sourceUri) {
      log.warn(
        `Include ${include.includeType} has no sourceUri, skipping lazy loading`
      );
      continue;
    }

    // Create cached lazy loader for this include
    include.content = createCachedLazyLoader(async () => {
      log.debug(
        `Fetching include content: ${include.includeType} from ${include.sourceUri}`
      );

      try {
        const response = await connectionManager.request(include.sourceUri, {
          method: 'GET',
          headers: {
            Accept: 'text/plain',
          },
        });

        const content = await response.text();
        log.debug(
          `Successfully fetched ${content.length} bytes for include ${include.includeType}`
        );

        return content;
      } catch (error) {
        log.error(
          `Failed to fetch include ${include.includeType} from ${include.sourceUri}:`,
          error
        );
        throw new Error(
          `Failed to fetch include ${include.includeType}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    });
  }

  return classObject;
}

/**
 * Fetch all include content immediately (no lazy loading)
 *
 * Useful for scenarios where you need all content upfront.
 *
 * @param classObject - ADK Class object with includes
 * @param connectionManager - Connection manager for fetching content
 * @param logger - Optional logger
 * @returns Promise that resolves when all includes are fetched
 */
export async function fetchAllIncludes(
  classObject: Class,
  connectionManager: ConnectionManager,
  logger?: any
): Promise<Class> {
  const log = logger || createLogger('include-loader');

  if (!classObject.spec.include || classObject.spec.include.length === 0) {
    return classObject;
  }

  log.debug(
    `Fetching all ${classObject.spec.include.length} includes for class ${classObject.name}`
  );

  // Fetch all includes in parallel
  const fetchPromises = classObject.spec.include.map(async (include) => {
    if (!include.sourceUri) {
      return;
    }

    try {
      const response = await connectionManager.request(include.sourceUri, {
        method: 'GET',
        headers: {
          Accept: 'text/plain',
        },
      });

      include.content = await response.text();
    } catch (error) {
      log.error(
        `Failed to fetch include ${include.includeType}:`,
        error
      );
      throw error;
    }
  });

  await Promise.all(fetchPromises);

  log.debug(`Successfully fetched all includes for class ${classObject.name}`);
  return classObject;
}
