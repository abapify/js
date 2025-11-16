import type { AdkObject } from '../base/adk-object';
import { adtcore, type AdtCoreFields } from '@abapify/adt-schemas';

/**
 * Generic ABAP object - fallback for unsupported types
 *
 * Provides basic ADT core functionality for any object type.
 * Used when specific object class is not registered in ObjectRegistry.
 */
export class GenericAbapObject implements AdkObject {
  constructor(private data: AdtCoreFields) {}

  get kind(): string {
    return 'Generic';
  }

  get name(): string {
    return this.data.name;
  }

  get type(): string {
    return this.data.type;
  }

  get description(): string | undefined {
    return this.data.description;
  }

  /**
   * Serialize to ADT XML format using adtcore schema
   */
  toAdtXml(): string {
    // Use adtcore schema with only core fields
    const schema = adtcore.schema<AdtCoreFields>({
      name: adtcore.attr('name'),
      type: adtcore.attr('type'),
      uri: adtcore.attr('uri', { optional: true }),
      version: adtcore.attr('version', { optional: true }),
      description: adtcore.attr('description', { optional: true }),
      descriptionTextLimit: adtcore.attr('descriptionTextLimit', { optional: true }),
      language: adtcore.attr('language', { optional: true }),
      masterLanguage: adtcore.attr('masterLanguage', { optional: true }),
      masterSystem: adtcore.attr('masterSystem', { optional: true }),
      abapLanguageVersion: adtcore.attr('abapLanguageVersion', { optional: true }),
      responsible: adtcore.attr('responsible', { optional: true }),
      changedBy: adtcore.attr('changedBy', { optional: true }),
      createdBy: adtcore.attr('createdBy', { optional: true }),
      changedAt: adtcore.attr('changedAt', { optional: true }),
      createdAt: adtcore.attr('createdAt', { optional: true }),
    });

    return schema.toAdtXml(this.data, { xmlDecl: true });
  }

  /**
   * Create instance from ADT XML string
   */
  static fromAdtXml(xml: string): GenericAbapObject {
    // Use adtcore schema to parse
    const schema = adtcore.schema<AdtCoreFields>({
      name: adtcore.attr('name'),
      type: adtcore.attr('type'),
      uri: adtcore.attr('uri', { optional: true }),
      version: adtcore.attr('version', { optional: true }),
      description: adtcore.attr('description', { optional: true }),
      descriptionTextLimit: adtcore.attr('descriptionTextLimit', { optional: true }),
      language: adtcore.attr('language', { optional: true }),
      masterLanguage: adtcore.attr('masterLanguage', { optional: true }),
      masterSystem: adtcore.attr('masterSystem', { optional: true }),
      abapLanguageVersion: adtcore.attr('abapLanguageVersion', { optional: true }),
      responsible: adtcore.attr('responsible', { optional: true }),
      changedBy: adtcore.attr('changedBy', { optional: true }),
      createdBy: adtcore.attr('createdBy', { optional: true }),
      changedAt: adtcore.attr('changedAt', { optional: true }),
      createdAt: adtcore.attr('createdAt', { optional: true }),
    });

    const data = schema.fromAdtXml(xml);
    return new GenericAbapObject(data);
  }
}
