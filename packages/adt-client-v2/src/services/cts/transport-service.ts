/**
 * CTS Transport Service
 * 
 * High-level service for transport management operations.
 * Provides normalized types and business logic on top of raw ADT contracts.
 * 
 * Flow:
 * 1. GET /searchconfiguration/configurations → get config ID
 * 2. GET /transportrequests?targets=true&configUri=<encoded-path> → get transports
 */

import { AdtClientType } from '../../client';
import type { Logger } from '../../types';
import type { TransportRequest, TransportTask, TransportObject } from './types';

// Raw types from the schema (internal use)
interface RawAbapObject {
  pgmid?: string;
  type?: string;
  name?: string;
  wbtype?: string;
  uri?: string;
  obj_info?: string;
  obj_desc?: string;
}

interface RawTask {
  number?: string;
  owner?: string;
  desc?: string;
  status?: string;
  abap_object?: RawAbapObject | RawAbapObject[];
}

interface RawRequest {
  number?: string;
  owner?: string;
  desc?: string;
  status?: string;
  uri?: string;
  task?: RawTask | RawTask[];
  abap_object?: RawAbapObject | RawAbapObject[];
}

/**
 * Normalize raw objects to TransportObject[]
 */
function normalizeObjects(raw: RawAbapObject | RawAbapObject[] | undefined): TransportObject[] {
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr.map(obj => ({
    pgmid: obj.pgmid,
    type: obj.type,
    name: obj.name,
    wbtype: obj.wbtype,
    uri: obj.uri,
    obj_info: obj.obj_info,
    obj_desc: obj.obj_desc,
  }));
}

/**
 * Normalize raw task to TransportTask
 */
function normalizeTask(raw: RawTask): TransportTask {
  return {
    number: raw.number,
    owner: raw.owner,
    desc: raw.desc,
    status: raw.status,
    objects: normalizeObjects(raw.abap_object),
  };
}

/**
 * Normalize raw request to TransportRequest
 */
function normalizeRequest(raw: RawRequest): TransportRequest {
  const tasks = raw.task 
    ? (Array.isArray(raw.task) ? raw.task : [raw.task]).map(normalizeTask)
    : [];
  
  // Collect all objects from request and tasks
  const requestObjects = normalizeObjects(raw.abap_object);
  const taskObjects = tasks.flatMap(t => t.objects);
  
  return {
    number: raw.number || '',
    owner: raw.owner,
    desc: raw.desc,
    status: raw.status,
    uri: raw.uri,
    tasks,
    objects: [...requestObjects, ...taskObjects],
  };
}

/**
 * Collect all requests from the transport response structure
 * The schema has requests in multiple places:
 * - workbench.modifiable.request[]
 * - workbench.relstarted.request[]
 * - workbench.released.request[]
 * - workbench.target[].modifiable.request[]
 * - customizing.* (same structure)
 */
function collectAllRequests(result: unknown): RawRequest[] {
  const requests: RawRequest[] = [];
  
  if (!result || typeof result !== 'object') return requests;
  
  const data = result as Record<string, unknown>;
  
  // Helper to extract requests from a container (modifiable, relstarted, released)
  const extractFromContainer = (container: unknown) => {
    if (!container || typeof container !== 'object') return;
    const c = container as Record<string, unknown>;
    const reqs = c.request;
    if (reqs) {
      const reqArray = Array.isArray(reqs) ? reqs : [reqs];
      requests.push(...(reqArray as RawRequest[]));
    }
  };
  
  // Helper to process workbench or customizing section
  const processSection = (section: unknown) => {
    if (!section || typeof section !== 'object') return;
    const s = section as Record<string, unknown>;
    
    // Direct containers
    extractFromContainer(s.modifiable);
    extractFromContainer(s.relstarted);
    extractFromContainer(s.released);
    
    // Target-specific containers
    const targets = s.target;
    if (targets) {
      const targetArray = Array.isArray(targets) ? targets : [targets];
      for (const target of targetArray) {
        if (target && typeof target === 'object') {
          const t = target as Record<string, unknown>;
          extractFromContainer(t.modifiable);
          extractFromContainer(t.relstarted);
          extractFromContainer(t.released);
        }
      }
    }
  };
  
  processSection(data.workbench);
  processSection(data.customizing);
  
  return requests;
}

/**
 * Create CTS Transport Service
 * 
 * @param adtClient - The speci-generated ADT client (client.adt from createAdtClient)
 * @param logger - Optional logger for debug output
 */
export function createTransportService(adtClient: AdtClientType, logger?: Logger) {
  // Cache config URI to avoid repeated lookups
  let cachedConfigUri: string | undefined;

  /**
   * Get search configuration URI (cached)
   */
  async function getConfigUri(): Promise<string> {
    if (cachedConfigUri) return cachedConfigUri;

    logger?.debug('Fetching search configuration...');
    const response = await adtClient.cts.transportrequests.searchconfiguration.configurations.get();
    
    const configs = response?.configuration;
    if (!configs) {
      throw new Error('No search configuration found');
    }
    
    const configArray = Array.isArray(configs) ? configs : [configs];
    
    if (configArray.length === 0) {
      throw new Error('No search configuration found');
    }
    
    const firstConfig = configArray[0];
    const uri = firstConfig?.link?.href;
    
    if (!uri) {
      throw new Error('No search configuration URI found');
    }
    
    cachedConfigUri = uri;
    logger?.debug('Config URI:', uri);
    return uri;
  }

  /**
   * Fetch raw transport data from ADT
   */
  async function fetchRawTransports() {
    const configUri = await getConfigUri();
    
    logger?.debug('Fetching transports with config...');
    return adtClient.cts.transportrequests.get({
      targets: 'true',
      configUri: configUri,
    });
  }

  return {
    /**
     * List all transports (raw response)
     * @returns Raw transport response from ADT
     */
    async listRaw() {
      return fetchRawTransports();
    },

    /**
     * List all transports with normalized structure
     * @returns Array of normalized TransportRequest objects
     */
    async list(): Promise<TransportRequest[]> {
      const response = await fetchRawTransports();
      const rawRequests = collectAllRequests(response);
      return rawRequests.map(normalizeRequest);
    },

    /**
     * Get a specific transport by number
     * @param transportNumber - Transport number (e.g., S0DK921630)
     * @returns TransportRequest or null if not found
     */
    async get(transportNumber: string): Promise<TransportRequest | null> {
      logger?.debug(`Getting transport ${transportNumber}...`);
      
      const transports = await this.list();
      
      // Find matching transport (case-insensitive)
      const found = transports.find(
        t => t.number.toUpperCase() === transportNumber.toUpperCase()
      );
      
      if (!found) {
        logger?.debug(`Transport ${transportNumber} not found in ${transports.length} transports`);
        return null;
      }
      
      logger?.debug(`Found transport ${transportNumber}`);
      return found;
    },

    /**
     * Clear cached configuration (force refresh)
     */
    clearCache() {
      cachedConfigUri = undefined;
    },
  };
}

export type TransportService = ReturnType<typeof createTransportService>;
