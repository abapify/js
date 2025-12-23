import { Command } from 'commander';

// TODO: Migrate to v2 client when lock/unlock contracts are available
// This command requires v1-specific features: searchObjectsDetailed, lockObject
// See: docs/plans/active/2025-12-20-adt-cli-api-compatibility.md

async function lockObject(objectName: string): Promise<void> {
  // Stub implementation - command needs migration to v2 client
  console.error(`❌ Lock command is temporarily disabled pending v2 client migration.`);
  console.error(`   Object: ${objectName}`);
  console.error(`💡 Use SAP GUI transaction SE80 or SM12 to manage locks.`);
  process.exit(1);
}

export function createLockCommand(): Command {
  const command = new Command('lock');

  command
    .description('Lock a SAP object by name (temporarily disabled)')
    .argument('<objectName>', 'Name of the object to lock (e.g., ZIF_PETSTORE)')
    .action(async (objectName: string) => {
      await lockObject(objectName);
    });

  return command;
}
