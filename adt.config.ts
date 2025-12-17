/**
 * ADT Configuration for abapify root
 * 
 * This config enables the codegen CLI commands when running from abapify root.
 * 
 * NOTE: Contract generation config is now in packages/adt-contracts/adt.config.ts
 * Run: npx nx run adt-contracts:generate-contracts
 */

export default {
  // CLI command plugins to load dynamically
  commands: [
    '@abapify/adt-codegen/commands/codegen',
  ],
};
