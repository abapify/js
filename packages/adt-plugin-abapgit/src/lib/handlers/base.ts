/**
 * Handler Factory for abapGit object serialization
 * 
 * Provides `createHandler` factory for creating object handlers.
 * Handlers auto-register when created.
 */

import type { AdkObject, AdkKind } from '@abapify/adk';
import { getTypeForKind } from '@abapify/adk';

/**
 * ADK object class type
 * Used to pass ADK classes to createHandler
 * 
 * We use `any[]` for constructor args since we only need the static `kind` property,
 * not to actually instantiate the class.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AdkObjectClass<T extends AdkObject = AdkObject> = {
  new (...args: any[]): T;
  readonly kind: AdkKind;
};

// ============================================
// Handler Types
// ============================================

/**
 * ABAP object type code (e.g., 'CLAS', 'INTF', 'DOMA')
 */
export type AbapObjectType = string;

/**
 * Result of serializing a single file
 */
export interface SerializedFile {
  /** Relative path from object directory */
  path: string;
  /** File content */
  content: string;
  /** Optional encoding (default: utf-8) */
  encoding?: BufferEncoding;
}

/**
 * Handler interface for object serialization
 */
export interface ObjectHandler<T extends AdkObject = AdkObject> {
  /** ABAP object type (e.g., 'CLAS', 'INTF') */
  readonly type: AbapObjectType;
  /** File extension for this type (e.g., 'clas', 'intf') */
  readonly fileExtension: string;
  /** Serialize object to files */
  serialize(object: T): Promise<SerializedFile[]>;
}

/**
 * ts-xsd schema interface
 * 
 * TODO: Generated schemas are raw XSD definitions without build().
 * The build() is provided by ts-xsd runtime. For now, we use `any`
 * until we properly integrate ts-xsd runtime wrapper.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type XsdSchema<TData = unknown> = any;

// ============================================
// Global Handler Registry
// ============================================

const handlerRegistry = new Map<AbapObjectType, ObjectHandler>();

/**
 * Get handler for object type
 */
export function getHandler(type: AbapObjectType): ObjectHandler | undefined {
  return handlerRegistry.get(type);
}

/**
 * Check if object type is supported
 */
export function isSupported(type: AbapObjectType): boolean {
  return handlerRegistry.has(type);
}

/**
 * Get all supported object types
 */
export function getSupportedTypes(): AbapObjectType[] {
  return [...handlerRegistry.keys()];
}

// ============================================
// Handler Factory
// ============================================

/**
 * Handler definition passed to createHandler
 */
export interface HandlerDefinition<T extends AdkObject, TAbapGit = unknown> {
  /** ts-xsd schema for XML generation */
  schema: XsdSchema<TAbapGit>;
  
  /** Convert ADK object to abapGit schema format */
  toAbapGit(object: T): TAbapGit;
  
  /** 
   * Custom filename for XML file (optional)
   * Default: `${objectName}.${type}.xml`
   * 
   * @example 'package.devc.xml' for DEVC which doesn't use object name
   */
  xmlFileName?: string | ((object: T, ctx: HandlerContext<T, TAbapGit>) => string);
  
  /**
   * Get source code from object (optional)
   * If provided, default serialize will create both .abap and .xml files
   * 
   * @example getSource: (obj) => obj.getSource()
   */
  getSource?(object: T): Promise<string>;
  
  /**
   * Get multiple source files from object (optional)
   * For objects with multiple source files (e.g., CLAS with includes)
   * Returns array of { suffix?, content } or promises - resolved automatically
   * 
   * @example getSources: (cls) => cls.includes.map((inc) => ({
   *   suffix: SUFFIX_MAP[inc.includeType],
   *   content: cls.getIncludeSource(inc.includeType),
   * }))
   */
  getSources?(object: T): Array<{ suffix?: string; content: string | Promise<string> }>;
  
  /** 
   * Serialize object to files (optional)
   * Default behavior:
   * - If getSources provided: creates multiple .abap + .xml files
   * - If getSource provided: creates single .abap + .xml files
   * - Otherwise: creates only .xml file
   * 
   * Override only for very custom serialization logic
   */
  serialize?(object: T, ctx: HandlerContext<T, TAbapGit>): Promise<SerializedFile[]>;
}

/**
 * Context passed to serialize function with helper utilities
 */
export interface HandlerContext<T extends AdkObject, TAbapGit = unknown> {
  /** ABAP object type */
  readonly type: AbapObjectType;
  /** File extension (lowercase type) */
  readonly fileExtension: string;
  
  /** Get object name in lowercase */
  getObjectName(object: T): string;
  /** Get object data synchronously */
  getData(object: T): Record<string, unknown>;
  /** Resolve lazy content */
  resolveContent(content: unknown): Promise<string>;
  
  /** Convert to abapGit XML using schema */
  toAbapGitXml(object: T): string;
  
