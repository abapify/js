import type { AdkObject } from './adk-object';
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
export function createAdkObject<T extends { name?: unknown; type?: unknown; description?: unknown }>(
  kind: string,
  schema: AdtSchema<T>
) {
  class AdkObjectImpl implements AdkObject {
    readonly kind = kind;
    readonly data: T;

    constructor(data: T) {
      this.data = data;
    }

    get name(): string {
      return String(this.data.name ?? '');
    }

    get type(): string {
      return String(this.data.type ?? '');
    }

    get description(): string | undefined {
      return this.data.description ? String(this.data.description) : undefined;
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
