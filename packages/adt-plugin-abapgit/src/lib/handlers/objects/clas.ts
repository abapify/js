/**
 * Class (CLAS) object handler for abapGit format
 */

import { AdkClass, type ClassIncludeType } from '../adk';
import { clas } from '../schemas';
import { createHandler } from '../base';

/**
 * Map ADK ClassIncludeType to abapGit file suffix convention
 */
const ABAPGIT_SUFFIX: Record<ClassIncludeType, string | undefined> = {
  main: undefined, // main has no suffix
  definitions: 'locals_def',
  implementations: 'locals_imp',
  localtypes: 'locals_types',
  macros: 'macros',
  testclasses: 'testclasses',
};

export const classHandler = createHandler(AdkClass, {
  schema: clas,
  version: 'v1.0.0',
  serializer: 'LCL_OBJECT_CLAS',
  serializer_version: 'v1.0.0',

  toAbapGit: (cls) => {
    const hasTestClasses = cls.includes.some((inc) => inc.includeType === 'testclasses');

    return {
      VSEOCLASS: {
        CLSNAME: cls.name ?? '',
        LANGU: 'E',
        DESCRIPT: cls.description ?? '',
        STATE: '1',
        CLSCCINCL: 'X',
        FIXPT: 'X',
        UNICODE: 'X',
        ...(hasTestClasses ? { WITH_UNIT_TESTS: 'X' } : {}),
      },
    };
  },

  getSources: (cls) =>
    cls.includes.map((inc) => ({
      suffix: ABAPGIT_SUFFIX[inc.includeType],
      content: cls.getIncludeSource(inc.includeType),
    })),
});
