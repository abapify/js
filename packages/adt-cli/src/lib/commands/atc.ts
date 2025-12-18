import { Command } from 'commander';
import { getAdtClientV2 } from '../utils/adt-client-v2';
import { outputGitLabCodeQuality } from '../formatters/gitlab-formatter';
import { outputSarifReport } from '../formatters/sarif-formatter';

/**
 * ATC Command - Run ABAP Test Cockpit checks
 * 
 * Uses contracts from adt-contracts/src/adt/atc/:
 * - runs.post() - Run ATC checks with atcRun body schema
 * 
 * TODO: Migrate remaining manual fetch calls to contracts:
 * - customizing.get() - Get ATC customizing (check variants)
 * - worklists.create() - Create worklist
 * - worklists.get() - Get worklist results
 */
export const atcCommand = new Command('atc')
  .description('Run ABAP Test Cockpit (ATC) checks')
  .option('-p, --package <package>', 'Run ATC on package')
  .option('-o, --object <uri>', 'Run ATC on specific object (e.g., /sap/bc/adt/oo/classes/zcl_my_class)')
  .option('--variant <variant>', 'ATC check variant (default: from system customizing)')
  .option('--max-results <number>', 'Maximum number of results', '100')
  .option(
    '--format <format>',
    'Output format: console, json, gitlab, sarif',
    'console'
  )
  .option('--output <file>', 'Output file (required for gitlab/sarif format)')
  .action(async (options) => {
    try {
      if (!options.package && !options.object) {
        console.error('❌ Either --package or --object is required');
        process.exit(1);
      }

      if (options.package && options.object) {
        console.error('❌ Cannot specify both --package and --object');
        process.exit(1);
      }

      // Validate format and output options
      if (
        (options.format === 'gitlab' || options.format === 'sarif') &&
        !options.output
      ) {
        console.error(
          `❌ --output <file> is required when using --format=${options.format}`
        );
        process.exit(1);
      }

      if (!['console', 'json', 'gitlab', 'sarif'].includes(options.format)) {
        console.error(
          '❌ Invalid format. Use: console, json, gitlab, or sarif'
        );
        process.exit(1);
      }

      // Get authenticated v2 client
      const client = await getAdtClientV2();

      console.log('🔍 Running ABAP Test Cockpit checks...');

      let targetName: string;
      let objectUri: string;

      if (options.package) {
        targetName = options.package;
        objectUri = `/sap/bc/adt/packages/${targetName.toUpperCase()}`;
        console.log(`📦 Target: Package ${targetName}`);
      } else {
        targetName = options.object;
        objectUri = options.object;
        console.log(`🎯 Target: ${targetName}`);
      }

      // Get check variant - from option or from system customizing
      let checkVariant = options.variant;
      if (!checkVariant) {
        console.log('📋 Reading ATC customizing...');
        const customizingXml = await client.fetch('/sap/bc/adt/atc/customizing', {
          method: 'GET',
          headers: { 'Accept': 'application/xml' },
        }) as string;
        
        // Extract systemCheckVariant from customizing XML
        const variantMatch = customizingXml.match(/name="systemCheckVariant"\s+value="([^"]+)"/);
        if (variantMatch) {
          checkVariant = variantMatch[1];
        } else {
          throw new Error('Could not determine ATC check variant from system customizing. Please specify --variant.');
        }
      }
      console.log(`🎯 Check variant: ${checkVariant}`);

      // Step 1: Create worklist
      console.log('📋 Creating ATC worklist...');
      const createResponse = await client.fetch(
        `/sap/bc/adt/atc/worklists?checkVariant=${encodeURIComponent(checkVariant)}`,
        {
          method: 'POST',
          headers: { 'Accept': '*/*' },
        }
      ) as string;

      // Extract worklist ID from response
      let worklistId: string;
      const idMatch = createResponse.match(/id="([^"]+)"/);
      if (idMatch) {
        worklistId = idMatch[1];
      } else if (createResponse.trim()) {
        worklistId = createResponse.trim();
      } else {
        throw new Error('Failed to get worklist ID from response');
      }
      console.log(`📋 Worklist created: ${worklistId}`);

      // Step 2: Run ATC check with objects via contract
      console.log('⏳ Running ATC analysis...');
      const maxResults = parseInt(options.maxResults) || 100;
      
      // Build run data - NOTE: buildXml adds root element automatically from schema
      // Data should NOT include the root element wrapper
      const runData = {
        maximumVerdicts: maxResults,
        objectSets: {
          objectSet: [{
            kind: 'inclusive',
            objectReferences: {
              objectReference: [{ uri: objectUri }],
            },
          }],
        },
      };

      await client.adt.atc.runs.post({ worklistId }, runData);

      // Step 3: Get results from worklist
      console.log('📊 Fetching results...');
      const resultsXml = await client.fetch(
        `/sap/bc/adt/atc/worklists/${encodeURIComponent(worklistId)}?includeExemptedFindings=false`,
        {
          method: 'GET',
          headers: {
            'Accept': '*/*',
          },
        }
      ) as string;

      // Parse results
      const result = parseAtcResults(resultsXml, checkVariant);

      // Display results based on format
      if (options.format === 'json') {
        console.log(JSON.stringify(result, null, 2));
      } else if (options.format === 'gitlab') {
        await outputGitLabCodeQuality(result, options.output);
      } else if (options.format === 'sarif') {
        await outputSarifReport(result, options.output, targetName);
      } else {
        displayAtcResults(result);
      }

      // Exit with error code if there are findings
      if (result.errorCount > 0) {
        process.exit(1);
      }
    } catch (error) {
      console.error(
        `❌ ATC failed:`,
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }
  });

