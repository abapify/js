import { Command } from 'commander';
import { join, resolve } from 'path';
import { existsSync, readFileSync, statSync } from 'fs';
import { glob } from 'fs/promises';
import { AdtClientImpl, SetSourceOptions } from '@abapify/adt-client';
import {
  detectObjectTypeFromFilename,
  filenameToSourceUri,
  ObjectTypeInfo,
} from '../../utils/object-uri';

interface DeployOptions {
  transport?: string;
  package?: string;
  verbose?: boolean;
  dryRun?: boolean;
}

interface DetectedFile {
  filePath: string;
  objectInfo: ObjectTypeInfo;
}

export const deployCommand = new Command('deploy')
  .description('Deploy ABAP objects from files, folders, or patterns')
  .argument(
    '[path]',
    'Path to file, folder, or glob pattern (e.g., src/**/*.intf.abap)',
    '.'
  )
  .option(
    '-t, --transport <transport>',
    'Transport request to assign objects to (use "adt transport create" to create one)'
  )
  .option(
    '-p, --package <package>',
    'Target package (if not specified in project)'
  )
  .option('--dry-run', 'Show what would be deployed without actually deploying')
  .option('-v, --verbose', 'Enable verbose logging')
  .action(async (pathPattern: string, options: DeployOptions) => {
    try {
      const resolvedPath = resolve(pathPattern);

      if (options.verbose) {
        console.log(`⚙️  Options:`, JSON.stringify(options, null, 2));
      }

      // Detect files to deploy based on the path pattern
      const filesToDeploy = await detectFilesToDeploy(resolvedPath, options);

      if (filesToDeploy.length === 0) {
        console.log(
          `❌ No deployable ABAP files found for pattern: ${pathPattern}`
        );
        console.log(
          `💡 Supported patterns: *.intf.abap, *.clas.abap, **/*.intf.abap`
        );
        process.exit(1);
      }

      console.log(`📦 Found ${filesToDeploy.length} files to deploy:`);
      for (const file of filesToDeploy) {
        console.log(
          `  - ${file.objectInfo.description}: ${file.objectInfo.name} (${file.filePath})`
        );
      }

      if (options.dryRun) {
        console.log('✅ Dry run completed successfully');
        return;
      }

      // Deploy all detected files
      await deployFiles(filesToDeploy, options);
    } catch (error) {
      console.error(
        '❌ Deployment failed:',
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }
  });

async function detectFilesToDeploy(
  pathPattern: string,
  options: DeployOptions
): Promise<DetectedFile[]> {
  const detectedFiles: DetectedFile[] = [];

  // Check if it's a specific file
  if (existsSync(pathPattern) && statSync(pathPattern).isFile()) {
    const objectInfo = detectObjectTypeFromFilename(pathPattern);
    if (objectInfo) {
      detectedFiles.push({ filePath: pathPattern, objectInfo });
    }
    return detectedFiles;
  }

  // Check if it's a directory
  if (existsSync(pathPattern) && statSync(pathPattern).isDirectory()) {
    // Scan directory recursively for .abap files using native Node.js glob
    const globPattern = join(pathPattern, '**/*.abap');

    try {
      for await (const filePath of glob(globPattern)) {
        const objectInfo = detectObjectTypeFromFilename(filePath);
        if (objectInfo) {
          detectedFiles.push({ filePath, objectInfo });
        }
      }
    } catch (error) {
      if (options.verbose) {
        console.log(`⚠️  Directory scan failed: ${error}`);
      }
    }

    return detectedFiles;
  }

  // Treat as glob pattern using native Node.js glob
  try {
    for await (const filePath of glob(pathPattern)) {
      if (existsSync(filePath) && statSync(filePath).isFile()) {
        const objectInfo = detectObjectTypeFromFilename(filePath);
        if (objectInfo) {
          detectedFiles.push({ filePath, objectInfo });
        }
      }
    }
  } catch (error) {
    if (options.verbose) {
      console.log(`⚠️  Glob pattern failed: ${error}`);
    }
  }

  return detectedFiles;
}

async function deployFiles(
  filesToDeploy: DetectedFile[],
  options: DeployOptions
): Promise<void> {
  console.log('🚀 Starting file-based deployment...');

  // Create ADT client
  const client = new AdtClientImpl({
    // TODO: Add logger from options
  });

  // Use provided transport or deploy without transport
  const transportNumber = options.transport;
  if (transportNumber) {
    console.log(`🚛 Using transport: ${transportNumber}`);
  } else {
    console.log('📝 Deploying without transport assignment (development mode)');
  }

  // Deploy each file
  let deployedCount = 0;
  let failedCount = 0;

  for (const file of filesToDeploy) {
    try {
      console.log(
        `⬆️  Deploying ${file.objectInfo.description}: ${file.objectInfo.name}...`
      );

      await deploySourceFile(client, file, options);

      deployedCount++;
      console.log(`✅ Successfully deployed ${file.objectInfo.name}`);
    } catch (error) {
      failedCount++;
      console.error(
        `❌ Failed to deploy ${file.objectInfo.name}:`,
        error instanceof Error ? error.message : String(error)
      );

      if (options.verbose && error instanceof Error) {
        console.error('Full error:', error);
      }
    }
  }

  console.log(
    `🎉 Deployment completed: ${deployedCount}/${filesToDeploy.length} objects deployed successfully`
  );
  if (failedCount > 0) {
    console.log(`❌ ${failedCount} objects failed to deploy`);
  }
  if (transportNumber) {
    console.log(`🚛 Transport: ${transportNumber}`);
  }
}

async function deploySourceFile(
  client: AdtClientImpl,
  file: DetectedFile,
  options: DeployOptions
): Promise<void> {
  // Read file content
  const sourceCode = readFileSync(file.filePath, 'utf-8');

  if (options.verbose) {
    console.log(
      `📄 Read ${sourceCode.length} characters from ${file.filePath}`
    );
  }

  // Use utility to get object URI and source path
  const uriInfo = filenameToSourceUri(file.filePath);
  if (!uriInfo) {
    throw new Error(
      `Could not determine object URI for file: ${file.filePath}`
    );
  }

  const { objectUri, sourcePath } = uriInfo;

  // Configure setSource options
  const setSourceOptions: SetSourceOptions = {
    compareSource: true, // Skip if source is identical
    forceUnlock: true, // Force unlock if needed
  };

  if (options.verbose) {
    console.log(`🚀 Deploying to: ${objectUri}${sourcePath}`);
  }

  // Use the new setSource operation
  const result = await client.repository.setSource(
    objectUri,
    sourcePath,
    sourceCode,
    setSourceOptions
  );

  // Handle result
  switch (result.action) {
    case 'created':
      console.log(`➕ ${file.objectInfo.name} created successfully`);
      break;
    case 'updated':
      console.log(`✏️  ${file.objectInfo.name} updated successfully`);
      break;
    case 'skipped':
      console.log(`⏭️  ${file.objectInfo.name} skipped (source unchanged)`);
      break;
    case 'failed':
      throw new Error(
        `Failed to deploy ${file.objectInfo.name}: ${result.error}`
      );
  }

  // Show compilation messages if available and verbose
  if (result.messages && result.messages.length > 0 && options.verbose) {
    console.log(`📋 Server messages:`);
    for (const message of result.messages) {
      console.log(message);
    }
  }
}

// Legacy project-based deployment functions removed
// The unified deploy command now supports file/folder/glob patterns directly
