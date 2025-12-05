/**
 * Factory for creating object serializers
 *
 * Provides a unified approach to creating abapGit serializers for ADK objects.
 * Each serializer needs:
 * - A mapper function to convert ADK object to abapGit structure
 * - A ts-xml schema for the abapGit values content
 * - A serializer class name for the XML
 */

import type { ElementSchema } from 'ts-xml';
import type { AdkObject } from '@abapify/adk';
import { buildAbapGitXml } from './shared-schema';

/**
 * Mapper function that converts an ADK object to abapGit structure
 */
export type ObjectMapper<TAdkObject extends AdkObject, TAbapGitValues> = (
  obj: TAdkObject
) => TAbapGitValues;

/**
 * Configuration for creating a serializer
 */
export interface SerializerConfig<
  TAdkObject extends AdkObject,
  TAbapGitValues
> {
  /** ts-xml schema for the abapGit values content */
  valuesSchema: ElementSchema;
  /** Mapper function to convert ADK object to abapGit structure */
  mapper: ObjectMapper<TAdkObject, TAbapGitValues>;
  /** Serializer class name for the abapGit XML (e.g., 'LCL_OBJECT_DEVC') */
  serializerClass: string;
}

/**
 * Wrap string values in { text: value } format required by ts-xml
 *
 * ts-xml expects text content to be wrapped as { text: 'value' } because
 * the schema defines text fields as: fields: { text: { kind: 'text' } }
 *
 * Exported for use in object serializers that need custom handling
 */
export function wrapTextFields(data: any): any {
  if (typeof data === 'string') {
    return { text: data };
  }
  if (Array.isArray(data)) {
    return data.map(wrapTextFields);
  }
  if (data && typeof data === 'object') {
    const wrapped: any = {};
    for (const [key, value] of Object.entries(data)) {
      wrapped[key] = wrapTextFields(value);
    }
    return wrapped;
  }
  return data;
}

/**
 * Create a serializer function for an ADK object type
 *
 * The mapper function can return plain values (strings, numbers) and this
 * utility will automatically wrap them in { text: value } format for ts-xml.
 *
 * @example
 * ```typescript
 * // Mapper returns plain values
 * function mapPackageToAbapGit(pkg: Package): DevcTable {
 *   return {
 *     CTEXT: pkg.getData().description,  // Plain string
 *     DEVCLASS: pkg.getData().name       // Plain string
 *   };
 * }
 *
 * export const serializePackage = createSerializer({
 *   valuesSchema: AbapGitDevcValuesSchema,
 *   mapper: mapPackageToAbapGit,
 *   serializerClass: 'LCL_OBJECT_DEVC'
 * });
 * ```
 */
export function createSerializer<TAdkObject extends AdkObject, TAbapGitValues>(
  config: SerializerConfig<TAdkObject, TAbapGitValues>
): (obj: TAdkObject) => string {
  return (obj: TAdkObject): string => {
    const valuesData = config.mapper(obj);
    // Wrap plain string values in { text: value } format for ts-xml
    const wrappedData = wrapTextFields(valuesData);
    return buildAbapGitXml(
      config.valuesSchema,
      wrappedData,
      config.serializerClass
    );
  };
}