/**
 * Parse ATC worklist XML response into structured result
 */
function parseAtcResults(xml: string, checkVariant: string): AtcResult {
  const findings: AtcFinding[] = [];
  
  // Parse objects and findings from XML
  // The XML uses namespaced elements like atcobject:object and atcfinding:finding
  // Match pattern: <atcobject:object ... uri="..." type="..." name="...">
  const objectRegex = /<atcobject:object[^>]*adtcore:uri="([^"]*)"[^>]*adtcore:type="([^"]*)"[^>]*adtcore:name="([^"]*)"[^>]*>([\s\S]*?)<\/atcobject:object>/g;
  
  // Match findings with their attributes
  const findingRegex = /<atcfinding:finding[^>]*atcfinding:location="([^"]*)"[^>]*atcfinding:priority="([^"]*)"[^>]*atcfinding:checkId="([^"]*)"[^>]*atcfinding:checkTitle="([^"]*)"[^>]*atcfinding:messageId="([^"]*)"[^>]*atcfinding:messageTitle="([^"]*)"[^>]*>/g;

  let objectMatch;
  while ((objectMatch = objectRegex.exec(xml)) !== null) {
    const [, objectUri, objectType, objectName, objectContent] = objectMatch;
    
    let findingMatch;
    const findingRegexLocal = new RegExp(findingRegex.source, 'g');
    while ((findingMatch = findingRegexLocal.exec(objectContent)) !== null) {
      const [, location, priority, checkId, checkTitle, messageId, messageTitle] = findingMatch;
      
      findings.push({
        checkId,
        checkTitle,
        messageId,
        priority: parseInt(priority, 10),
        messageText: messageTitle,
        objectUri,
        objectType,
        objectName,
        location,
      });
    }
  }

  // Count by priority
  const errorCount = findings.filter(f => f.priority === 1).length;
  const warningCount = findings.filter(f => f.priority === 2).length;
  const infoCount = findings.filter(f => f.priority >= 3).length;

  return {
    checkVariant,
    totalFindings: findings.length,
    errorCount,
    warningCount,
    infoCount,
    findings,
  };
}

interface AtcFinding {
  checkId: string;
  checkTitle: string;
  messageId: string;
  priority: number;
  messageText: string;
  objectUri: string;
  objectType: string;
  objectName: string;
  location?: string;
}

interface AtcResult {
  checkVariant: string;
  totalFindings: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  findings: AtcFinding[];
}

function displayAtcResults(result: any): void {
  if (result.totalFindings === 0) {
    console.log(`\n✅ ATC check passed - No issues found!`);
    console.log(
      `   🎯 Variant: ${
        result.checkVariant || 'ABAP_CLOUD_DEVELOPMENT_DEFAULT'
      }`
    );
  } else {
    console.log(`\n📊 ATC Results Summary:`);
    console.log(
      `   🎯 Variant: ${
        result.checkVariant || 'ABAP_CLOUD_DEVELOPMENT_DEFAULT'
      }`
    );
    if (result.errorCount > 0)
      console.log(`   ❌ Errors: ${result.errorCount}`);
    if (result.warningCount > 0)
      console.log(`   ⚠️ Warnings: ${result.warningCount}`);
    if (result.infoCount > 0) console.log(`   ℹ️ Info: ${result.infoCount}`);
    console.log(`   📋 Total Issues: ${result.totalFindings}`);

    if (result.findings && result.findings.length > 0) {
      console.log(`\n📄 Findings:`);
      result.findings.slice(0, 5).forEach((finding: any) => {
        const priorityIcon =
          finding.priority === 1 ? '❌' : finding.priority === 2 ? '⚠️' : 'ℹ️';
        console.log(
          `   ${priorityIcon} ${finding.checkTitle || finding.checkId}`
        );
        console.log(`      ${finding.messageText}`);
        console.log(
          `      Object: ${finding.objectName} (${finding.objectType})`
        );
      });

      if (result.findings.length > 5) {
        console.log(`   ... (${result.findings.length - 5} more findings)`);
      }
    }

    console.log(`\n💡 Use --debug for detailed results`);
  }
}
