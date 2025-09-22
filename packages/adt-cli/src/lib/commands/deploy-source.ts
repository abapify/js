import { Command } from 'commander';
import { AdtClientImpl } from '@abapify/adt-client';
import { readFileSync, existsSync } from 'fs';
import { basename, extname } from 'path';

interface ObjectTypeMapping {
  endpoint: string;
  description: string;
}

// Map file extensions/patterns to SAP ADT endpoints
const OBJECT_TYPE_MAPPINGS: Record<string, ObjectTypeMapping> = {
  // Interfaces
  intf: { endpoint: 'oo/interfaces', description: 'Interface' },
  if: { endpoint: 'oo/interfaces', description: 'Interface' },

  // Classes
  clas: { endpoint: 'oo/classes', description: 'Class' },
  cl: { endpoint: 'oo/classes', description: 'Class' },

  // Programs
  prog: { endpoint: 'programs/programs', description: 'Program' },
  rp: { endpoint: 'programs/programs', description: 'Program' },

  // Function Groups
  fugr: { endpoint: 'functions/groups', description: 'Function Group' },
  fg: { endpoint: 'functions/groups', description: 'Function Group' },

  // Includes
  incl: { endpoint: 'programs/includes', description: 'Include' },
  inc: { endpoint: 'programs/includes', description: 'Include' },
};

function detectObjectTypeFromFilename(
  filename: string
): {
  type: string;
  name: string;
  endpoint: string;
  description: string;
} | null {
  const baseName = basename(filename, extname(filename)).toLowerCase();

  // Try to match patterns like zif_petstore, zcl_something, etc.
  for (const [pattern, mapping] of Object.entries(OBJECT_TYPE_MAPPINGS)) {
    if (
      baseName.startsWith(`z${pattern}_`) ||
      baseName.startsWith(`y${pattern}_`)
    ) {
      return {
        type: pattern.toUpperCase(),
        name: baseName.toUpperCase(),
        endpoint: mapping.endpoint,
        description: mapping.description,
      };
    }
  }

  // Try common prefixes
  if (baseName.startsWith('zif_') || baseName.startsWith('yif_')) {
    return {
      type: 'INTF',
      name: baseName.toUpperCase(),
      endpoint: OBJECT_TYPE_MAPPINGS.intf.endpoint,
      description: OBJECT_TYPE_MAPPINGS.intf.description,
    };
  }

  if (baseName.startsWith('zcl_') || baseName.startsWith('ycl_')) {
    return {
      type: 'CLAS',
      name: baseName.toUpperCase(),
      endpoint: OBJECT_TYPE_MAPPINGS.clas.endpoint,
      description: OBJECT_TYPE_MAPPINGS.clas.description,
    };
  }

  if (baseName.startsWith('zfg_') || baseName.startsWith('yfg_')) {
    return {
      type: 'FUGR',
      name: baseName.toUpperCase(),
      endpoint: OBJECT_TYPE_MAPPINGS.fugr.endpoint,
      description: OBJECT_TYPE_MAPPINGS.fugr.description,
    };
  }

  return null;
}

async function deploySource(filePath: string, options: any, command: any) {
  const logger = command.parent?.logger;

  try {
    // Validate file exists
    if (!existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      process.exit(1);
    }

    // Validate lock handle is provided
    if (!options.lockHandle) {
      console.error(`❌ Lock handle is required. Use --lock-handle <handle>`);
      console.log(`💡 First lock the object: npx adt lock <objectName>`);
      process.exit(1);
    }

    console.log(`📁 Deploying file: ${filePath}`);

    // Detect object type from filename
    const objectInfo = detectObjectTypeFromFilename(filePath);
    if (!objectInfo) {
      console.error(
        `❌ Cannot determine object type from filename: ${basename(filePath)}`
      );
      console.log(`💡 Supported patterns: zif_*, zcl_*, zfg_*, etc.`);
      process.exit(1);
    }

    console.log(`🔍 Detected: ${objectInfo.name} (${objectInfo.description})`);

    // Read file content
    let sourceCode: string;
    try {
      sourceCode = readFileSync(filePath, 'utf-8');
    } catch (error) {
      console.error(`❌ Failed to read file: ${error}`);
      process.exit(1);
    }

    console.log(`📄 Read ${sourceCode.length} characters from file`);

    // Create ADT client
    const client = new AdtClientImpl({
      logger: logger?.child({ component: 'cli' }),
    });

    // Construct ADT endpoint
    const endpoint = `/sap/bc/adt/${
      objectInfo.endpoint
    }/${objectInfo.name.toLowerCase()}/source/main?lockHandle=${
      options.lockHandle
    }`;
    console.log(`🚀 Deploying to: ${endpoint}`);

    try {
      const response = await client.request(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          Accept: 'text/plain',
          'X-sap-adt-sessiontype': 'stateful',
          'x-sap-security-session': 'use',
        },
        body: sourceCode,
      });

      console.log(
        `✅ SUCCESS! ${objectInfo.description} ${objectInfo.name} deployed`
      );
      console.log(`📊 Response: ${response.status} ${response.statusText}`);

      // Show response body if available (usually contains compilation messages)
      if (response.body) {
        try {
          const responseText = await response.text();
          if (responseText.trim()) {
            console.log(`📋 Server response:`);
            console.log(responseText);
          }
        } catch (bodyError) {
          // Ignore body parsing errors
        }
      }
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      const statusCode = error?.statusCode || error?.context?.status;

      console.error(
        `❌ Deploy failed: ${errorMessage} (Status: ${statusCode})`
      );

      // Show response body for debugging
      if (error?.context?.response) {
        console.log(`📋 Error response:`);
        console.log(error.context.response.substring(0, 500));
      }

      // Show helpful error information
      if (statusCode === 423) {
        console.log(`💡 Object is locked by another user or session`);
        console.log(`   - Check if the lock handle is still valid`);
        console.log(
          `   - Try locking the object again: npx adt lock ${objectInfo.name}`
        );
      } else if (statusCode === 400) {
        console.log(`💡 Bad request - possible issues:`);
        console.log(`   - Invalid lock handle`);
        console.log(`   - Syntax errors in the source code`);
        console.log(`   - Object name mismatch`);
      } else if (statusCode === 404) {
        console.log(`💡 Object not found:`);
        console.log(`   - Object might not exist in the system`);
        console.log(`   - Check the object name and type`);
      } else {
        console.log(`💡 Deploy might have failed due to:`);
        console.log(`   - Invalid lock handle (expired or wrong)`);
        console.log(`   - Syntax errors in source code`);
        console.log(`   - Insufficient permissions`);
        console.log(`   - Network or system issues`);
      }

      process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Deploy failed:`, error);
    process.exit(1);
  }
}

export function createDeploySourceCommand(): Command {
  const command = new Command('deploy-source');

  command
    .description('Deploy source code to a SAP object using a lock handle')
    .argument('<file>', 'Path to the source file to deploy')
    .option('--lock-handle <handle>', 'Lock handle obtained from lock command')
    .action(async (file: string, options: any, command: any) => {
      await deploySource(file, options, command);
    });

  return command;
}
