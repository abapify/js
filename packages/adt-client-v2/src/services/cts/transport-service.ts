/**
 * CTS Transport Service
 * 
 * High-level service for transport management operations.
 * Provides normalized types and business logic on top of raw ADT contracts.
 * 
 * Architecture:
 * - Contracts: Pure HTTP endpoint definitions (no business logic)
 * - Service: Business logic, XML building, response normalization
 * 
 * Flow:
 * 1. GET /searchconfiguration/configurations → get config ID
 * 2. GET /transportrequests?targets=true&configUri=<encoded-path> → get transports
 */

import { AdtClientType } from '../../client';
import type { Logger } from '../../types';
import type { TransportRequest, TransportTask, TransportObject, LockHandle } from './types';



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
 * Fetch function type for raw HTTP requests
 * Returns string directly (already resolved)
 */
type FetchFn = (url: string, options?: { 
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}) => Promise<string>;

/**
 * Create CTS Transport Service
 * 
 * @param adtClient - The speci-generated ADT client (client.adt from createAdtClient)
 * @param fetchFn - Raw fetch function for endpoints without schema
 * @param logger - Optional logger for debug output
 */
export function createTransportService(
  adtClient: AdtClientType,
  fetchFn: FetchFn,
  logger?: Logger
) {
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
    return adtClient.cts.transportrequests.list({
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
     * Get a specific transport by number (direct API call)
     * @param trkorr - Transport number (e.g., S0DK921630)
     * @returns Raw transport response from ADT
     */
    async get(trkorr: string) {
      logger?.debug(`Getting transport ${trkorr}...`);
      const response = await adtClient.cts.transportrequests.get(trkorr);
      logger?.debug(`Got transport ${trkorr}`);
      return response;
    },

    /**
     * Create a new transport request
     * @param options - Transport creation options
     * @returns Created transport response
     */
    async create(options: {
      description: string;
      type?: 'K' | 'W';
      target?: string;
      project?: string;
      owner?: string;
    }) {
      logger?.debug('Creating transport...', options);
      
      // Get owner - use provided or auto-detect from system
      let owner = options.owner;
      if (!owner) {
        owner = await this.getCurrentUser();
        logger?.debug(`Auto-detected owner: ${owner}`);
      }
      
      // SAP ADT requires namespace-prefixed attributes (non-standard XML)
      // ts-xsd doesn't support this yet, so we build XML manually
      const escapeXml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      const xml = `<?xml version="1.0" encoding="UTF-8"?><tm:root xmlns:tm="http://www.sap.com/cts/adt/tm" tm:useraction="newrequest"><tm:request tm:desc="${escapeXml(options.description)}" tm:type="${options.type || 'K'}" tm:target="${options.target || 'LOCAL'}" tm:cts_project="${options.project || ''}"><tm:task tm:owner="${owner}"/></tm:request></tm:root>`;
      
      // Use raw fetch since schema serialization doesn't support prefixed attributes
      const responseXml = await fetchFn('/sap/bc/adt/cts/transportrequests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/vnd.sap.adt.transportorganizer.v1+xml',
          Accept: 'application/vnd.sap.adt.transportorganizer.v1+xml',
        },
        body: xml,
      });
      
      // Parse response - extract transport number from response XML
      // Response format: <tm:root ...><tm:request tm:number="S0DK123456" ...>
      const numberMatch = responseXml.match(/tm:number="([^"]+)"/);
      const descMatch = responseXml.match(/tm:desc="([^"]+)"/);
      const typeMatch = responseXml.match(/tm:type="([^"]+)"/);
      const targetMatch = responseXml.match(/tm:target="([^"]+)"/);
      
      const response = {
        request: {
          number: numberMatch?.[1] || '',
          desc: descMatch?.[1] || options.description,
          type: typeMatch?.[1] || options.type || 'K',
          target: targetMatch?.[1] || options.target || 'LOCAL',
        },
      };
      
      logger?.debug('Transport created');
      return response;
    },
    
    /**
     * Get current user from the system metadata
     */
    async getCurrentUser(): Promise<string> {
      logger?.debug('Detecting current user from metadata endpoint...');
      
      // Fetch metadata as raw XML and extract user
      // Using fetchFn because the schema parsing has issues with this endpoint
      const xmlContent = await fetchFn('/sap/bc/adt/cts/transportrequests/searchconfiguration/metadata', {
        headers: { Accept: 'application/vnd.sap.adt.configuration.metadata.v1+xml' },
      });
      
      // Parse the response to extract the actual user
      // Format: <configuration:property key="User" ...>USERNAME</configuration:property>
      const userMatch = xmlContent.match(/<configuration:property key="User"[^>]*>([^<]+)</);
      if (userMatch && userMatch[1]) {
        const detectedUser = userMatch[1].trim();
        logger?.debug(`Current user detected: ${detectedUser}`);
        return detectedUser;
      }
      
      throw new Error('Could not detect current user from metadata response');
    },

    /**
     * Update a transport request
     * @param trkorr - Transport number
     * @param data - Update data (schema-compliant)
     * @returns Updated transport response
     */
    async update(trkorr: string, data: unknown) {
      logger?.debug(`Updating transport ${trkorr}...`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await adtClient.cts.transportrequests.put(trkorr, data as any);
      logger?.debug(`Transport ${trkorr} updated`);
      return response;
    },

    /**
     * Delete a transport request
     * @param trkorr - Transport number
     */
    async delete(trkorr: string) {
      logger?.debug(`Deleting transport ${trkorr}...`);
      await adtClient.cts.transportrequests.delete(trkorr);
      logger?.debug(`Transport ${trkorr} deleted`);
    },

    /**
     * Release a transport request
     * @param trkorr - Transport number
     * @returns Release response
     */
    async release(trkorr: string) {
      logger?.debug(`Releasing transport ${trkorr}...`);
      
      // SAP ADT requires namespace-prefixed attributes (non-standard XML)
      // Use raw XML for release action
      const xml = `<?xml version="1.0" encoding="UTF-8"?><tm:root xmlns:tm="http://www.sap.com/cts/adt/tm" tm:useraction="release"/>`;
      
      await fetchFn(`/sap/bc/adt/cts/transportrequests/${trkorr}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/vnd.sap.adt.transportorganizer.v1+xml',
          Accept: 'application/vnd.sap.adt.transportorganizer.v1+xml',
        },
        body: xml,
      });
      
      logger?.debug(`Transport ${trkorr} released`);
      return { success: true };
    },

    /**
     * Lock a transport request for modification
     * @param trkorr - Transport number
     * @returns Lock handle for subsequent operations
     */
    async lock(trkorr: string): Promise<LockHandle> {
      logger?.debug(`Locking transport ${trkorr}...`);
      
      const response = await fetchFn(
        `/sap/bc/adt/cts/transportrequests/${trkorr}?_action=LOCK&accessMode=MODIFY`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/vnd.sap.as+xml',
            'Content-Type': 'application/xml',
          },
        }
      );
      
      // Parse lock handle from response
      const handleMatch = response.match(/<LOCK_HANDLE>([^<]+)<\/LOCK_HANDLE>/);
      if (!handleMatch?.[1]) {
        throw new Error(`Failed to acquire lock for ${trkorr} - no handle returned`);
      }
      
      const lockHandle: LockHandle = { handle: handleMatch[1] };
      logger?.debug(`Transport ${trkorr} locked`, { handle: lockHandle.handle });
      return lockHandle;
    },

    /**
     * Unlock a transport request
     * @param trkorr - Transport number
     * @param lockHandle - Lock handle from lock() operation
     */
    async unlock(trkorr: string, lockHandle: LockHandle): Promise<void> {
      logger?.debug(`Unlocking transport ${trkorr}...`);
      
      await fetchFn(
        `/sap/bc/adt/cts/transportrequests/${trkorr}?_action=UNLOCK&lockHandle=${encodeURIComponent(lockHandle.handle)}`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/vnd.sap.as+xml',
          },
        }
      );
      
      logger?.debug(`Transport ${trkorr} unlocked`);
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
