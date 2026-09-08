/**
 * DTEL (data element) handler for gCTS / AFF format.
 *
 * Projects ADK data element data to the AFF dtel-v1.json schema shape:
 *
 *   {
 *     formatVersion: "1",
 *     header: { description, originalLanguage, abapLanguageVersion? },
 *     dataTypeInformation: { domainName? } | { predefinedType: { dataType, length?, decimals? } },
 *     fieldLabels?: { short, shortLength, medium, mediumLength, long, longLength, heading, headingLength }
 *   }
 */

import { AdkDataElement } from '@abapify/adk';
import { createHandler } from '../base';
import type { DtelAff } from '../../../schemas/generated';

export const dataElementHandler = createHandler(AdkDataElement, {
  toMetadata(dtel): DtelAff {
    const data = dtel.dataSync as Record<string, unknown>;
    const lang = (
      (data.language as string) ??
      (data.masterLanguage as string) ??
      ''
    ).toLowerCase();

    // dataTypeInformation: domainName or predefinedType
    const dataTypeInformation: Record<string, unknown> = {};
    const typeKind = data.typeKind as string | undefined;

    if (typeKind === 'domain' && data.typeName) {
      dataTypeInformation.domainName = data.typeName;
    } else if (data.dataType) {
      const predefinedType: Record<string, unknown> = {
        dataType: data.dataType,
      };
      if (typeof data.dataTypeLength === 'number') {
        predefinedType.length = data.dataTypeLength;
      }
      if (typeof data.dataTypeDecimals === 'number') {
        predefinedType.decimals = data.dataTypeDecimals;
      }
      dataTypeInformation.predefinedType = predefinedType;
    }

    // fieldLabels
    const fieldLabels: Record<string, unknown> = {};
    if (data.shortFieldLabel) {
      fieldLabels.short = data.shortFieldLabel;
      if (typeof data.shortFieldLength === 'number')
        fieldLabels.shortLength = data.shortFieldLength;
    }
    if (data.mediumFieldLabel) {
      fieldLabels.medium = data.mediumFieldLabel;
      if (typeof data.mediumFieldLength === 'number')
        fieldLabels.mediumLength = data.mediumFieldLength;
    }
    if (data.longFieldLabel) {
      fieldLabels.long = data.longFieldLabel;
      if (typeof data.longFieldLength === 'number')
        fieldLabels.longLength = data.longFieldLength;
    }
    if (data.headingFieldLabel) {
      fieldLabels.heading = data.headingFieldLabel;
      if (typeof data.headingFieldLength === 'number')
        fieldLabels.headingLength = data.headingFieldLength;
    }

    const result: Record<string, unknown> = {
      formatVersion: '1',
      header: {
        description: dtel.description ?? '',
        originalLanguage: lang,
      },
      dataTypeInformation,
    };
    if (Object.keys(fieldLabels).length > 0) {
      result.fieldLabels = fieldLabels;
    }

    return result as DtelAff;
  },

  fromMetadata: (meta: DtelAff) => {
    const dti = meta.dataTypeInformation ?? {};
    const result: Record<string, unknown> = {
      name: '',
      description: meta.header.description,
      language: meta.header.originalLanguage?.toUpperCase(),
      masterLanguage: meta.header.originalLanguage?.toUpperCase(),
    };
    if (dti.domainName) {
      result.typeKind = 'domain';
      result.typeName = dti.domainName;
    } else if (dti.predefinedType) {
      result.typeKind = 'predefinedAbapType';
      result.dataType = dti.predefinedType.dataType;
      result.dataTypeLength = dti.predefinedType.length;
      result.dataTypeDecimals = dti.predefinedType.decimals;
    }
    const fl = meta.fieldLabels;
    if (fl) {
      result.shortFieldLabel = fl.short;
      result.shortFieldLength = fl.shortLength;
      result.mediumFieldLabel = fl.medium;
      result.mediumFieldLength = fl.mediumLength;
      result.longFieldLabel = fl.long;
      result.longFieldLength = fl.longLength;
      result.headingFieldLabel = fl.heading;
      result.headingFieldLength = fl.headingLength;
    }
    return result as { name: string } & Record<string, unknown>;
  },
});
