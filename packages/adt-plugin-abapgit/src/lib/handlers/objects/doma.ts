/**
 * Domain (DOMA) object handler for abapGit format
 * 
 * Note: Domain doesn't have full ADK v2 support yet, using string type
 */

import type { AdkObject } from '../adk';
import { doma } from '../schemas';
import { createHandler } from '../base';

/**
 * DDIC Fixed Value type (from domain content)
 */
interface DdicFixedValueType {
  position?: { text?: string };
  low?: { text?: string };
  high?: { text?: string };
  text?: { text?: string };
}

/**
 * Build DD07V_TAB XML for fixed values
 */
function buildFixedValuesXml(data: Record<string, unknown>): string {
  const content = data.content as Record<string, unknown> | undefined;
  const valueInfo = content?.valueInformation as Record<string, unknown> | undefined;
  const fixValues = valueInfo?.fixValues as Record<string, unknown> | undefined;
  const fixValueArray = fixValues?.fixValue as DdicFixedValueType[] | undefined;

  if (!fixValueArray || fixValueArray.length === 0) {
    return '';
  }

  const dd07vEntries = fixValueArray.map((fv, index) => {
    const parts: string[] = [];
    parts.push(`<VALPOS>${fv.position?.text ?? String(index + 1).padStart(4, '0')}</VALPOS>`);
    parts.push(`<DDLANGUAGE>E</DDLANGUAGE>`);
    if (fv.low?.text) parts.push(`<DOMVALUE_L>${fv.low.text}</DOMVALUE_L>`);
    if (fv.high?.text) parts.push(`<DOMVALUE_H>${fv.high.text}</DOMVALUE_H>`);
    if (fv.text?.text) parts.push(`<DDTEXT>${fv.text.text}</DDTEXT>`);
    return `<DD07V>${parts.join('')}</DD07V>`;
  });
  return `<DD07V_TAB>${dd07vEntries.join('')}</DD07V_TAB>`;
}

export const domainHandler = createHandler('DOMA', {
  schema: doma,

  toAbapGit: (obj: AdkObject) => {
    const adkData = obj.dataSync as Record<string, unknown>;
    const content = adkData.content as Record<string, unknown> | undefined;
    const typeInfo = content?.typeInformation as Record<string, unknown> | undefined;
    const outputInfo = content?.outputInformation as Record<string, unknown> | undefined;
    const valueInfo = content?.valueInformation as Record<string, unknown> | undefined;

    // Check if domain has fixed values
    const fixValues = valueInfo?.fixValues as Record<string, unknown> | undefined;
    const fixValueArray = fixValues?.fixValue as DdicFixedValueType[] | undefined;
    const hasFixedValues = fixValueArray && fixValueArray.length > 0;

    // Build DD01V data
    const dd01vData: Record<string, string | undefined> = {
      DOMNAME: adkData.name as string,
      DDLANGUAGE: 'E',
      DDTEXT: adkData.description as string,
      DOMMASTER: 'E',
    };

    // Add data type info if available
    const datatype = typeInfo?.datatype as Record<string, string> | undefined;
    if (datatype?.text) {
      dd01vData.DATATYPE = datatype.text.toUpperCase();
    }

    // Add length info
    const length = typeInfo?.length as Record<string, string> | undefined;
    const outputLength = outputInfo?.length as Record<string, string> | undefined;
    if (length?.text) {
      dd01vData.LENG = length.text;
      dd01vData.OUTPUTLEN = outputLength?.text ?? length.text;
    }

    // Add decimals if specified and non-zero
    const decimals = typeInfo?.decimals as Record<string, string> | undefined;
    if (decimals?.text && decimals.text !== '000000') {
      dd01vData.DECIMALS = decimals.text;
    }

    // Add conversion exit if specified
    const conversionExit = outputInfo?.conversionExit as Record<string, string> | undefined;
    if (conversionExit?.text) {
      dd01vData.CONVEXIT = conversionExit.text;
    }

    // Add value table if specified
    const valueTableRef = valueInfo?.valueTableRef as Record<string, string> | undefined;
    if (valueTableRef?.text) {
      dd01vData.ENTITYTAB = valueTableRef.text;
    }

    // Mark if domain has fixed values
    if (hasFixedValues) {
      dd01vData.VALEXI = 'X';
    }

    return dd01vData;
  },

  // Custom serialize to handle DD01V + DD07V_TAB
  serialize: async (object, ctx) => {
    const objectName = ctx.getObjectName(object);
    const data = ctx.getData(object);
    
    // Build DD01V using schema + DD07V_TAB for fixed values
    const dd01vXml = ctx.toAbapGitXml(object);
    const fixedValuesXml = buildFixedValuesXml(data);
    
    return [ctx.createFile(`${objectName}.doma.xml`, dd01vXml + fixedValuesXml)];
  },
});
