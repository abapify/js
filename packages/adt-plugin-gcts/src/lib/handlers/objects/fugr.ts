/**
 * FUGR (function group) handler for gCTS / AFF format.
 *
 * Projects ADK function group data to the AFF fugr-v1.json schema shape:
 *
 *   {
 *     formatVersion: "1",
 *     header: { description, originalLanguage, abapLanguageVersion? },
 *     fixPointArithmetic: boolean (required),
 *     status?
 *   }
 *
 * AFF's FUGR representation nests function modules under the group
 * directory. This plugin emits the group metadata only — per-module files
 * are produced by individual FUNC handlers once ADK exposes them.
 */

import { AdkFunctionGroup } from '@abapify/adk';
import { createHandler } from '../base';
import type { FugrAff } from '../../../schemas/generated';

export const functionGroupHandler = createHandler(AdkFunctionGroup, {
  toMetadata(fugr): FugrAff {
    const data = fugr.dataSync as Record<string, unknown>;
    const lang = (
      (data.language as string) ??
      (data.masterLanguage as string) ??
      ''
    ).toLowerCase();
    return {
      formatVersion: '1',
      header: {
        description: fugr.description ?? '',
        originalLanguage: lang,
      },
      fixPointArithmetic: data.fixPointArithmetic === true,
    };
  },

  fromMetadata: (meta: FugrAff) => ({
    name: '',
    description: meta.header.description,
    language: meta.header.originalLanguage?.toUpperCase(),
    masterLanguage: meta.header.originalLanguage?.toUpperCase(),
    fixPointArithmetic: meta.fixPointArithmetic,
  }),
});
