import { ADTClient } from '../../adt-client';
import { XMLParser } from 'fast-xml-parser';

export interface AtcOptions {
  target: 'package' | 'transport';
  targetName: string;
  checkVariant?: string;
  maxResults?: number;
  includeExempted?: boolean;
  debug?: boolean;
}

export interface AtcResult {
  runId: string;
  worklistId: string;
  status: 'success' | 'error' | 'running';
  totalFindings: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  findings: AtcFinding[];
}

export interface AtcFinding {
  priority: number;
  checkId: string;
  checkTitle: string;
  messageText: string;
  objectName: string;
  objectType: string;
  location?: {
    line: number;
    column: number;
  };
}

export class AtcService {
  private xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@',
    parseAttributeValue: true,
    trimValues: true,
  });

  constructor(private adtClient: ADTClient) {}

  async runAtcCheck(options: AtcOptions): Promise<AtcResult> {
    // Set debug mode globally on client for proper CSRF handling
    this.adtClient.setDebugMode(options.debug || false);

    if (options.debug) {
      console.log(
        `🔍 Starting ATC workflow for ${options.target}: ${options.targetName}`
      );
    }

    try {
      // Force a completely fresh session by clearing cookies and getting new session
      if (options.debug) {
        console.log(`🔄 Forcing fresh session for reliable CSRF handling...`);
      }

      // Clear any existing session state
      (this.adtClient as any).cookies?.clear();

      // Establish fresh session by making a simple GET request
      await this.adtClient.get('/sap/bc/adt/compatibility/graph');

      // Step 1: Get ATC customizing
      const customizing = await this.getAtcCustomizing(options);

      // Step 2: Create worklist
      const worklistId = await this.createWorklist(options, customizing);

      // Step 3: Start ATC run
      const runId = await this.startAtcRun(worklistId, options);

      // Step 4: Poll for results (with timeout)
      const results = await this.pollForResults(worklistId, options);

      return {
        runId,
        worklistId,
        status: 'success',
        totalFindings: results.totalFindings ?? 0,
        errorCount: results.errorCount ?? 0,
        warningCount: results.warningCount ?? 0,
        infoCount: results.infoCount ?? 0,
        findings: results.findings ?? [],
      };
    } catch (error) {
      throw new Error(
        `ATC workflow failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private async getAtcCustomizing(options: AtcOptions): Promise<any> {
    if (options.debug) {
      console.log(`📋 Step 1: Getting ATC customizing...`);
    }

    const response = await this.adtClient.request(
      '/sap/bc/adt/atc/customizing',
      {
        method: 'GET',
        headers: {
          Accept: 'application/xml',
        },
      }
    );

    const xmlContent = await response.text();

    if (options.debug) {
      console.log(`✅ ATC customizing received (${xmlContent.length} chars)`);
    }

    return this.xmlParser.parse(xmlContent);
  }

  private async createWorklist(
    options: AtcOptions,
    customizing: any
  ): Promise<string> {
    if (options.debug) {
      console.log(`📋 Step 2: Creating ATC worklist...`);
    }

    const checkVariant =
      options.checkVariant || 'ABAP_CLOUD_DEVELOPMENT_DEFAULT';
    const endpoint = `/sap/bc/adt/atc/worklists?checkVariant=${checkVariant}`;

    const xmlContent = await this.adtClient.post(endpoint, '', {
      Accept: 'text/plain',
      'Content-Type': 'text/plain',
    });

    if (options.debug) {
      console.log(`✅ Worklist created: ${xmlContent.substring(0, 200)}...`);
    }

    // Extract worklist ID from response (could be plain text or XML)
    let worklistId: string;

    if (xmlContent.trim().match(/^[A-F0-9]{32}$/)) {
      // Plain text response - just the ID
      worklistId = xmlContent.trim();
    } else {
      // XML response - try to parse
      try {
        const parsed = this.xmlParser.parse(xmlContent);
        worklistId =
          parsed['atc:worklist']?.['@id'] || parsed.worklist?.['@id'];
      } catch (error) {
        throw new Error(
          `Failed to parse worklist response: ${xmlContent.substring(
            0,
            100
          )}...`
        );
      }
    }

    if (!worklistId) {
      throw new Error(
        `Failed to extract worklist ID from response: ${xmlContent.substring(
          0,
          100
        )}...`
      );
    }

    if (options.debug) {
      console.log(`📝 Worklist ID: ${worklistId}`);
    }

    return worklistId;
  }

  private async startAtcRun(
    worklistId: string,
    options: AtcOptions
  ): Promise<string> {
    if (options.debug) {
      console.log(`📋 Step 3: Starting ATC run...`);
    }

    // Build XML payload for ATC run - different URI formats for package vs transport
    const objectRef =
      options.target === 'package'
        ? `/sap/bc/adt/repository/informationsystem/virtualfolders?selection=package%3a${options.targetName}`
        : `/sap/bc/adt/cts/transportrequests/${options.targetName}`;

    const xmlPayload = `<?xml version="1.0" encoding="UTF-8"?>
<atc:run xmlns:atc="http://www.sap.com/adt/atc" maximumVerdicts="${
      options.maxResults || 100
    }">
  <objectSets xmlns:adtcore="http://www.sap.com/adt/core">
    <objectSet kind="inclusive">
      <adtcore:objectReferences>
        <adtcore:objectReference adtcore:uri="${objectRef}"/>
      </adtcore:objectReferences>
    </objectSet>
  </objectSets>
</atc:run>`;

    const endpoint = `/sap/bc/adt/atc/runs?worklistId=${worklistId}&clientWait=false`;

    if (options.debug) {
      console.log(`🔍 ATC run endpoint: ${endpoint}`);
      console.log(`📄 XML payload: ${xmlPayload}`);
    }

    const xmlContent = await this.adtClient.post(endpoint, xmlPayload, {
      Accept: 'application/xml',
      'Content-Type': 'application/xml',
    });

    if (options.debug) {
      console.log(`✅ ATC run started: ${xmlContent.substring(0, 200)}...`);
    }

    // Extract run ID if available
    const parsed = this.xmlParser.parse(xmlContent);
    const runId =
      parsed['atc:run']?.['@id'] || parsed.run?.['@id'] || worklistId;

    return runId;
  }

  private async pollForResults(
    worklistId: string,
    options: AtcOptions,
    maxAttempts: number = 10
  ): Promise<Partial<AtcResult>> {
    if (options.debug) {
      console.log(`📋 Step 4: Polling for ATC results...`);
    }

    const includeExempted = options.includeExempted ? 'true' : 'false';
    const endpoint = `/sap/bc/adt/atc/worklists/${worklistId}?includeExemptedFindings=${includeExempted}`;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        if (options.debug) {
          console.log(`🔄 Polling attempt ${attempt}/${maxAttempts}...`);
        }

        const response = await this.adtClient.request(endpoint, {
          method: 'GET',
          headers: {
            Accept: 'application/atc.worklist.v1+xml',
          },
        });

        const xmlContent = await response.text();

        if (options.debug) {
          console.log(
            `📄 Results received (${
              xmlContent.length
            } chars): ${xmlContent.substring(0, 300)}...`
          );
        }

        // Parse results
        const results = this.parseAtcResults(xmlContent);

        // If we got results, return them
        if ((results.totalFindings ?? -1) >= 0) {
          if (options.debug) {
            console.log(`✅ ATC results ready after ${attempt} attempts`);
          }
          return results;
        }

        // Wait before next attempt (except last attempt)
        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      } catch (error) {
        if (attempt === maxAttempts) {
          throw error;
        }
        if (options.debug) {
          console.log(`⚠️ Attempt ${attempt} failed, retrying...`);
        }
      }
    }

    throw new Error(`ATC results not ready after ${maxAttempts} attempts`);
  }

  private parseAtcResults(xmlContent: string): Partial<AtcResult> {
    try {
      const parsed = this.xmlParser.parse(xmlContent);
      const worklist = parsed['atcworklist:worklist'] || parsed.worklist;

      if (!worklist || !worklist['atcworklist:objects']) {
        return {
          totalFindings: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          findings: [],
        };
      }

      const objects =
        worklist['atcworklist:objects']['atcobject:object'] ||
        worklist['atcworklist:objects'].object ||
        [];
      const objectList = Array.isArray(objects) ? objects : [objects];

      const findings: AtcFinding[] = [];
      let errorCount = 0,
        warningCount = 0,
        infoCount = 0;

      for (const obj of objectList) {
        const objectFindings =
          obj['atcobject:findings']?.['atcfinding:finding'] ||
          obj.findings?.finding ||
          [];
        const findingList = Array.isArray(objectFindings)
          ? objectFindings
          : [objectFindings];

        for (const finding of findingList) {
          if (!finding || typeof finding !== 'object') continue;

          const priority = parseInt(
            finding['@atcfinding:priority'] || finding['@priority'] || '3'
          );
          const checkTitle =
            finding['@atcfinding:checkTitle'] || finding['@checkTitle'] || '';
          const messageTitle =
            finding['@atcfinding:messageTitle'] ||
            finding['@messageTitle'] ||
            '';
          const location =
            finding['@atcfinding:location'] || finding['@location'] || '';
          const objectName = obj['@adtcore:name'] || obj['@name'] || '';
          const objectType = obj['@adtcore:type'] || obj['@type'] || '';

          // Extract line number from location (e.g., "#start=32,0")
          const lineMatch = location.match(/#start=(\d+),/);
          const line = lineMatch ? parseInt(lineMatch[1]) : 0;

          const atcFinding: AtcFinding = {
            priority,
            checkId:
              finding['@atcfinding:checkId'] || finding['@checkId'] || '',
            checkTitle,
            messageText: messageTitle,
            objectName,
            objectType,
            location: line > 0 ? { line, column: 0 } : undefined,
          };

          findings.push(atcFinding);

          // Count by priority
          if (priority === 1) errorCount++;
          else if (priority === 2) warningCount++;
          else infoCount++;
        }
      }

      return {
        totalFindings: findings.length,
        errorCount,
        warningCount,
        infoCount,
        findings,
      };
    } catch (error) {
      // Fallback to regex parsing if XML parsing fails
      const errorCount = (xmlContent.match(/priority="1"/g) || []).length;
      const warningCount = (xmlContent.match(/priority="2"/g) || []).length;
      const infoCount = (xmlContent.match(/priority="3"/g) || []).length;

      return {
        totalFindings: errorCount + warningCount + infoCount,
        errorCount,
        warningCount,
        infoCount,
        findings: [],
      };
    }
  }
}
