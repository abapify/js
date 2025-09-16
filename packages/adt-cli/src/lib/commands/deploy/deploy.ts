import { Command } from 'commander';
import { join, resolve } from 'path';
import { existsSync, readFileSync } from 'fs';

interface DeployOptions {
  transport?: string;
  package?: string;
  verbose?: boolean;
  dryRun?: boolean;
}

interface ProjectInfo {
  type: 'abapgit' | 'oat' | 'unknown';
  path: string;
  config?: any;
}

export const deployCommand = new Command('deploy')
  .description('Deploy ABAP objects from project to remote system')
  .argument('[path]', 'Path to project directory', '.')
  .option(
    '-t, --transport <transport>',
    'Transport request to assign objects to'
  )
  .option(
    '-p, --package <package>',
    'Target package (if not specified in project)'
  )
  .option('--dry-run', 'Show what would be deployed without actually deploying')
  .option('-v, --verbose', 'Enable verbose logging')
  .action(async (projectPath: string, options: DeployOptions) => {
    try {
      const resolvedPath = resolve(projectPath);
      const projectInfo = await detectProjectType(resolvedPath);

      console.log(`🔍 Detected project type: ${projectInfo.type}`);
      console.log(`📁 Project path: ${projectInfo.path}`);

      if (options.verbose) {
        console.log(`⚙️  Options:`, JSON.stringify(options, null, 2));
      }

      switch (projectInfo.type) {
        case 'abapgit':
          await deployAbapGitProject(projectInfo, options);
          break;
        case 'oat':
          await deployOatProject(projectInfo, options);
          break;
        default:
          throw new Error(`Unsupported project type: ${projectInfo.type}`);
      }
    } catch (error) {
      console.error(
        '❌ Deployment failed:',
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }
  });

async function detectProjectType(projectPath: string): Promise<ProjectInfo> {
  // Check for abapGit project
  const abapGitConfigPath = join(projectPath, '.abapgit.xml');
  if (existsSync(abapGitConfigPath)) {
    const config = readFileSync(abapGitConfigPath, 'utf-8');
    return {
      type: 'abapgit',
      path: projectPath,
      config: config,
    };
  }

  // Check for OAT project
  const oatFiles = ['adt.config.ts', 'adt.config.js', 'adt.config.yaml'];
  for (const configFile of oatFiles) {
    const configPath = join(projectPath, configFile);
    if (existsSync(configPath)) {
      return {
        type: 'oat',
        path: projectPath,
        config: configPath,
      };
    }
  }

  return {
    type: 'unknown',
    path: projectPath,
  };
}

async function deployAbapGitProject(
  projectInfo: ProjectInfo,
  options: DeployOptions
): Promise<void> {
  console.log('🚀 Starting abapGit project deployment...');

  if (options.dryRun) {
    console.log('🔍 DRY RUN - No actual deployment will occur');
  }

  // Load abapGit plugin
  const { AbapGitPlugin } = await import(
    '../../../../../plugins/abapgit/dist/index.js'
  );
  const plugin = new AbapGitPlugin();

  console.log('📖 Reading abapGit project...');
  const projectData = await plugin.readProject(projectInfo.path);

  console.log(`📦 Found ${projectData.objects.length} objects to deploy:`);
  for (const obj of projectData.objects) {
    console.log(`  - ${obj.type}: ${obj.name}`);
  }

  if (options.dryRun) {
    console.log('✅ Dry run completed successfully');
    return;
  }

  // Load ADT client for deployment
  const { createAdtClient } = await import('@abapify/adt-client');
  const client = createAdtClient();

  // Create transport if needed
  let transportNumber = options.transport;
  if (!transportNumber) {
    console.log('🚛 Creating transport request...');
    const transport = await client.cts.createTransport({
      description: `abapGit deployment: ${projectInfo.path}`,
      type: 'workbench',
    });
    transportNumber = transport.number;
    console.log(`📋 Created transport: ${transportNumber}`);
  }

  // Deploy objects
  console.log('🔄 Deploying objects...');
  let deployedCount = 0;

  for (const obj of projectData.objects) {
    try {
      console.log(`⬆️  Deploying ${obj.type}: ${obj.name}...`);

      // Convert to ADK spec and deploy
      const result = await deployObject(client, obj, transportNumber, options);

      if (result.success) {
        deployedCount++;
        console.log(`✅ Successfully deployed ${obj.name}`);
      } else {
        console.log(
          `❌ Failed to deploy ${obj.name}: ${result.messages.join(', ')}`
        );
      }
    } catch (error) {
      console.error(
        `❌ Failed to deploy ${obj.name}:`,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  console.log(
    `🎉 Deployment completed: ${deployedCount}/${projectData.objects.length} objects deployed`
  );
  console.log(`🚛 Transport: ${transportNumber}`);
}

async function deployOatProject(
  projectInfo: ProjectInfo,
  options: DeployOptions
): Promise<void> {
  console.log('🚀 Starting OAT project deployment...');
  // Implementation for OAT projects would go here
  // This can reuse existing import/export logic but in reverse
  throw new Error('OAT project deployment not yet implemented');
}

async function deployObject(
  client: any,
  object: any,
  transportNumber: string,
  options: DeployOptions
): Promise<any> {
  // Convert object to ADK spec using existing plugin architecture
  const { ADKObjectLoader } = await import('./adk-loader.js');
  const loader = new ADKObjectLoader(client);

  const adkSpec = await loader.convertToAdkSpec(object);

  if (options.verbose) {
    console.log(
      `🔧 ADK Spec for ${object.name}:`,
      JSON.stringify(adkSpec, null, 2)
    );
  }

  // Deploy using ADT client
  return await client.objects.deployObject(adkSpec, {
    transport: transportNumber,
    package: options.package,
  });
}
