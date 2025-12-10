import { loadFormatPlugin } from '../../utils/format-loader';

/**
 * Options for importing a transport request
 */
export interface TransportImportOptions {
  /** Transport request number (e.g., 'DEVK900123') */
  transportNumber: string;
  /** Output directory for serialized files */
  outputPath: string;
  /** Filter by object types (e.g., ['CLAS', 'INTF']) - if not specified, imports all */
  objectTypes?: string[];
  /** Format plugin name or package (e.g., 'oat', '@abapify/oat') */
  format: string;
  /** Enable debug output */
  debug?: boolean;
}

/**
 * Options for importing a package
 */
export interface PackageImportOptions {
  /** Package name (e.g., 'Z_MY_PACKAGE') */
  packageName: string;
  /** Output directory for serialized files */
  outputPath: string;
  /** Filter by object types (e.g., ['CLAS', 'INTF']) - if not specified, imports all */
  objectTypes?: string[];
  /** Include subpackages */
  includeSubpackages?: boolean;
  /** Format plugin name or package (e.g., 'oat', '@abapify/oat') */
  format: string;
  /** Enable debug output */
  debug?: boolean;
}

/**
 * Result of an import operation
 */
export interface ImportResult {
  /** Transport number (for transport imports) */
  transportNumber?: string;
  /** Package name (for package imports) */
  packageName?: string;
  /** Description of the imported content */
  description: string;
  /** Total objects found */
  totalObjects: number;
  /** Statistics */
  results: {
    success: number;
    skipped: number;
    failed: number;
  };
  /** Objects by type */
  objectsByType: Record<string, number>;
  /** Output path */
  outputPath: string;
}

/**
 * Import Service - uses ADK architecture
 * 
 * Flow:
 * 1. Load format plugin (via CLI option or config)
 * 2. Fetch transport via AdkTransport.get() or package via AdkPackage.get()
 * 3. Load each object via objRef.load()
 * 4. Delegate serialization to format plugin
 */
export class ImportService {
  /**
   * Import objects from a transport request
   * 
   * @param options - Import options including transport number, output path, and format
   * @returns Import result with statistics
   */
  async importTransport(options: TransportImportOptions): Promise<ImportResult> {
    if (options.debug) {
      console.log(`🔍 Importing transport: ${options.transportNumber}`);
      console.log(`📁 Output path: ${options.outputPath}`);
      console.log(`🎯 Format: ${options.format}`);
    }

    // Load format plugin
    const plugin = await loadFormatPlugin(options.format);
    
    if (options.debug) {
      console.log(`✅ Loaded plugin: ${plugin.name}`);
    }
    
    // Import AdkTransport dynamically (ADK must be initialized before this)
    const { AdkTransport } = await import('@abapify/adk');
    
    // Fetch transport
    if (options.debug) {
      console.log(`🚛 Fetching transport: ${options.transportNumber}`);
    }
    const transport = await AdkTransport.get(options.transportNumber);
    
    // Filter by object types if specified
    let objectsToImport = transport.objects;
    if (options.objectTypes && options.objectTypes.length > 0) {
      const types = options.objectTypes.map(t => t.toUpperCase());
      objectsToImport = transport.getObjectsByType(...types);
      if (options.debug) {
        console.log(`🔍 Filtered to ${objectsToImport.length} objects by type: ${types.join(', ')}`);
      }
    }
    
    // Track results
    const results = { success: 0, skipped: 0, failed: 0 };
    const objectsByType: Record<string, number> = {};
    
    if (options.debug) {
      console.log(`📦 Processing ${objectsToImport.length} objects...`);
    }
    
    // Process each object
    for (const objRef of objectsToImport) {
      try {
        // Load the ADK object
        const adkObject = await objRef.load();
        
        if (!adkObject) {
          results.skipped++;
          continue;
        }
        
        // Delegate to plugin - import object from SAP to local files
        await plugin.instance.importObject(adkObject, options.outputPath);
        
        // Track statistics
        objectsByType[objRef.type] = (objectsByType[objRef.type] || 0) + 1;
        results.success++;
        
        if (options.debug) {
          console.log(`  ✅ ${objRef.type} ${objRef.name}`);
        }
      } catch (error) {
        results.failed++;
        if (options.debug) {
          console.log(`  ❌ ${objRef.type} ${objRef.name}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }
    
    return {
      transportNumber: options.transportNumber,
      description: transport.description,
      totalObjects: objectsToImport.length,
      results,
      objectsByType,
      outputPath: options.outputPath,
    };
  }

  /**
   * Import objects from an ABAP package
   * 
   * @param options - Import options including package name, output path, and format
   * @returns Import result with statistics
   */
  async importPackage(options: PackageImportOptions): Promise<ImportResult> {
    if (options.debug) {
      console.log(`🔍 Importing package: ${options.packageName}`);
      console.log(`📁 Output path: ${options.outputPath}`);
      console.log(`🎯 Format: ${options.format}`);
      console.log(`📦 Include subpackages: ${options.includeSubpackages ?? false}`);
    }

    // Load format plugin
    const plugin = await loadFormatPlugin(options.format);
    
    if (options.debug) {
      console.log(`✅ Loaded plugin: ${plugin.name}`);
    }
    
    // Import AdkPackage dynamically (ADK must be initialized before this)
    const { AdkPackage } = await import('@abapify/adk');
    
    // Fetch package
    if (options.debug) {
      console.log(`📦 Fetching package: ${options.packageName}`);
    }
    const pkg = await AdkPackage.get(options.packageName);
    
    // Get objects from package
    // TODO: ADK should support getObjects({ recursive: true }) instead of separate methods
    const allObjects = options.includeSubpackages 
      ? await pkg.getAllObjects()  // includes subpackages
      : await pkg.getObjects();    // direct objects only
    
    // Filter by object types if specified
    let objectsToImport = allObjects;
    if (options.objectTypes && options.objectTypes.length > 0) {
      const types = options.objectTypes.map(t => t.toUpperCase());
      objectsToImport = allObjects.filter((obj: { type: string }) => types.includes(obj.type));
      if (options.debug) {
        console.log(`🔍 Filtered to ${objectsToImport.length} objects by type: ${types.join(', ')}`);
      }
    }
    
    // Track results
    const results = { success: 0, skipped: 0, failed: 0 };
    const objectsByType: Record<string, number> = {};
    
    if (options.debug) {
      console.log(`📦 Processing ${objectsToImport.length} objects...`);
    }
    
    // Process each object - AbapObject has type and name
    for (const obj of objectsToImport) {
      try {
        // Delegate to plugin - import object from SAP to local files
        // Note: AbapObject from getObjects() may need to be loaded first
        await plugin.instance.importObject(obj, options.outputPath);
        
        // Track statistics
        objectsByType[obj.type] = (objectsByType[obj.type] || 0) + 1;
        results.success++;
        
        if (options.debug) {
          console.log(`  ✅ ${obj.type} ${obj.name}`);
        }
      } catch (error) {
        results.failed++;
        if (options.debug) {
          console.log(`  ❌ ${obj.type} ${obj.name}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }
    
    return {
      packageName: options.packageName,
      description: pkg.description || `Package ${options.packageName}`,
      totalObjects: objectsToImport.length,
      results,
      objectsByType,
      outputPath: options.outputPath,
    };
  }
}
