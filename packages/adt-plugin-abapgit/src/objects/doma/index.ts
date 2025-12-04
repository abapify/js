/**
 * DOMA (Domain) object serializer for abapGit format
 * Maps ADK v2 Domain objects to abapGit XML structure
 */

import type { AdkObject } from '@abapify/adk-v2';
import { Dd01vTableSchema, Dd07vTabSchema } from './schema';
import type { Dd01vTable, Dd07vEntry, Dd07vTab, DdicFixedValueType } from './types';
import { build } from 'ts-xml';
import { wrapTextFields } from '../../lib/create-serializer';

/**
 * Serialize ADK v2 Domain to abapGit XML
 *
 * Domains have TWO root elements under <asx:values>:
 * - DD01V (domain header)
 * - DD07V_TAB (fixed values table, optional)
 * 
 * Note: Domain doesn't have full ADK v2 support yet, using generic AdkObject
 */
export function serializeDomain(doma: AdkObject): string {
  // Access data synchronously - object should already be loaded
  const data = doma.dataSync as Record<string, any>;

  // Build DD01V (domain header)
  const dd01v: Dd01vTable = {
    DOMNAME: data.name || '',
    DDLANGUAGE: 'E',
    DDTEXT: data.description || '',
    DOMMASTER: 'E',
  };

  // Extract domain properties from nested content structure
  const typeInfo = data.content?.typeInformation;
  const outputInfo = data.content?.outputInformation;
  const valueInfo = data.content?.valueInformation;

  // Add data type info if available
  if (typeInfo?.datatype?.text) {
    dd01v.DATATYPE = typeInfo.datatype.text.toUpperCase();
  }

  // Add length info
  if (typeInfo?.length?.text) {
    dd01v.LENG = typeInfo.length.text;
    dd01v.OUTPUTLEN = outputInfo?.length?.text || typeInfo.length.text;
  }

  // Add decimals if specified and non-zero
  if (typeInfo?.decimals?.text && typeInfo.decimals.text !== '000000') {
    dd01v.DECIMALS = typeInfo.decimals.text;
  }

  // Add conversion exit if specified
  if (outputInfo?.conversionExit?.text) {
    dd01v.CONVEXIT = outputInfo.conversionExit.text;
  }

  // Add value table if specified
  if (valueInfo?.valueTableRef?.text) {
    dd01v.ENTITYTAB = valueInfo.valueTableRef.text;
  }

  // Mark if domain has fixed values
  if (
    valueInfo?.fixValues?.fixValue &&
    valueInfo.fixValues.fixValue.length > 0
  ) {
    dd01v.VALEXI = 'X';
  }

  // Wrap text fields for ts-xml
  const wrappedDd01v = wrapTextFields(dd01v);

  // Build DD01V XML (without XML declaration)
  const dd01vXml = build(Dd01vTableSchema, wrappedDd01v, { xmlDecl: false });

  // Check if domain has fixed values
  if (
    valueInfo?.fixValues?.fixValue &&
    valueInfo.fixValues.fixValue.length > 0
  ) {
    // Build DD07V_TAB
    const dd07vEntries: Dd07vEntry[] = valueInfo.fixValues.fixValue.map(
      (fv: DdicFixedValueType, index: number) => {
        const entry: Dd07vEntry = {
          VALPOS: fv.position?.text || String(index + 1).padStart(4, '0'),
          DDLANGUAGE: 'E',
        };

        if (fv.low?.text) {
          entry.DOMVALUE_L = fv.low.text;
        }
        if (fv.high?.text) {
          entry.DOMVALUE_H = fv.high.text;
        }
        if (fv.text?.text) {
          entry.DDTEXT = fv.text.text;
        }

        return entry;
      }
    );

    const dd07vTab: Dd07vTab = {
      DD07V: dd07vEntries,
    };

    // Wrap text fields for ts-xml
    const wrappedDd07vTab = wrapTextFields(dd07vTab);

    // Build DD07V_TAB XML (without XML declaration)
    const dd07vTabXml = build(Dd07vTabSchema, wrappedDd07vTab, {
      xmlDecl: false,
    });

    // Manually construct the abapGit envelope with both root elements
    return `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DOMA" serializer_version="v1.0.0"><asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0"><asx:values>${dd01vXml}${dd07vTabXml}</asx:values></asx:abap></abapGit>`;
  }

  // Domain without fixed values - only DD01V
  return `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DOMA" serializer_version="v1.0.0"><asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0"><asx:values>${dd01vXml}</asx:values></asx:abap></abapGit>`;
}
