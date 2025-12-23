import { Command } from 'commander';

// TODO: Migrate to v2 client when outline contracts are available
// This command requires v1-specific features: searchObjectsDetailed, ObjectRegistry
// See: docs/plans/active/2025-12-20-adt-cli-api-compatibility.md

export const outlineCommand = new Command('outline')
  .argument('<objectName>', 'ABAP object name to show outline for')
  .description('Show object structure outline (temporarily disabled)')
  .action(async (objectName: string) => {
    // Stub implementation - command needs migration to v2 client
    console.error(`❌ Outline command is temporarily disabled pending v2 client migration.`);
    console.error(`   Object: ${objectName}`);
    console.error(`💡 Use SAP GUI SE80 or ADT Eclipse to view object outlines.`);
    process.exit(1);
  });
