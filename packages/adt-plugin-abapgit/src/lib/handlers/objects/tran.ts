/**
 * TRAN (Transaction) object handler for abapGit format
 *
 * Transactions are XML-only (no source code). The abapGit format stores
 * the transaction code in TSTC, GUI attributes in TSTCC and texts in
 * the TSTCT table (wrapped in <item> elements).
 */

import { tran } from '../../../schemas/generated';
import { createHandler } from '../base';
import { isoToSapLang, sapLangToIso } from '../lang';

type TransactionLike = {
  name: string;
  description?: string;
  language?: string;
  masterLanguage?: string;
  programName?: string;
  dynproNumber?: string;
  transactionType?: string;
  guiAttributes?: {
    webGui?: boolean;
    platinumGui?: boolean;
    win32Gui?: boolean;
    macGui?: boolean;
  };
  texts?: Array<{
    language?: string;
    text?: string;
  }>;
};

export const transactionHandler = createHandler<TransactionLike, typeof tran>(
  'TRAN',
  {
    schema: tran,
    version: 'v1.0.0',
    serializer: 'LCL_OBJECT_TRAN',
    serializer_version: 'v1.0.0',

    toAbapGit: (obj) => {
      const texts = obj.texts ?? [];
      const gui = obj.guiAttributes;
      return {
        TSTC: {
          TCODE: String(obj.name ?? '').toUpperCase(),
          PGMNA: obj.programName ?? undefined,
          DYPNO: obj.dynproNumber ?? undefined,
          TYPE: obj.transactionType ?? undefined,
        },
        TSTCC: gui
          ? {
              TCODE: String(obj.name ?? '').toUpperCase(),
              S_WEBGUI: gui.webGui ? 'X' : undefined,
              S_PLATIN: gui.platinumGui ? 'X' : undefined,
              S_WIN32: gui.win32Gui ? 'X' : undefined,
              S_MAC: gui.macGui ? 'X' : undefined,
            }
          : undefined,
        TSTCT:
          texts.length > 0
            ? {
                item: texts.map((t) => ({
                  SPRSL: isoToSapLang(
                    t.language || obj.masterLanguage || obj.language,
                  ),
                  TCODE: String(obj.name ?? '').toUpperCase(),
                  TTEXT: t.text ?? '',
                })),
              }
            : undefined,
      };
    },

    fromAbapGit: ({ TSTC, TSTCC, TSTCT }) => {
      const textItems = normalizeItems(TSTCT?.item);
      return {
        name: (TSTC?.TCODE ?? '').toUpperCase(),
        type: 'TRAN/ST',
        description: textItems[0]?.TTEXT,
        language: sapLangToIso(textItems[0]?.SPRSL),
        masterLanguage: sapLangToIso(textItems[0]?.SPRSL),
        programName: TSTC?.PGMNA,
        dynproNumber: TSTC?.DYPNO,
        transactionType: TSTC?.TYPE,
        guiAttributes: TSTCC
          ? {
              webGui: TSTCC.S_WEBGUI === 'X',
              platinumGui: TSTCC.S_PLATIN === 'X',
              win32Gui: TSTCC.S_WIN32 === 'X',
              macGui: TSTCC.S_MAC === 'X',
            }
          : undefined,
        texts: textItems.map((t) => ({
          language: sapLangToIso(t.SPRSL),
          text: t.TTEXT,
        })),
      } as { name: string } & Record<string, unknown>;
    },
  },
);

function normalizeItems<T>(raw: T | T[] | undefined): T[] {
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}
