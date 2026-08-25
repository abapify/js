import { bdef } from '../../../schemas/generated';
import { createHandler, type SerializedFile } from '../base';
import { FormatMaterializationError } from '@abapify/adt-plugin';

interface DsfiDefinition {
  formatVersion: '1';
  header: {
    description: string;
    originalLanguage: string;
    abapLanguageVersion?: string;
  };
  scalarFunctionName: string;
  engine: 'analyticalEngine' | 'sqlEngine';
  sqlProperties?: { amdpReference: string; autoExposedInSqlServices?: boolean };
}

type DsfiLike = {
  name: string;
  getSource?: () => Promise<unknown> | unknown;
};

function parseDsfiDefinition(value: unknown): DsfiDefinition {
  let parsed: unknown;
  try {
    parsed = typeof value === 'string' ? JSON.parse(value) : value;
  } catch {
    throw new FormatMaterializationError(
      'FORMAT_SOURCE_COMPONENT_UNSUPPORTED',
      'DSFI source/main did not return valid JSON.',
    );
  }
  const candidate = parsed as Partial<DsfiDefinition> | undefined;
  if (
    !candidate ||
    candidate.formatVersion !== '1' ||
    typeof candidate.scalarFunctionName !== 'string' ||
    (candidate.engine !== 'analyticalEngine' &&
      candidate.engine !== 'sqlEngine') ||
    typeof candidate.header?.description !== 'string' ||
    typeof candidate.header?.originalLanguage !== 'string'
  ) {
    throw new FormatMaterializationError(
      'FORMAT_SOURCE_COMPONENT_UNSUPPORTED',
      'DSFI source/main did not return the required ABAP File Format JSON document.',
    );
  }
  return candidate as DsfiDefinition;
}

export const scalarFunctionImplementationHandler = createHandler<
  DsfiLike,
  typeof bdef
>('DSFI', {
  schema: bdef,
  version: 'v1.0.0',
  serializer: 'LCL_OBJECT_DSFI',
  serializer_version: 'v1.0.0',
  toAbapGit: (obj) => ({
    SKEY: { TYPE: 'DSFI', NAME: String(obj?.name ?? '').toUpperCase() },
  }),
  async serialize(object, ctx): Promise<SerializedFile[]> {
    const definition = parseDsfiDefinition(
      typeof object.getSource === 'function'
        ? await object.getSource()
        : undefined,
    );
    return [
      ctx.createFile(
        `${ctx.getObjectName(object)}.dsfi.json`,
        `${JSON.stringify(definition, null, 2)}\n`,
      ),
    ];
  },
});
