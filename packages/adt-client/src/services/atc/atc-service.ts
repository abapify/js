import { ConnectionManager } from '../../client/connection-manager';
import { XMLParser } from 'fast-xml-parser';
import type { AtcOptions, AtcResult, AtcFinding } from './types';
import { createLogger } from '../../utils/logger.js';

export class AtcService {
  private xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@',
    parseAttributeValue: true,
    trimValues: true,
  });
  private logger: any;

  constructor(private connectionManager: ConnectionManager, logger?: any) {
    this.logger = logger || createLogger('atc');
  }

  async runAtcCheck(options: AtcOptions): Promise<AtcResult> {
    const checkVariant =
      options.checkVariant || 'ABAP_CLOUD_DEVELOPMENT_DEFAULT';

    try {
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
        checkVariant,
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
    const response = await this.connectionManager.request(
      '/sap/bc/adt/atc/customizing',
      {
        method: 'GET',
        headers: {
          Accept: 'application/xml',
        },
      }
    );

    const xmlContent = await response.text();
    return this.xmlParser.parse(xmlContent);
  }

  private async createWorklist(
    options: AtcOptions,
    customizing: any
  ): Promise<string> {
    const checkVariant =
      options.checkVariant || 'ABAP_CLOUD_DEVELOPMENT_DEFAULT';
    const endpoint = `/sap/bc/adt/atc/worklists?checkVariant=${checkVariant}`;

    const response = await this.connectionManager.request(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'text/plain',
        'Content-Type': 'text/plain',
      },
      body: '',
    });

    const xmlContent = await response.text();

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

    return worklistId;
  }

  private async startAtcRun(
    worklistId: string,
    options: AtcOptions
  ): Promise<string> {
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

    const response = await this.connectionManager.request(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/xml',
        'Content-Type': 'application/xml',
      },
      body: xmlPayload,
    });

    const xmlContent = await response.text();

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
    const includeExempted = options.includeExempted ? 'true' : 'false';
    const endpoint = `/sap/bc/adt/atc/worklists/${worklistId}?includeExemptedFindings=${includeExempted}&usedObjectSet=99999999999999999999999999999999`;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await this.connectionManager.request(endpoint, {
          method: 'GET',
          headers: {
            Accept: 'application/atc.worklist.v1+xml',
          },
        });

        const xmlContent = await response.text();

        // Parse results
        const results = this.parseAtcResults(xmlContent);

        // Check if ATC run is complete by looking at the XML structure
        const parsed = this.xmlParser.parse(xmlContent);
        const worklist = parsed['atcworklist:worklist'] || parsed.worklist;
        const isComplete =
          worklist?.['@atcworklist:objectSetIsComplete'] === true ||
          worklist?.['@objectSetIsComplete'] === true;

        // Check if we have the Last Check Run object set available
        const usedObjectSet = worklist?.['@atcworklist:usedObjectSet'];
        const hasLastCheckRun =
          usedObjectSet === '99999999999999999999999999999999' ||
          usedObjectSet === 9.999999999999999e31 ||
          String(usedObjectSet) === '1e+32';

        // Only return if the ATC run is actually complete AND we have the Last Check Run results
        if (
          isComplete &&
          hasLastCheckRun &&
          (results.totalFindings ?? -1) >= 0
        ) {
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