  /** Create a file entry */
  createFile(path: string, content: string, encoding?: BufferEncoding): SerializedFile;
  /** Create XML metadata file */
  createXmlFile(objectName: string, xmlContent: string): SerializedFile;
  /** Create ABAP source file */
  createAbapFile(objectName: string, content: string, suffix?: string): SerializedFile;
}

/**
 * Create an object handler from ADK class
 */
export function createHandler<T extends AdkObject, TAbapGit = unknown>(
  adkClass: AdkObjectClass<T>,
  definition: HandlerDefinition<T, TAbapGit>
): ObjectHandler<T>;

/**
 * Create an object handler from ABAP type string
 * Use this for object types without ADK class (e.g., DTEL, DOMA)
 */
export function createHandler<T extends AdkObject = AdkObject, TAbapGit = unknown>(
  type: AbapObjectType,
  definition: HandlerDefinition<T, TAbapGit>
): ObjectHandler<T>;

/**
 * Create an object handler
 * 
 * @param adkClassOrType - ADK object class or ABAP type string
 * @param definition - Handler definition with schema, toAbapGit, serialize
 * @returns ObjectHandler that is auto-registered
 * 
 * @example
 * ```typescript
 * // With ADK class (preferred)
 * import { AdkPackage } from '@abapify/adk';
 * export const packageHandler = createHandler(AdkPackage, { ... });
 * 
 * // With ABAP type string (for objects without ADK class)
 * export const dataElementHandler = createHandler('DTEL', { ... });
 * ```
 */
export function createHandler<T extends AdkObject, TAbapGit = unknown>(
  adkClassOrType: AdkObjectClass<T> | AbapObjectType,
  definition: HandlerDefinition<T, TAbapGit>
): ObjectHandler<T> {
  // Determine ABAP type
  let type: AbapObjectType;
  
  if (typeof adkClassOrType === 'string') {
    // Direct ABAP type string
    type = adkClassOrType;
  } else {
    // ADK class - derive from static kind
    const kind = adkClassOrType.kind;
    const derivedType = getTypeForKind(kind);
    if (!derivedType) {
      throw new Error(`Unknown ADK kind: ${kind}. Make sure the ADK class has a static 'kind' property.`);
    }
    type = derivedType;
  }
  
  const fileExtension = type.toLowerCase();
  
  // Create handler context with utilities
  const ctx: HandlerContext<T, TAbapGit> = {
    type,
    fileExtension,
    
    getObjectName(object: T): string {
      return object.name.toLowerCase();
    },
    
    getData(object: T): Record<string, unknown> {
      return object.dataSync as Record<string, unknown>;
    },
    
    async resolveContent(content: unknown): Promise<string> {
      if (!content) return '';
      if (typeof content === 'string') return content;
      if (typeof content === 'function') return await content();
      return '';
    },
    
    toAbapGitXml(object: T): string {
      const data = definition.toAbapGit(object);
      return definition.schema.build(data);
    },
    
    createFile(path: string, content: string, encoding?: BufferEncoding): SerializedFile {
      return { path, content, encoding };
    },
    
    createXmlFile(objectName: string, xmlContent: string): SerializedFile {
      return { path: `${objectName}.${fileExtension}.xml`, content: xmlContent };
    },
    
    createAbapFile(objectName: string, content: string, suffix?: string): SerializedFile {
      const fileName = suffix
        ? `${objectName}.${fileExtension}.${suffix}.abap`
        : `${objectName}.${fileExtension}.abap`;
      return { path: fileName, content };
    },
  };
  
  // Default serialize
  const defaultSerialize = async (object: T): Promise<SerializedFile[]> => {
    const objectName = ctx.getObjectName(object);
    const files: SerializedFile[] = [];
    
    // Add source files
    if (definition.getSources) {
      // Multiple source files (e.g., CLAS with includes)
      // Resolve all promises in parallel
      const rawSources = definition.getSources(object);
      const sources = await Promise.all(
        rawSources.map(async ({ suffix, content }) => ({
          suffix,
          content: await content,
        }))
      );
      for (const { suffix, content } of sources) {
        if (content) {
          files.push(ctx.createAbapFile(objectName, content, suffix));
        }
      }
    } else if (definition.getSource) {
      // Single source file (e.g., INTF)
      const source = await definition.getSource(object);
      files.push(ctx.createAbapFile(objectName, source));
    }
    
    // Add XML metadata file
    const xmlContent = ctx.toAbapGitXml(object);
    let xmlFileName: string;
    if (definition.xmlFileName) {
      xmlFileName = typeof definition.xmlFileName === 'function'
        ? definition.xmlFileName(object, ctx)
        : definition.xmlFileName;
    } else {
      xmlFileName = `${objectName}.${fileExtension}.xml`;
    }
    files.push(ctx.createFile(xmlFileName, xmlContent));
    
    return files;
  };

  // Create handler object
  const handler: ObjectHandler<T> = {
    type,
    fileExtension,
    serialize: definition.serialize 
      ? (object: T) => definition.serialize!(object, ctx)
      : defaultSerialize,
  };
  
  // Auto-register
  handlerRegistry.set(type, handler as ObjectHandler);
  
  return handler;
}
