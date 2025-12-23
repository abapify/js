import { Command } from 'commander';

// TODO: Migrate to v2 client when lock/unlock contracts are available
// This command requires v1-specific features: searchObjectsDetailed, unlockObject
// See: docs/plans/active/2025-12-20-adt-cli-api-compatibility.md

async function unlockObject(objectName: string): Promise<void> {
  // Stub implementation - command needs migration to v2 client
  console.error(`❌ Unlock command is temporarily disabled pending v2 client migration.`);
  console.error(`   Object: ${objectName}`);
  console.error(`💡 Use SAP GUI transaction SE80 or SM12 to manage locks.`);
  process.exit(1);
}

export function createUnlockCommand(): Command {
  const command = new Command('unlock');

  command
    .description('Unlock a SAP object by name (temporarily disabled)')
    .argument(
      '<objectName>',
      'Name of the object to unlock (e.g., ZIF_PETSTORE)'
    )
    .option(
      '--lock-handle <handle>',
      'Specific lock handle to unlock (more reliable than generic unlock)'
    )
    .action(async (objectName: string) => {
      await unlockObject(objectName);
    });

  return command;
}
