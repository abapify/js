/**
 * adt badi — BAdI / Enhancement Implementation (ENHO/XHH) commands
 *
 * Enhancement Implementations are RAP-era containers for BAdI
 * implementations. Full CRUD + activation exposed at
 * `/sap/bc/adt/enhancements/enhoxhh`. Source (the BAdI payload) is
 * served as text via `/source/main`.
 *
 * BAdI implementation metadata (the list of implementations, their
 * active/default flags and implementing classes) is exposed by SAP at
 * `/sap/bc/adt/enhancements/enhoxhb/{name}` and is surfaced by the
 * default `adt badi <name>` command with the `--implementations` flag.
 *
 * Usage:
 *   adt badi ZE_MY_BADI_IMPL
 *   adt badi ZE_MY_BADI_IMPL --implementations
 *   adt badi ZE_MY_BADI_IMPL --json
 *   adt badi create ZE_MY_BADI_IMPL "My BAdI impl" ZMYPKG
 *   adt badi read   ZE_MY_BADI_IMPL
 *   adt badi write  ZE_MY_BADI_IMPL impl.abap --transport DEVK900001
 *   adt badi activate ZE_MY_BADI_IMPL
 *   adt badi delete ZE_MY_BADI_IMPL --transport DEVK900001
 *
 * References:
 *   - sapcli: `sap/cli/badi.py` (list, set-active)
 *   - ARC-1: `src/adt/client.ts` `getEnhancementImplementation`
 */

import { AdkBadi } from '@abapify/adk';
import { getAdtClientV2 } from '../../utils/adt-client-v2';
import { getBadiInfo } from '../../services/badi';
import { buildObjectCrudCommands } from '../object/builder';

const badiCommand = buildObjectCrudCommands({
  label: 'BAdI / enhancement implementation',
  command: 'badi',

  get: (name) => AdkBadi.get(name),
  exists: (name) => AdkBadi.exists(name),
  create: (name, description, packageName, options) =>
    AdkBadi.create(name, description, packageName, options),
  delete: (name, options) => AdkBadi.delete(name, options),

  getSource: (obj) => obj.getSource(),
});

badiCommand
  .argument('[name]', 'BAdI / enhancement implementation name')
  .option(
    '--implementations',
    'List BAdI implementations carried by the enhancement implementation',
  )
  .option('--json', 'Output metadata and implementations as JSON')
  .action(
    async (
      name: string | undefined,
      options: { implementations?: boolean; json?: boolean },
    ) => {
      if (!name) {
        badiCommand.outputHelp();
        return;
      }

      const normalizedName = name.toUpperCase();

      try {
        const adtClient = await getAdtClientV2();
        const info = await getBadiInfo(adtClient, normalizedName);

        if (options.json) {
          console.log(JSON.stringify(info, null, 2));
          return;
        }

        console.log(`📦 BAdI / Enhancement Implementation: ${info.name}`);
        if (info.description) {
          console.log(`   Description: ${info.description}`);
        }
        if (info.package) {
          console.log(`   Package: ${info.package}`);
        }
        if (info.type) {
          console.log(`   Type: ${info.type}`);
        }
        if (info.technology) {
          console.log(`   Technology: ${info.technology}`);
        }
        console.log(
          `   Switch Supported: ${info.switchSupported ? 'Yes' : 'No'}`,
        );

        if (info.badiImplementations.length === 0) {
          console.log('   BAdI implementations: none');
        } else if (options.implementations) {
          console.log(
            `   BAdI implementations (${info.badiImplementations.length}):`,
          );
          for (const impl of info.badiImplementations) {
            const flags = [
              impl.active ? 'active' : 'inactive',
              impl.default ? 'default' : '',
              impl.example ? 'example' : '',
            ]
              .filter(Boolean)
              .join(', ');
            console.log(`     • ${impl.name} [${flags}]`);
            console.log(`       Implementing class: ${impl.implementingClass}`);
            console.log(`       BAdI definition: ${impl.badiDefinition}`);
            console.log(`       Enhancement spot: ${impl.enhancementSpot}`);
            if (impl.shortText) {
              console.log(`       Description: ${impl.shortText}`);
            }
          }
        } else {
          console.log(
            `   BAdI implementations: ${info.badiImplementations.length} (use --implementations to list)`,
          );
        }
      } catch (error) {
        console.error(
          '❌ Command failed:',
          error instanceof Error ? error.message : String(error),
        );
        process.exit(1);
      }
    },
  );

export { badiCommand };
