import { BaseObject } from '../base/base-object';
import { ObjectData } from '../base/types';
import { Kind, createCachedLazyLoader } from '@abapify/adk';
import type { AdtClient } from '@abapify/adt-client';

// Temporary interface until ADK stabilizes
interface AdkObject {
  kind: Kind;
  name: string;
  description?: string;
  source?: string;
  package?: string;
  [key: string]: any;
}

export class AdkObjectHandler extends BaseObject<ObjectData> {
  constructor(
    private parseXmlToObject: (xml: string) => AdkObject,
    private uriFactory: (name: string) => string,
    private adtClient: AdtClient,
    private acceptHeader?: string
  ) {
    super();
  }

  override async read(name: string): Promise<ObjectData> {
    const xml = await this.getAdtXml(name);
    const adkObject = this.parseXmlToObject(xml);

    // Enhanced conversion that preserves ADK context
    return this.adkObjectToObjectData(adkObject, xml);
  }

  /**
   * Get object as ADK object directly (for format plugins that support ADK)
   */
  async getAdkObject(name: string): Promise<AdkObject> {
    const xml = await this.getAdtXml(name);
    const adkObject = this.parseXmlToObject(xml);
    
    // Add lazy loading for class includes
    if (adkObject.kind === Kind.Class && adkObject.spec?.include) {
      const baseUri = this.uriFactory(name);
      
      for (const include of adkObject.spec.include) {
        if (include.sourceUri) {
          // Create lazy loader for this include
          // Note: sourceUri might be relative (e.g., "source/main" or "/source") or absolute
          const fullUri = include.sourceUri.startsWith('http') 
            ? include.sourceUri 
            : include.sourceUri.startsWith('/')
              ? `${baseUri}${include.sourceUri}`
              : `${baseUri}/${include.sourceUri}`;
          
          include.content = createCachedLazyLoader(async () => {
            const response = await this.adtClient.request(fullUri, {
              method: 'GET',
              headers: {
                Accept: 'text/plain',
              },
            });
            return await response.text();
          });
        }
      }
    }
    
    return adkObject;
  }

  override async getAdtXml(name: string): Promise<string> {
    const uri = this.uriFactory(name);
    return this.fetchFromAdt(uri, this.acceptHeader || 'application/xml');
  }

  override async getStructure(name: string): Promise<void> {
    try {
      const structureUri = `${this.uriFactory(
        name
      )}/objectstructure?version=active&withShortDescriptions=true`;
      const structureXml = await this.fetchFromAdt(
        structureUri,
        'application/xml'
      );

      const parser = new (await import('fast-xml-parser')).XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '',
      });
      const structureJson = parser.parse(structureXml);

