import type { AdkObject, AdkObjectConstructor } from './adk-object';
import type { AdtSchema } from '@abapify/adt-schemas';

/**
 * Generic factory to create ADK object classes
 *
 * Eliminates duplication by generating classes that follow the same pattern:
 * - Constructor takes data
 * - toAdtXml() serializes using schema
 * - static fromAdtXml() deserializes using schema
 *
 * @param kind - Object kind (e.g., "Class", "Interface")
 * @param schema - adt-schemas AdtSchema (e.g., ClassAdtSchema)
 * @returns Object class with constructor
 */
export function createAdkObject<T>(
  kind: string,
  schema: AdtSchema<T>
) {
  class AdkObjectImpl implements AdkObject {
    readonly kind = kind;

    constructor(private data: T) {}

    get name(): string {
      return (this.data as any).name || '';
    }

    get type(): string {
      return (this.data as any).type || '';
    }

    get description(): string | undefined {
      return (this.data as any).description;
    }

    /**
     * Get underlying data
     */
    getData(): T {
      return this.data;
    }

    /**
     * Serialize to ADT XML
     */
    toAdtXml(): string {
      return schema.toAdtXml(this.data, { xmlDecl: true });
    }

    /**
     * Create instance from ADT XML
     */
    static fromAdtXml(xml: string): AdkObjectImpl {
      const data = schema.fromAdtXml(xml);
      return new AdkObjectImpl(data);
    }
  }

  return AdkObjectImpl;
}
