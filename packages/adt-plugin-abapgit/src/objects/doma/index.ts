/**
 * DOMA (Domain) object serializer for abapGit format
 * Maps ADK v2 Domain objects to abapGit XML structure
 */

import type { AdkObject } from '@abapify/adk';
import { doma } from '../../schemas/generated';
import { buildAbapGitEnvelope } from '../../lib/shared-schema';
import type { DdicFixedValueType } from './types';

/**
 * Serialize ADK v2 Domain to abapGit XML
 *
 * Domains have TWO root elements under <asx:values>:
 * - DD01V (domain header)
 * - DD07V_TAB (fixed values table, optional)
 * 
 * Note: Domain doesn't have full ADK v2 support yet, using generic AdkObject
 */
export function serializeDomain(domaObj: AdkObject): string {
  // Access data synchronously - object should already be loaded
  const adkData = domaObj.dataSync as Record<string, any>;

  // Extract domain properties from nested content structure
  const typeInfo = adkData.content?.typeInformation;
  const outputInfo = adkData.content?.outputInformation;
  const valueInfo = adkData.content?.valueInformation;

  // Check if domain has fixed values
  const hasFixedValues = valueInfo?.fixValues?.fixValue && valueInfo.fixValues.fixValue.length > 0;

  // Build DD01V data
  const dd01vData: Record<string, string | undefined> = {
    DOMNAME: adkData.name,
    DDLANGUAGE: 'E',
    DDTEXT: adkData.description,
    DOMMASTER: 'E',
  };

  // Add data type info if available
  if (typeInfo?.datatype?.text) {
    dd01vData.DATATYPE = typeInfo.datatype.text.toUpperCase();
  }

  // Add length info
  if (typeInfo?.length?.text) {
    dd01vData.LENG = typeInfo.length.text;
    dd01vData.OUTPUTLEN = outputInfo?.length?.text || typeInfo.length.text;
  }

  // Add decimals if specified and non-zero
  if (typeInfo?.decimals?.text && typeInfo.decimals.text !== '000000') {
    dd01vData.DECIMALS = typeInfo.decimals.text;
  }

  // Add conversion exit if specified
  if (outputInfo?.conversionExit?.text) {
    dd01vData.CONVEXIT = outputInfo.conversionExit.text;
  }

  // Add value table if specified
  if (valueInfo?.valueTableRef?.text) {
    dd01vData.ENTITYTAB = valueInfo.valueTableRef.text;
  }

  // Mark if domain has fixed values
  if (hasFixedValues) {
    dd01vData.VALEXI = 'X';
  }

  // Use ts-xsd schema to build DD01V
  const dd01vXml = doma.build(dd01vData);

  // Build DD07V_TAB if domain has fixed values (manual - multiple root elements)
  let dd07vTabXml = '';
  if (hasFixedValues) {
    const dd07vEntries = valueInfo.fixValues.fixValue.map(
      (fv: DdicFixedValueType, index: number) => {
        const parts: string[] = [];
        parts.push(`<VALPOS>${fv.position?.text || String(index + 1).padStart(4, '0')}</VALPOS>`);
        parts.push(`<DDLANGUAGE>E</DDLANGUAGE>`);
        if (fv.low?.text) parts.push(`<DOMVALUE_L>${fv.low.text}</DOMVALUE_L>`);
        if (fv.high?.text) parts.push(`<DOMVALUE_H>${fv.high.text}</DOMVALUE_H>`);
        if (fv.text?.text) parts.push(`<DDTEXT>${fv.text.text}</DDTEXT>`);
        return `<DD07V>${parts.join('')}</DD07V>`;
      }
    );
    dd07vTabXml = `<DD07V_TAB>${dd07vEntries.join('')}</DD07V_TAB>`;
  }

  return buildAbapGitEnvelope(dd01vXml + dd07vTabXml, 'LCL_OBJECT_DOMA');
}