      const rootElement = structureJson['abapsource:objectStructureElement'];
      if (rootElement) {
        this.displayStructureElement(rootElement, '', name);
      }
    } catch (error) {
      throw new Error(
        `Failed to fetch structure: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private adkObjectToObjectData(
    adkObject: AdkObject,
    originalXml?: string
  ): ObjectData {
    return {
      name: adkObject.name,
      description: adkObject.description || '',
      source: adkObject.source || '',
      package: adkObject.package || '$TMP',
      metadata: {
        type: this.getAdtTypeFromKind(adkObject.kind),
        kind: adkObject.kind,
        // Preserve original ADT XML context for round-trip compatibility
        adtXml: originalXml,
        // Include full ADK object for enhanced serialization
        adkObject: adkObject,
      },
    };
  }

  override async create(
    objectData: ObjectData,
    transportRequest?: string
  ): Promise<void> {
    const uri = this.uriFactory(objectData.name);

    // First, check if object already exists (avoids unnecessary server errors)
    console.log(`🔍 Checking if ${objectData.name} already exists...`);

    try {
      // Try to read the object first with proper SAP ADT Accept header
      const readResponse = await this.adtClient.request(uri, {
        method: 'GET',
        headers: {
          Accept:
            'application/vnd.sap.adt.oo.interfaces.v5+xml, application/vnd.sap.adt.oo.interfaces.v4+xml, application/vnd.sap.adt.oo.interfaces.v3+xml, application/vnd.sap.adt.oo.interfaces.v2+xml, application/vnd.sap.adt.oo.interfaces+xml',
        },
      });

      // Object exists - parse the response to understand its state
      console.log(
        `📝 Object ${objectData.name} exists (status: ${readResponse.status}), updating instead of creating...`
      );

      // Log response details for debugging
      if (readResponse.body) {
        console.log(
          `📄 Object metadata received (${typeof readResponse.body})`
        );
      }

      await this.update(objectData, transportRequest);
    } catch (readError: any) {
      // Parse the error response to understand what happened
      const errorMessage = readError?.message || String(readError);
      const statusCode = readError?.statusCode || readError?.context?.status;
      const responseBody = readError?.context?.response;

      console.log(
        `🔍 Read check failed - Status: ${statusCode}, Message: ${errorMessage}`
      );

      if (responseBody) {
        console.log(
          `📄 SAP Response: ${responseBody.substring(0, 200)}${
            responseBody.length > 200 ? '...' : ''
          }`
        );
      }

      if (statusCode === 404) {
        // Object truly doesn't exist, proceed with creation
        console.log(
          `🆕 Object ${objectData.name} doesn't exist (404), creating new...`
        );

        const adkObject = this.objectDataToAdkObject(objectData);
        const xml = this.generateAdtXml(adkObject);
        const contentType = this.getContentTypeForObjectType(
          objectData.metadata?.type || 'UNKNOWN'
        );

        const headers: Record<string, string> = {
          'Content-Type': contentType,
          Accept: 'application/xml',
        };

        if (transportRequest) {
          headers['sap-adt-corrnr'] = transportRequest;
        }

        await this.adtClient.request(uri, {
          method: 'POST',
          body: xml,
          headers,
        });

        console.log(`✅ Successfully created ${objectData.name}`);
      } else if (
        statusCode === 403 &&
        responseBody?.includes('currently editing')
      ) {
        // Object exists but is locked by another user
        console.log(
          `🔒 Object ${objectData.name} exists but is locked by another user`
        );
        throw new Error(
          `Object ${objectData.name} is currently being edited by another user. Please try again later.`
        );
      } else {
        // Some other error - try to understand what SAP is telling us
        console.log(
          `⚠️ Unexpected read error (${statusCode}): ${errorMessage}`
        );

        // Try to extract more meaningful information from SAP response
        if (responseBody) {
          try {
            const messageMatch = responseBody.match(/<message[^>]*>([^<]+)</i);
            if (messageMatch && messageMatch[1]) {
              const sapMessage = messageMatch[1].trim();
              console.log(`📋 SAP says: ${sapMessage}`);

              // If SAP says object exists in some form, try update
              if (
                sapMessage.toLowerCase().includes('exist') ||
                sapMessage.toLowerCase().includes('found')
              ) {
                console.log(`📝 Attempting update based on SAP response...`);
                await this.update(objectData, transportRequest);
                return;
              }
            }
          } catch (parseError) {
            console.log(`⚠️ Could not parse SAP response: ${parseError}`);
          }
        }

        // If we can't understand the error, re-throw it
        throw new Error(
          `Failed to read object ${objectData.name}: ${errorMessage} (Status: ${statusCode})`
        );
      }
    }
  }

  override async update(
    objectData: ObjectData,
    transportRequest?: string
  ): Promise<void> {
    const adkObject = this.objectDataToAdkObject(objectData);
    const xml = this.generateAdtXml(adkObject);
    const uri = this.uriFactory(objectData.name);
    const contentType = this.getContentTypeForObjectType(
      objectData.metadata?.type || 'UNKNOWN'
    );

    console.log(`🔄 Starting update workflow for ${objectData.name}...`);

    // Clean workflow: Lock → Update → Unlock
    let lockHandle: string | undefined;

    try {
      // Step 1: Acquire lock (with automatic unlock/relock if needed)
      lockHandle = await this.acquireLockWithRetry(uri, transportRequest);

      if (!lockHandle) {
        throw new Error('Failed to acquire lock for update');
      }

      console.log(`🔒 Lock acquired successfully: ${lockHandle}`);

      // Step 2: Perform update with lock handle
      const updateHeaders: Record<string, string> = {
        'Content-Type': contentType,
        Accept: 'application/xml',
        'X-sap-adt-sessiontype': 'stateful',
        'x-sap-security-session': 'use',
        'sap-adt-lockhandle': lockHandle,
      };

      if (transportRequest) {
        updateHeaders['sap-adt-corrnr'] = transportRequest;
      }

      console.log(`📝 Updating object with lock handle...`);
      await this.adtClient.request(uri, {
        method: 'PUT',
        body: xml,
        headers: updateHeaders,
      });

      console.log(`✅ Successfully updated ${objectData.name}`);
    } finally {
      // Step 3: Always unlock the object
      if (lockHandle) {
        try {
          console.log(`🔓 Releasing lock: ${lockHandle}`);
          await this.unlockObject(uri, lockHandle);
          console.log(`✅ Lock released successfully`);
        } catch (unlockError) {
          console.warn(
            `⚠️ Failed to unlock object ${objectData.name}:`,
            unlockError
          );
        }
      }
    }
  }

  /**
   * Acquire lock with automatic unlock/relock if object is already locked by us
   */
  private async acquireLockWithRetry(
    uri: string,
    transportRequest?: string
  ): Promise<string | undefined> {
    // Generate a unique session/connection ID for this lock sequence
    const sessionId = `lock-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    console.log(`🔗 Using session ID: ${sessionId}`);

    const lockHeaders = {
      Accept:
        'application/vnd.sap.as+xml;charset=UTF-8;dataname=com.sap.adt.lock.result;q=0.9, application/vnd.sap.as+xml;charset=UTF-8;q=0.8',
      'Content-Type': 'application/xml',
      'X-sap-adt-sessiontype': 'stateful',
      'x-sap-security-session': 'use',
      'X-sap-adt-session-id': sessionId, // Custom session identifier
      'X-Request-ID': sessionId, // Alternative session identifier
    };

    if (transportRequest) {
      lockHeaders['sap-adt-corrnr'] = transportRequest;
    }

    try {
      // Step 1: Try to lock normally
      console.log(`🔒 Attempting to lock object...`);

      const initialUrl = `${uri}?_action=LOCK&accessMode=MODIFY`;
      console.log(`📡 INITIAL LOCK REQUEST:`);
      console.log(`   Method: POST`);
      console.log(`   URL: ${initialUrl}`);
      console.log(`   Headers: ${JSON.stringify(lockHeaders, null, 4)}`);
      console.log(`   Body: null`);

      const response = await this.adtClient.request(initialUrl, {
        method: 'POST',
        headers: lockHeaders,
        body: null,
      });

      // Extract lock handle from successful response
      return await this.extractLockHandleFromResponse(response);
    } catch (error: any) {
      const errorMessage = error?.message || String(error);

      // Check if WE are the ones holding the lock
      if (
        errorMessage.includes('currently editing') &&
        errorMessage.includes('CB9980003374')
      ) {
        console.log(
          `🔒 Object already locked by us, attempting unlock/relock...`
        );

        // Step 2: Unlock the object
        try {
          console.log(`🔓 Unlocking object...`);

          const unlockUrl = `${uri}?_action=UNLOCK&accessMode=MODIFY`;
          const unlockHeaders = {
            'X-sap-adt-sessiontype': 'stateful',
            'x-sap-security-session': 'use',
            'X-sap-adt-session-id': sessionId, // Same session ID as lock
            'X-Request-ID': sessionId, // Same session ID as lock
          };

          console.log(`📡 UNLOCK REQUEST:`);
          console.log(`   Method: POST`);
          console.log(`   URL: ${unlockUrl}`);
          console.log(`   Headers: ${JSON.stringify(unlockHeaders, null, 4)}`);

          const unlockResponse = await this.adtClient.request(unlockUrl, {
            method: 'POST',
            headers: unlockHeaders,
          });

          console.log(
            `✅ Object unlocked successfully (Status: ${unlockResponse.status})`
          );

          // Small delay to avoid race condition
          console.log(`⏳ Waiting 500ms to avoid race condition...`);
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Step 3: Lock again
          console.log(`🔒 Re-locking object...`);

          const retryUrl = `${uri}?_action=LOCK&accessMode=MODIFY`;
          console.log(`📡 RETRY LOCK REQUEST:`);
          console.log(`   Method: POST`);
          console.log(`   URL: ${retryUrl}`);
          console.log(`   Headers: ${JSON.stringify(lockHeaders, null, 4)}`);
          console.log(`   Body: null`);

          const retryResponse = await this.adtClient.request(retryUrl, {
            method: 'POST',
            headers: lockHeaders,
            body: null,
          });

          // Extract lock handle from retry response
          const lockHandle = await this.extractLockHandleFromResponse(
            retryResponse
          );
          if (lockHandle) {
            console.log(`✅ Successfully re-locked object`);
            return lockHandle;
          } else {
            throw new Error('No lock handle received after re-lock');
          }
        } catch (unlockError) {
          console.warn(`⚠️ Failed to unlock/relock: ${unlockError}`);
          throw new Error(
            `Cannot acquire lock: object locked by us but unlock/relock failed`
          );
        }
      } else {
        // Some other locking error
        console.warn(`⚠️ Lock failed: ${errorMessage}`);
        throw error;
      }
    }
  }

  /**
   * Extract lock handle from response - the most important part!
   */
  private async extractLockHandleFromResponse(
    response: any
  ): Promise<string | undefined> {
    if (!response.body) {
      console.warn(`⚠️ No response body to extract lock handle from`);
      return undefined;
    }

    try {
      const responseText = await response.text();
      console.log(
        `📄 Lock response body: ${responseText.substring(0, 300)}...`
      );

      // Parse XML to extract lock handle
      const lockHandleMatch = responseText.match(
        /<LOCK_HANDLE>([^<]+)<\/LOCK_HANDLE>/
      );
      if (lockHandleMatch && lockHandleMatch[1]) {
        const lockHandle = lockHandleMatch[1];
        console.log(`🔑 Extracted lock handle: ${lockHandle}`);
        return lockHandle;
      }

      console.warn(`⚠️ No <LOCK_HANDLE> found in response XML`);
      return undefined;
    } catch (bodyError) {
      console.warn(`⚠️ Failed to read response body: ${bodyError}`);
      return undefined;
    }
  }

  private async lockObject(
    uri: string,
    transportRequest?: string
  ): Promise<string | undefined> {
    const lockHeaders: Record<string, string> = {
      Accept:
        'application/vnd.sap.as+xml;charset=UTF-8;dataname=com.sap.adt.lock.result;q=0.9, application/vnd.sap.as+xml;charset=UTF-8;q=0.8',
      'Content-Type': 'application/xml',
      'X-sap-adt-sessiontype': 'stateful',
      'x-sap-security-session': 'use',
      // Generate unique request ID for this lock request
      'sap-adt-request-id': this.generateRequestId(),
    };

    if (transportRequest) {
      lockHeaders['sap-adt-corrnr'] = transportRequest;
    }

    try {
      const response = await this.adtClient.request(
        `${uri}?_action=LOCK&accessMode=MODIFY`,
        {
          method: 'POST',
          headers: lockHeaders,
          body: null, // Explicitly null body for lock requests
        }
      );

      // Extract lock handle from XML response body
      if (response.body) {
        try {
          const responseText = await response.text();
          console.log(
            `🔒 Lock response body: ${responseText.substring(0, 200)}...`
          );

          const lockHandleMatch = responseText.match(
            /<LOCK_HANDLE>([^<]+)<\/LOCK_HANDLE>/
          );
          if (lockHandleMatch && lockHandleMatch[1]) {
            const lockHandle = lockHandleMatch[1];
            console.log(`🔑 Extracted lock handle: ${lockHandle}`);
            return lockHandle;
          }
        } catch (bodyError) {
          console.warn(`⚠️ Failed to read lock response body: ${bodyError}`);
        }
      }

      // Fallback: try to get from headers
      const lockHandle =
        response.headers?.get?.('sap-adt-lockhandle') ||
        response.headers?.get?.('lockhandle');
      if (lockHandle) {
        console.log(`🔑 Lock handle from headers: ${lockHandle}`);
        return lockHandle;
      }

      console.warn(`⚠️ No lock handle found in response`);
      return undefined;
    } catch (error: any) {
      const errorMessage = error?.message || String(error);

      // Check if WE are the ones holding the lock
      if (
        errorMessage.includes('currently editing') &&
        errorMessage.includes('CB9980003374')
      ) {
        console.log(
          `🔒 We already have the object locked from a previous session.`
        );
        console.log(
          `🔄 Attempting to unlock using discovered method: POST ?_action=UNLOCK...`
        );

        try {
          // Use the working unlock method we discovered
          await this.adtClient.request(`${uri}?_action=UNLOCK`, {
            method: 'POST',
            headers: {
              'X-sap-adt-sessiontype': 'stateful',
              'x-sap-security-session': 'use',
            },
          });

          console.log(`🔓 Successfully unlocked object, retrying lock...`);

          // Now try to lock again
          try {
            const retryResponse = await this.adtClient.request(
              `${uri}?_action=LOCK&accessMode=MODIFY`,
              {
                method: 'POST',
                headers: lockHeaders,
                body: null,
              }
            );

            // Extract lock handle from retry response
            if (retryResponse.body) {
              const responseText = await retryResponse.text();
              console.log(
                `🔒 Retry lock response: ${responseText.substring(0, 200)}...`
              );

              const lockHandleMatch = responseText.match(
                /<LOCK_HANDLE>([^<]+)<\/LOCK_HANDLE>/
              );
              if (lockHandleMatch && lockHandleMatch[1]) {
                const lockHandle = lockHandleMatch[1];
                console.log(
                  `🔑 Extracted lock handle after unlock/relock: ${lockHandle}`
                );
                return lockHandle;
              }
            }

            console.warn(
              `⚠️ Retry lock succeeded but no lock handle found in response`
            );
            throw new Error('No lock handle in retry response');
          } catch (retryLockError) {
            console.warn(`⚠️ Retry lock failed: ${retryLockError}`);
            throw retryLockError; // This will be caught by the outer catch block
          }
        } catch (unlockError) {
          console.warn(`⚠️ Failed to unlock and relock: ${unlockError}`);
          console.log(
            `💡 Tip: You can manually unlock it using SAP GUI transaction SM12 or wait for session timeout.`
          );
          console.log(
            `🚀 Proceeding with update without explicit locking (may work in some SAP systems)...`
          );

          // Return a special marker to indicate we should try update without locking
          return 'ALREADY_LOCKED_BY_US';
        }
      }

      console.warn(`⚠️ Failed to lock object, skipping lock: ${errorMessage}`);
      return undefined; // Continue without locking
    }
  }

  private async unlockObject(uri: string, lockHandle: string): Promise<void> {
    await this.adtClient.request(
      `${uri}?type=unlock&lockhandle=${lockHandle}`,
      {
        method: 'DELETE',
        headers: {
          Accept: 'application/xml',
        },
      }
    );
  }

  private generateRequestId(): string {
    // Generate a UUID-like request ID similar to SAP's format
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
      .replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      })
      .replace(/-/g, '');
  }

  private objectDataToAdkObject(objectData: ObjectData): AdkObject {
    // Convert ObjectData back to ADK object format
    const kind = this.getKindFromAdtType(
      objectData.metadata?.type || 'UNKNOWN'
    );

    return {
      kind,
      name: objectData.name,
      description: objectData.description,
      source: objectData.source || '',
      package: objectData.package,
    };
  }

  private generateAdtXml(adkObject: AdkObject): string {
    // Generate proper SAP ADT XML format
    try {
      switch (adkObject.kind) {
        case Kind.Interface:
          return this.generateInterfaceXml(adkObject);
        case Kind.Class:
          // TODO: Implement Class XML generation when available
          throw new Error('Class ADT adapter not yet implemented');
        case Kind.Domain:
          // TODO: Implement Domain XML generation when available
          throw new Error('Domain ADT adapter not yet implemented');
        default:
          throw new Error(
            `Unsupported object kind for XML generation: ${adkObject.kind}`
          );
      }
    } catch (error) {
      throw new Error(
        `Failed to generate ADT XML: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private generateInterfaceXml(adkObject: AdkObject): string {
    const name = adkObject.name || 'UNNAMED';
    const description = adkObject.description || '';
    const packageName = adkObject.package || '$TMP';
    const source = adkObject.source || '';

    // Create interface metadata-only first (SAP ADT typically requires two-step process)
    // TODO: Add separate source code update after interface creation
    return `<?xml version="1.0" encoding="UTF-8"?>
<intf:abapInterface xmlns:intf="http://www.sap.com/adt/oo/interfaces" xmlns:adtcore="http://www.sap.com/adt/core" adtcore:type="INTF/OI" adtcore:description="${description}" adtcore:name="${name}">
  <adtcore:packageRef adtcore:name="${packageName}"/>
</intf:abapInterface>`;

    // Note: Source code will need to be updated in a separate step
    // The two-step process is: 1) Create interface 2) Update source
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private getKindFromAdtType(adtType: string): Kind {
    switch (adtType) {
      case 'CLAS':
        return Kind.Class;
      case 'INTF':
        return Kind.Interface;
      case 'DOMA':
        return Kind.Domain;
      default:
        throw new Error(`Unknown ADT type: ${adtType}`);
    }
  }

  private getContentTypeForObjectType(objectType: string): string {
    switch (objectType) {
      case 'CLAS':
        return 'application/vnd.sap.adt.oo.classes.v1+xml';
      case 'INTF':
        return 'application/vnd.sap.adt.oo.interfaces.v1+xml';
      case 'DOMA':
        return 'application/vnd.sap.adt.ddic.domains.v1+xml';
      default:
        return 'application/xml';
    }
  }

  private getAdtTypeFromKind(kind: Kind): string {
    switch (kind) {
      case Kind.Class:
        return 'CLAS';
      case Kind.Interface:
        return 'INTF';
      case Kind.Domain:
        return 'DOMA';
      default:
        return 'UNKNOWN';
    }
  }

  private displayStructureElement(
    element: any,
    indent: string,
    name?: string
  ): void {
    const elementName = element['adtcore:name'] || name;
    const elementType = element['adtcore:type'];
    const visibility = element.visibility || 'public';
    const level = element.level;
    const description = element['adtcore:description'] || element.description;

    // Format the display based on element type and visibility
    let icon = '📁';
    let typeInfo = '';

    const isMethod =
      elementType?.includes('/OM') || elementType?.includes('/IO'); // class or interface methods
    const isAttribute = elementType?.includes('/OA'); // class attributes

    if (isMethod || isAttribute) {
      // For methods/attributes: colored shape = visibility + level
      if (level === 'static') {
        if (visibility === 'public')
          icon = '🟩'; // green square = public static
        else if (visibility === 'private')
          icon = '🟥'; // red square = private static
        else if (visibility === 'protected') icon = '🟨'; // yellow square = protected static
        typeInfo = `${visibility} static ${isMethod ? 'method' : 'attribute'}`;
      } else {
        // instance
        if (visibility === 'public')
          icon = '🟢'; // green circle = public instance
        else if (visibility === 'private')
          icon = '🔴'; // red circle = private instance
        else if (visibility === 'protected') icon = '🟡'; // yellow circle = protected instance
        typeInfo = `${visibility} ${isMethod ? 'method' : 'attribute'}`;
      }
    } else {
      // For other structural elements
      if (elementType === 'CLAS/OR') {
        icon = 'ℹ️'; // interface reference
        typeInfo = 'interface';
      } else if (elementType === 'CLAS/OC') {
        icon = '🏛️'; // class
        typeInfo = 'class';
      } else if (elementType === 'CLAS/OCX') {
        // Skip class implementation section - it's internal
        return;
      } else if (elementType?.includes('CLAS')) {
        icon = '🏛️'; // other class types
        typeInfo = 'class';
      } else if (elementType?.includes('INTF')) {
        icon = 'ℹ️'; // interface
        typeInfo = 'interface';
      }
    }

    // Build display string
    let displayStr = `${indent}${icon}  ${elementName}`;

    // Use description if available, otherwise fall back to typeInfo
    if (description) {
      displayStr += ` [${description}]`;
    } else if (typeInfo) {
      displayStr += ` [${typeInfo}]`;
    }
    // displayStr += ` {${elementType}}`; // temporary debug

    console.log(`\t${displayStr}`);

    // Recursively display children
    const children = element['abapsource:objectStructureElement'];
    if (children) {
      const childArray = Array.isArray(children) ? children : [children];
      childArray.forEach((child: any, index: number) => {
        const isLast = index === childArray.length - 1;
        const childIndent = indent + (isLast ? '└─ ' : '├─ ');
        this.displayStructureElement(child, childIndent, name);
      });
    }
  }
}
